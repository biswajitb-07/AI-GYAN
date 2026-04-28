import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { cloudinary } from "../config/cloudinary.js";
import { connectDatabase } from "../config/db.js";
import { Category } from "../models/Category.js";
import { Tool } from "../models/Tool.js";
import { broadCategories } from "../seed/categoryTaxonomy.js";
import { createSlug } from "../utils/createSlug.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

const IMPORT_LIMIT = Math.max(Number(process.env.IMPORT_LIMIT || 500), 1);
const DRY_RUN = process.env.IMPORT_DRY_RUN === "true";

const sourceConfigs = [
  {
    key: "ai-tools-inc",
    url: "https://raw.githubusercontent.com/AI-Tools-Inc/Awesome-AI-Tools/main/README.md",
    priority: 3,
  },
  {
    key: "mahseema",
    url: "https://raw.githubusercontent.com/mahseema/awesome-ai-tools/master/README.md",
    priority: 2,
  },
  {
    key: "eudk",
    url: "https://raw.githubusercontent.com/eudk/awesome-ai-tools/main/README.md",
    priority: 1,
  },
  {
    key: "tankvn-productivity",
    url: "https://raw.githubusercontent.com/tankvn/awesome-ai-tools/main/Productivity.md",
    priority: 2,
  },
  {
    key: "tankvn-text",
    url: "https://raw.githubusercontent.com/tankvn/awesome-ai-tools/main/Text.md",
    priority: 2,
  },
  {
    key: "tankvn-image",
    url: "https://raw.githubusercontent.com/tankvn/awesome-ai-tools/main/Image.md",
    priority: 2,
  },
  {
    key: "tankvn-art",
    url: "https://raw.githubusercontent.com/tankvn/awesome-ai-tools/main/Art.md",
    priority: 2,
  },
  {
    key: "tankvn-video",
    url: "https://raw.githubusercontent.com/tankvn/awesome-ai-tools/main/Video.md",
    priority: 2,
  },
  {
    key: "tankvn-audio",
    url: "https://raw.githubusercontent.com/tankvn/awesome-ai-tools/main/Audio.md",
    priority: 2,
  },
  {
    key: "tankvn-business",
    url: "https://raw.githubusercontent.com/tankvn/awesome-ai-tools/main/Business.md",
    priority: 2,
  },
  {
    key: "tankvn-automation",
    url: "https://raw.githubusercontent.com/tankvn/awesome-ai-tools/main/Automation.md",
    priority: 2,
  },
  {
    key: "tankvn-code",
    url: "https://raw.githubusercontent.com/tankvn/awesome-ai-tools/main/Code.md",
    priority: 2,
  },
  {
    key: "tankvn-misc",
    url: "https://raw.githubusercontent.com/tankvn/awesome-ai-tools/main/Miscellaneous.md",
    priority: 1,
  },
];

const skippedSectionKeywords = [
  "gpu rental",
  "chrome extensions",
  "learning ai",
  "consumer ai hardware",
  "software for large language models",
  "ai graveyard",
  "ai-driven robots",
  "learning resources",
  "related awesome lists",
  "nvidia platform extensions",
  "links",
  "reference",
];

const skippedDomainKeywords = [
  "raw.githubusercontent.com",
  "github.com/mahseema/awesome-ai-tools",
  "github.com/eudk/awesome-ai-tools",
  "github.com/ai-tools-inc/awesome-ai-tools",
  "github.com/tankvn/awesome-ai-tools",
  "futurepedia.io",
  "appsumo.8odi.net",
  "chrome.google.com/webstore",
  "chromewebstore.google.com",
  "vallex-demo.github.io",
  "google-research.github.io",
];

const categoryRules = [
  { category: "Coding", match: ["coding", "code review", "sql", "regex", "developer", "compilers", "website builders", "image to code", "llm ops", "api integration"] },
  { category: "Video Editing", match: ["video", "short form", "subtitles", "captions", "animation", "clip", "shorts"] },
  { category: "Avatar / Video Avatar", match: ["talking avatar", "avatar", "presenter"] },
  { category: "Audio / Voice", match: ["audio", "voice", "music", "speech", "text to speech", "transcrib", "dub", "podcast"] },
  { category: "Image Generation", match: ["image generators", "thumbnail", "headshot", "profile picture", "face swap", "product photo", "photo editing", "image tools", "image editors", "photo retouching"] },
  { category: "Design", match: ["design", "infographic", "landing page", "creative", "visual", "presentation", "slides", "website generation"] },
  { category: "Writing", match: ["copywriting", "writing assistants", "text", "content", "blog", "seo content", "email marketing"] },
  { category: "SEO", match: ["seo"] },
  { category: "Marketing", match: ["marketing", "ugc", "sales", "cold email", "prospecting", "influencer", "ad ", "ads", "ppc"] },
  { category: "Social Media", match: ["social", "linkedin", "youtube"] },
  { category: "Productivity", match: ["productivity", "meeting assistants", "meeting", "workspace", "resume", "document assistant", "summarize", "pdf"] },
  { category: "Research", match: ["search engines", "search engine", "research", "legal research", "climate research"] },
  { category: "Chatbots", match: ["chatbot", "chatbots", "phone calls", "voice agents"] },
  { category: "Business / CRM", match: ["legal", "contract", "crm", "compliance", "finance", "accounting"] },
];

const normalizeText = (value) =>
  String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\*+/g, "")
    .replace(/[`_~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeKey = (value) =>
  normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const normalizeBrandKey = (value) =>
  normalizeKey(value)
    .replace(/\bai\b/g, " ")
    .replace(/\bapp\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getDomain = (websiteUrl) => {
  try {
    return new URL(websiteUrl).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

const sanitizeUrl = (websiteUrl) => {
  try {
    const parsed = new URL(websiteUrl);
    parsed.hash = "";
    parsed.hostname = parsed.hostname.replace(/^www\./, "");
    parsed.pathname = parsed.pathname.replace(/\/$/, "") || "/";
    return `${parsed.protocol}//${parsed.hostname}${parsed.pathname}${parsed.search}`;
  } catch {
    return "";
  }
};

const sanitizeDescription = (description) =>
  normalizeText(description)
    .replace(/\[review[^\]]*\]\([^)]+\)\s*[-–]?\s*/gi, "")
    .replace(/\*?\[reviews?\]\([^)]+\)\*?\s*[-–]?\s*/gi, "")
    .replace(/^\*\[review[^\]]*\]\([^)]+\)\*\s*[-–]?\s*/i, "")
    .replace(/^\[review[^\]]*\]\([^)]+\)\s*[-–]?\s*/i, "")
    .replace(/^\*Review\*\s*[-–]?\s*/i, "")
    .trim();

const inferPricing = (entry) => {
  const haystack = normalizeKey(`${entry.name} ${entry.description} ${entry.section}`);

  if (haystack.includes("open source") || haystack.includes("free ") || haystack.endsWith(" free") || haystack.includes("no signup")) {
    return "Free";
  }

  if (haystack.includes("enterprise") || haystack.includes("paid")) {
    return "Paid";
  }

  return "Free Trial";
};

const inferCategory = (entry) => {
  const haystack = normalizeKey(`${entry.section} ${entry.description} ${entry.name}`);

  for (const rule of categoryRules) {
    if (rule.match.some((keyword) => haystack.includes(keyword))) {
      return rule.category;
    }
  }

  return "Productivity";
};

const getLogoCandidates = (websiteUrl) => {
  const domain = getDomain(websiteUrl);

  if (!domain) {
    return [];
  }

  return [
    `https://unavatar.io/google/${domain}`,
    `https://unavatar.io/${domain}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://icon.horse/icon/${domain}`,
    `${new URL(websiteUrl).origin}/favicon.ico`,
  ];
};

const downloadImage = async (url, destination) => {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Ai-Gyan-Popular-Import/1.0",
    },
    redirect: "follow",
  });

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok || !contentType.startsWith("image/")) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (!buffer.length) {
    throw new Error("Downloaded image is empty");
  }

  fs.writeFileSync(destination, buffer);
};

const parseAiToolsInc = (markdown) => {
  const lines = markdown.split(/\r?\n/);
  const entries = [];
  let headingTwo = "";
  let headingThree = "";

  for (const line of lines) {
    if (line.startsWith("## ")) {
      headingTwo = normalizeText(line.slice(3));
      headingThree = "";
      continue;
    }

    if (line.startsWith("### ")) {
      headingThree = normalizeText(line.slice(4));
      continue;
    }

    const match = line.match(/^[-*]\s+\[([^\]]+)\]\(([^)]+)\)\s+-\s+(.+?)\s+\[!\[link\]\]\((https?:\/\/[^)]+)\)/i);

    if (!match) {
      continue;
    }

    entries.push({
      name: normalizeText(match[1]),
      websiteUrl: sanitizeUrl(match[4]),
      description: sanitizeDescription(match[3]),
      section: [headingTwo, headingThree].filter(Boolean).join(" > "),
      source: "ai-tools-inc",
    });
  }

  return entries;
};

const parseGenericMarkdownList = (markdown, source) => {
  const lines = markdown.split(/\r?\n/);
  const entries = [];
  let headingTwo = "";
  let headingThree = "";

  for (const line of lines) {
    if (line.startsWith("## ")) {
      headingTwo = normalizeText(line.slice(3));
      headingThree = "";
      continue;
    }

    if (line.startsWith("### ")) {
      headingThree = normalizeText(line.slice(4));
      continue;
    }

    const match = line.match(/^\s*(?:[-*]|\d+\.)\s+(?:\*\*)?\[([^\]]+)\]\((https?:\/\/[^)]+)\)(?:\*\*)?\s+[-–]\s+(.+)$/);

    if (!match) {
      continue;
    }

    entries.push({
      name: normalizeText(match[1]),
      websiteUrl: sanitizeUrl(match[2]),
      description: sanitizeDescription(match[3]),
      section: [headingTwo, headingThree].filter(Boolean).join(" > "),
      source,
    });
  }

  return entries;
};

const isCandidateValid = (entry) => {
  const section = normalizeKey(entry.section);
  const domain = getDomain(entry.websiteUrl);
  const websiteUrl = String(entry.websiteUrl || "").toLowerCase();
  const name = normalizeKey(entry.name);

  if (!entry.websiteUrl || !domain || !entry.name || !entry.description) {
    return false;
  }

  if (skippedSectionKeywords.some((keyword) => section.includes(keyword))) {
    return false;
  }

  if (skippedDomainKeywords.some((keyword) => domain.includes(keyword) || websiteUrl.includes(keyword))) {
    return false;
  }

  if (name.includes("buy me a coffee")) {
    return false;
  }

  return true;
};

const buildTags = (category, pricing, entry) => {
  const tags = new Set([category, pricing, "AI Tool"]);
  const sourceTag = entry.source === "ai-tools-inc" ? "Curated" : entry.source === "mahseema" ? "Trending" : "Popular";
  tags.add(sourceTag);

  for (const part of entry.section.split(">")) {
    const tag = normalizeText(part);

    if (tag && tag.length <= 28) {
      tags.add(tag);
    }
  }

  return [...tags].slice(0, 6);
};

const toToolDocument = (entry, rankIndex) => {
  const category = inferCategory(entry);
  const pricing = inferPricing(entry);
  const featured = rankIndex < 60 || rankIndex % 17 === 0;

  return {
    name: entry.name,
    slug: createSlug(entry.name),
    description: entry.description,
    longDescription: `${entry.description} ${entry.name} fits teams looking for ${category.toLowerCase()} workflows, faster execution, and practical AI-assisted output.`,
    category,
    pricing,
    featured,
    websiteUrl: entry.websiteUrl,
    image: {
      url: getLogoCandidates(entry.websiteUrl)[0] || "",
      publicId: "",
    },
    tags: buildTags(category, pricing, entry),
    rating: Number((4.3 + ((rankIndex % 7) * 0.1)).toFixed(1)),
    monthlyVisits: `${Math.max(25, 900 - rankIndex)}K+`,
  };
};

const uploadLogoForTool = async (tool) => {
  const currentPublicId = tool.image?.publicId;

  if (currentPublicId) {
    return false;
  }

  const candidates = getLogoCandidates(tool.websiteUrl);

  if (!candidates.length) {
    return false;
  }

  fs.mkdirSync("tmp/popular-tool-logos", { recursive: true });
  const tempPath = path.join("tmp/popular-tool-logos", `${tool.slug}.png`);
  let lastError = null;

  for (const candidate of candidates) {
    try {
      await downloadImage(candidate, tempPath);
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    console.log(`Skipping logo for ${tool.name}: ${lastError.message}`);
    return false;
  }

  const image = await uploadToCloudinary(tempPath, "ai-gyan/tool-logos");
  fs.unlinkSync(tempPath);

  tool.image = image;
  await tool.save();
  return true;
};

const run = async () => {
  await connectDatabase();

  const existingTools = await Tool.find().select("name slug websiteUrl").lean();
  const existingSlugs = new Set(existingTools.map((tool) => tool.slug));
  const existingNames = new Set(existingTools.map((tool) => normalizeKey(tool.name)));
  const existingUrls = new Set(existingTools.map((tool) => sanitizeUrl(tool.websiteUrl)).filter(Boolean));
  const existingBrandKeys = new Set(
    existingTools
      .map((tool) => `${normalizeBrandKey(tool.name)}|${getDomain(tool.websiteUrl)}`)
      .filter((key) => !key.startsWith("|"))
  );

  const fetchedSources = await Promise.all(
    sourceConfigs.map(async (source) => ({
      ...source,
      markdown: await fetch(source.url).then((response) => response.text()),
    }))
  );

  const rawEntries = fetchedSources.flatMap((source) => {
    if (source.key === "ai-tools-inc") {
      return parseAiToolsInc(source.markdown);
    }

    return parseGenericMarkdownList(source.markdown, source.key);
  });

  const uniqueCandidates = [];
  const seenImportKeys = new Set();

  for (const [index, entry] of rawEntries.entries()) {
    if (!isCandidateValid(entry)) {
      continue;
    }

    const slug = createSlug(entry.name);
    const normalizedName = normalizeKey(entry.name);
    const normalizedBrandName = normalizeBrandKey(entry.name);
    const domain = getDomain(entry.websiteUrl);
    const sanitizedWebsiteUrl = sanitizeUrl(entry.websiteUrl);
    const dedupeKey = `${normalizedName}|${domain}`;
    const brandDedupeKey = `${normalizedBrandName}|${domain}`;

    if (
      seenImportKeys.has(dedupeKey) ||
      seenImportKeys.has(brandDedupeKey) ||
      (sanitizedWebsiteUrl && existingUrls.has(sanitizedWebsiteUrl)) ||
      existingSlugs.has(slug) ||
      existingNames.has(normalizedName) ||
      existingBrandKeys.has(brandDedupeKey)
    ) {
      continue;
    }

    seenImportKeys.add(dedupeKey);
    seenImportKeys.add(brandDedupeKey);
    uniqueCandidates.push({
      ...entry,
      sourcePriority: sourceConfigs.find((source) => source.key === entry.source)?.priority || 0,
      sourceOrder: index,
    });
  }

  uniqueCandidates.sort((left, right) => {
    if (right.sourcePriority !== left.sourcePriority) {
      return right.sourcePriority - left.sourcePriority;
    }

    return left.sourceOrder - right.sourceOrder;
  });

  const selectedCandidates = uniqueCandidates.slice(0, IMPORT_LIMIT);
  const categoryMap = new Map(broadCategories.map((category) => [category.name, category]));

  if (DRY_RUN) {
    console.log(`Dry run: ${selectedCandidates.length} tools ready for import`);
    console.log(selectedCandidates.slice(0, 20).map((entry) => `${entry.name} | ${entry.section} | ${entry.websiteUrl}`).join("\n"));
    await mongoose.connection.close();
    return;
  }

  for (const category of categoryMap.values()) {
    await Category.updateOne(
      { slug: category.slug },
      { $setOnInsert: { ...category, toolCount: 0 } },
      { upsert: true }
    );
  }

  const insertedSlugs = [];

  for (const [index, entry] of selectedCandidates.entries()) {
    const toolDocument = toToolDocument(entry, index);

    const result = await Tool.updateOne(
      { slug: toolDocument.slug },
      { $setOnInsert: toolDocument },
      { upsert: true }
    );

    if (result.upsertedCount) {
      insertedSlugs.push(toolDocument.slug);
      console.log(`Inserted ${toolDocument.name}`);
    }
  }

  const categoryCounts = await Tool.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);

  for (const entry of categoryCounts) {
    await Category.updateOne({ name: entry._id }, { $set: { toolCount: entry.count } });
  }

  let uploadedLogos = 0;

  if (insertedSlugs.length) {
    const insertedTools = await Tool.find({ slug: { $in: insertedSlugs } });

    for (const tool of insertedTools) {
      try {
        if (await uploadLogoForTool(tool)) {
          uploadedLogos += 1;
          console.log(`Uploaded logo for ${tool.name}`);
        }
      } catch (error) {
        console.log(`Logo upload failed for ${tool.name}: ${error.message}`);
      }
    }
  }

  console.log(`Imported ${insertedSlugs.length} tools and uploaded ${uploadedLogos} logos`);
  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.connection.close();
  } catch {
    // ignore
  }
  process.exit(1);
});
