import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import { Category } from "../models/Category.js";
import { Tool } from "../models/Tool.js";
import { createSlug } from "../utils/createSlug.js";

const APPLY_CHANGES = process.argv.includes("--apply");
const REPORT_PATH = path.join(process.cwd(), "tmp", "tool-audit-report.json");
const CONCURRENCY = 12;
const FETCH_TIMEOUT_MS = 12000;
const removableStatusCodes = new Set([410]);
const reviewStatusCodes = new Set([401, 403, 404, 429, 451, 500, 502, 503, 504, 521, 522, 523, 524, 525]);

const strongParkedSignals = [
  "domain for sale",
  "buy this domain",
  "this domain is for sale",
  "parked domain",
  "sedo",
  "hugedomains",
  "afternic",
  "parkingcrew",
  "default web site page",
  "account suspended",
  "domain not supported",
];

const unrelatedSpamSignals = [
  "casino",
  "sportsbook",
  "betting",
  "bong88",
  "viva88",
  "kubet",
  "hello88",
  "slot game",
  "xổ số",
];

const aiSignals = [
  " ai ",
  "artificial intelligence",
  "llm",
  "chatbot",
  "assistant",
  "automation",
  "generate",
  "generator",
  "image generation",
  "video generation",
  "voice ai",
  "text to",
  "prompt",
  "machine learning",
];

const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const fetchWithTimeout = async (url) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; AI-Gyan-ToolAudit/1.0)",
        accept: "text/html,application/xhtml+xml",
      },
    });

    const html = await response.text().catch(() => "");

    return {
      ok: response.ok,
      status: response.status,
      finalUrl: response.url,
      html,
    };
  } finally {
    clearTimeout(timeout);
  }
};

const extractTag = (html, pattern) => html.match(pattern)?.[1]?.trim() || "";

const getNameTokens = (name) =>
  String(name || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 4);

const detectIssue = (tool, payload) => {
  if (payload.error) {
    return {
      action: "review",
      reason: `fetch_error:${payload.error}`,
      confidence: "medium",
    };
  }

  if (!payload.ok) {
    if (removableStatusCodes.has(payload.status)) {
      return {
        action: "remove",
        reason: `http_status:${payload.status}`,
        confidence: "high",
      };
    }

    if (reviewStatusCodes.has(payload.status)) {
      return {
        action: "review",
        reason: `http_status:${payload.status}`,
        confidence: "medium",
      };
    }

    return {
      action: "review",
      reason: `http_status:${payload.status}`,
      confidence: "medium",
    };
  }

  const title = normalizeText(extractTag(payload.html, /<title[^>]*>([\s\S]*?)<\/title>/i));
  const description = normalizeText(
    extractTag(payload.html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
      extractTag(payload.html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
  );
  const text = normalizeText(`${title} ${description} ${payload.html.slice(0, 10000).replace(/<[^>]*>/g, " ")}`);
  const finalHost = (() => {
    try {
      return new URL(payload.finalUrl).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();

  const nameTokens = getNameTokens(tool.name);
  const hasNameMatch = nameTokens.some((token) => text.includes(token));
  const hasAiMatch = aiSignals.some((signal) => text.includes(signal));
  const parkedMatches = strongParkedSignals.filter((signal) => text.includes(signal));
  const hasSpamSignal = unrelatedSpamSignals.some((signal) => text.includes(signal) || finalHost.includes(signal));
  const redirectedAway = (() => {
    try {
      const originalHost = new URL(tool.websiteUrl).hostname.replace(/^www\./, "");
      return finalHost && finalHost !== originalHost;
    } catch {
      return false;
    }
  })();

  if (parkedMatches.length && !hasAiMatch && (!hasNameMatch || text.length < 3500)) {
    return {
      action: "remove",
      reason: "parked_or_placeholder_site",
      confidence: "high",
    };
  }

  if (redirectedAway && hasSpamSignal) {
    return {
      action: "remove",
      reason: `redirected_to_unrelated_host:${finalHost}`,
      confidence: "high",
    };
  }

  if (redirectedAway && !hasNameMatch && !hasAiMatch) {
    return {
      action: "review",
      reason: `redirected_to_different_host:${finalHost}`,
      confidence: "medium",
    };
  }

  if (!hasNameMatch && !hasAiMatch && text.length < 1200) {
    return {
      action: "review",
      reason: "weak_or_unrelated_landing_page",
      confidence: "medium",
      title,
      description,
    };
  }

  return {
    action: "keep",
    reason: "site_looks_valid",
    confidence: "high",
    title,
    description,
  };
};

const destroyCloudinaryImage = async (publicId) => {
  if (!publicId) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, { resource_type: "image" }).catch(() => {});
};

const removeTool = async (tool) => {
  await destroyCloudinaryImage(tool.image?.publicId);
  await Tool.deleteOne({ _id: tool._id });
  await Category.findOneAndUpdate({ slug: createSlug(tool.category) }, { $inc: { toolCount: -1 } });
};

const runAudit = async () => {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  });

  await mongoose.connect(env.mongoUri);

  const tools = await Tool.find().select("name slug category websiteUrl image.publicId").lean();
  const report = [];
  const removed = [];
  let cursor = 0;

  const worker = async () => {
    while (cursor < tools.length) {
      const currentIndex = cursor;
      cursor += 1;
      const tool = tools[currentIndex];

      let payload;

      try {
        payload = await fetchWithTimeout(tool.websiteUrl);
      } catch (error) {
        payload = { error: error.name === "AbortError" ? "timeout" : error.message };
      }

      const verdict = detectIssue(tool, payload);
      const row = {
        name: tool.name,
        slug: tool.slug,
        category: tool.category,
        websiteUrl: tool.websiteUrl,
        ...verdict,
        finalUrl: payload?.finalUrl || "",
        status: payload?.status || null,
      };

      report.push(row);

      if (APPLY_CHANGES && verdict.action === "remove") {
        await removeTool(tool);
        removed.push(row);
      }
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  report.sort((left, right) => left.name.localeCompare(right.name));

  await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await fs.writeFile(
    REPORT_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        applyChanges: APPLY_CHANGES,
        totalAudited: report.length,
        removedCount: removed.length,
        summary: {
          remove: report.filter((item) => item.action === "remove").length,
          review: report.filter((item) => item.action === "review").length,
          keep: report.filter((item) => item.action === "keep").length,
        },
        removed,
        review: report.filter((item) => item.action === "review"),
        all: report,
      },
      null,
      2
    ),
    "utf8"
  );

  console.log(`Audited ${report.length} tools`);
  console.log(`Remove: ${report.filter((item) => item.action === "remove").length}`);
  console.log(`Review: ${report.filter((item) => item.action === "review").length}`);
  console.log(`Keep: ${report.filter((item) => item.action === "keep").length}`);
  console.log(`Report written to ${REPORT_PATH}`);

  if (APPLY_CHANGES) {
    console.log(`Removed ${removed.length} tools and cleaned Cloudinary logos`);
  }

  await mongoose.disconnect();
};

runAudit().catch(async (error) => {
  console.error("Tool audit failed", error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
