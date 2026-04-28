import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { cloudinary } from "../config/cloudinary.js";
import { connectDatabase } from "../config/db.js";
import { Tool } from "../models/Tool.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

const REQUEST_TIMEOUT_MS = Math.max(Number(process.env.LOGO_REQUEST_TIMEOUT_MS || 12000), 2000);
const LOGO_REFRESH_LIMIT = Math.max(Number(process.env.LOGO_REFRESH_LIMIT || 0), 0);

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      redirect: options.redirect || "follow",
      headers: {
        "User-Agent": "Ai-Gyan-Seed-Script/2.0",
        Accept: options.accept || "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        ...(options.headers || {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
};

const downloadImage = async (url, destination) => {
  const response = await fetchWithTimeout(url, { accept: "image/*,*/*;q=0.8" });

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok || !contentType.startsWith("image/")) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (!buffer.length || buffer.length < 256) {
    throw new Error("Downloaded image is empty");
  }

  fs.writeFileSync(destination, buffer);
};

const getDomain = (websiteUrl) => new URL(websiteUrl).hostname.replace(/^www\./, "");

const parkedPageMarkers = [
  "domain is expired",
  "this domain is for sale",
  "buy this domain",
  "parked free",
  "website coming soon",
  "under construction",
  "hostinger",
  "sedoparking",
  "parkingcrew",
];

const iconLinkPattern = /<link[^>]+rel=["'][^"']*(?:icon|apple-touch-icon|shortcut icon)[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>/gi;
const metaImagePattern = /<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src)["'][^>]+content=["']([^"']+)["'][^>]*>/gi;
const manifestPattern = /<link[^>]+rel=["'][^"']*manifest[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>/i;

const getOrigin = (websiteUrl) => {
  try {
    return new URL(websiteUrl).origin;
  } catch {
    return "";
  }
};

const toAbsoluteUrl = (baseUrl, candidate) => {
  if (!candidate) {
    return "";
  }

  try {
    return new URL(candidate, baseUrl).toString();
  } catch {
    return "";
  }
};

const dedupeUrls = (urls) => [...new Set(urls.filter(Boolean))];

const parseManifestIcons = async (websiteUrl, html) => {
  const manifestMatch = html.match(manifestPattern);

  if (!manifestMatch?.[1]) {
    return [];
  }

  const manifestUrl = toAbsoluteUrl(websiteUrl, manifestMatch[1]);

  if (!manifestUrl) {
    return [];
  }

  try {
    const response = await fetchWithTimeout(manifestUrl, {
      accept: "application/manifest+json,application/json,text/plain,*/*;q=0.8",
    });

    if (!response.ok) {
      return [];
    }

    const manifest = await response.json();
    return Array.isArray(manifest.icons)
      ? manifest.icons.map((icon) => toAbsoluteUrl(manifestUrl, icon.src)).filter(Boolean)
      : [];
  } catch {
    return [];
  }
};

const extractWebsiteLogoCandidates = async (websiteUrl) => {
  try {
    const response = await fetchWithTimeout(websiteUrl);
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok || !contentType.includes("text/html")) {
      return { parked: false, candidates: [] };
    }

    const html = await response.text();
    const normalizedHtml = html.toLowerCase();
    const parked = parkedPageMarkers.some((marker) => normalizedHtml.includes(marker));

    if (parked) {
      return { parked: true, candidates: [] };
    }

    const directIcons = [];

    for (const match of html.matchAll(iconLinkPattern)) {
      directIcons.push(toAbsoluteUrl(response.url, match[1]));
    }

    for (const match of html.matchAll(metaImagePattern)) {
      directIcons.push(toAbsoluteUrl(response.url, match[1]));
    }

    const manifestIcons = await parseManifestIcons(response.url, html);

    return {
      parked: false,
      candidates: dedupeUrls([
        ...directIcons,
        ...manifestIcons,
      ]),
    };
  } catch {
    return { parked: false, candidates: [] };
  }
};

const getLogoCandidates = (websiteUrl) => {
  const domain = getDomain(websiteUrl);

  return [
    `https://unavatar.io/google/${domain}`,
    `https://unavatar.io/${domain}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://icon.horse/icon/${domain}`,
    `${new URL(websiteUrl).origin}/favicon.ico`,
  ];
};

const hashString = (value) =>
  [...String(value || "")].reduce((total, char) => ((total * 31) + char.charCodeAt(0)) % 360, 0);

const generateFallbackLogo = (tool, destination) => {
  const hue = hashString(tool.name);
  const initials = String(tool.name || "AI")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "AI";

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="${tool.name}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="hsl(${hue} 70% 56%)" />
      <stop offset="100%" stop-color="hsl(${(hue + 40) % 360} 72% 42%)" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="124" fill="url(#g)" />
  <circle cx="420" cy="92" r="56" fill="rgba(255,255,255,0.12)" />
  <text x="50%" y="54%" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="176" font-weight="700" fill="#ffffff">${initials}</text>
</svg>`;

  fs.writeFileSync(destination, svg, "utf8");
};

const run = async () => {
  await connectDatabase();
  fs.mkdirSync("tmp/seed-images", { recursive: true });

  const tools = await Tool.find().sort({ createdAt: 1 });
  const replaceExisting = process.env.REPLACE_EXISTING_LOGOS === "true";
  const targetTools = LOGO_REFRESH_LIMIT ? tools.slice(0, LOGO_REFRESH_LIMIT) : tools;
  let refreshed = 0;
  let fallbackCount = 0;

  for (const tool of targetTools) {
    const imageExtension = ".png";
    const tempPath = path.join("tmp/seed-images", `${tool.slug}${imageExtension}`);

    try {
      if (tool.image.publicId) {
        if (!replaceExisting) {
          continue;
        }

        await cloudinary.uploader.destroy(tool.image.publicId, {
          resource_type: "image",
        });
        console.log(`Removed old image for ${tool.name}`);
      }

      const websiteCandidates = tool.websiteUrl ? await extractWebsiteLogoCandidates(tool.websiteUrl) : { parked: false, candidates: [] };
      let lastError = null;
      const candidatePool = dedupeUrls([
        ...websiteCandidates.candidates,
        ...(!websiteCandidates.parked && tool.websiteUrl ? getLogoCandidates(tool.websiteUrl) : []),
      ]);

      for (const candidate of candidatePool) {
        try {
          await downloadImage(candidate, tempPath);
          lastError = null;
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (lastError) {
        generateFallbackLogo(tool, tempPath);
        fallbackCount += 1;
      }

      const image = await uploadToCloudinary(tempPath, "ai-gyan/tool-logos");

      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }

      tool.image = image;
      await tool.save();
      refreshed += 1;
      console.log(`${lastError ? "Generated fallback logo" : "Uploaded real logo"} for ${tool.name}`);
    } catch (error) {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }

      console.log(`Failed ${tool.name}: ${error.message}`);
    }
  }

  console.log(`Logo refresh complete. Updated ${refreshed} tools, fallback logos used for ${fallbackCount}.`);
  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});
