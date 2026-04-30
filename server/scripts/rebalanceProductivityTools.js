import crypto from "crypto";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { cloudinary } from "../config/cloudinary.js";
import { connectDatabase } from "../config/db.js";
import { Category } from "../models/Category.js";
import { Tool } from "../models/Tool.js";
import { createSlug } from "../utils/createSlug.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

const REMOVE_COUNT = Math.max(Number(process.env.REMOVE_COUNT || 200), 0);
const ADD_COUNT = Math.max(Number(process.env.ADD_COUNT || 200), 0);
const DRY_RUN = process.env.DRY_RUN === "true";
const TMP_DIR = path.join(process.cwd(), "tmp", "rebalance-logos");

const sourceConfigs = [
  { key: "ai-tools-inc", url: "https://raw.githubusercontent.com/AI-Tools-Inc/Awesome-AI-Tools/main/README.md", priority: 4 },
  { key: "mahseema", url: "https://raw.githubusercontent.com/mahseema/awesome-ai-tools/master/README.md", priority: 3 },
  { key: "eudk", url: "https://raw.githubusercontent.com/eudk/awesome-ai-tools/main/README.md", priority: 2 },
  { key: "tankvn-text", url: "https://raw.githubusercontent.com/tankvn/awesome-ai-tools/main/Text.md", priority: 2 },
  { key: "tankvn-image", url: "https://raw.githubusercontent.com/tankvn/awesome-ai-tools/main/Image.md", priority: 2 },
  { key: "tankvn-art", url: "https://raw.githubusercontent.com/tankvn/awesome-ai-tools/main/Art.md", priority: 2 },
  { key: "tankvn-video", url: "https://raw.githubusercontent.com/tankvn/awesome-ai-tools/main/Video.md", priority: 2 },
  { key: "tankvn-audio", url: "https://raw.githubusercontent.com/tankvn/awesome-ai-tools/main/Audio.md", priority: 2 },
  { key: "tankvn-business", url: "https://raw.githubusercontent.com/tankvn/awesome-ai-tools/main/Business.md", priority: 2 },
  { key: "tankvn-automation", url: "https://raw.githubusercontent.com/tankvn/awesome-ai-tools/main/Automation.md", priority: 2 },
  { key: "tankvn-code", url: "https://raw.githubusercontent.com/tankvn/awesome-ai-tools/main/Code.md", priority: 2 },
  { key: "tankvn-misc", url: "https://raw.githubusercontent.com/tankvn/awesome-ai-tools/main/Miscellaneous.md", priority: 1 },
];

const categoryRules = [
  { category: "Coding", match: ["coding", "code review", "sql", "regex", "developer", "compilers", "website builders", "image to code", "llm ops"] },
  { category: "Video Editing", match: ["video", "short form", "subtitles", "captions", "animation", "clip", "shorts"] },
  { category: "Avatar / Video Avatar", match: ["talking avatar", "avatar", "presenter"] },
  { category: "Audio / Voice", match: ["audio", "voice", "music", "speech", "text to speech", "transcrib", "dub", "podcast"] },
  { category: "Image Generation", match: ["image generators", "thumbnail", "headshot", "profile picture", "face swap", "product photo", "photo editing"] },
  { category: "Design", match: ["design", "infographic", "landing page", "creative", "visual", "presentation", "slides"] },
  { category: "Writing", match: ["copywriting", "writing assistants", "text", "content", "blog", "seo content", "email marketing"] },
  { category: "SEO", match: ["seo"] },
  { category: "Marketing", match: ["marketing", "ugc", "sales", "cold email", "prospecting", "influencer", "ad ", "ads", "ppc"] },
  { category: "Social Media", match: ["social", "linkedin", "youtube"] },
  { category: "Research", match: ["search engines", "search engine", "research", "legal research", "climate research"] },
  { category: "Chatbots", match: ["chatbot", "chatbots", "phone calls", "voice agents"] },
  { category: "Business / CRM", match: ["legal", "contract", "crm", "compliance", "finance", "accounting"] },
  { category: "Education", match: ["course", "learning", "tutor", "student"] },
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

const sanitizeDescription = (description) => normalizeText(description).replace(/\[.*?\]\(.*?\)/g, "").trim();

const inferCategory = (entry) => {
  const haystack = normalizeKey(`${entry.section} ${entry.description} ${entry.name}`);

  for (const rule of categoryRules) {
    if (rule.match.some((keyword) => haystack.includes(keyword))) {
      return rule.category;
    }
  }

  return "Research";
};

const inferPricing = (entry) => {
  const haystack = normalizeKey(`${entry.name} ${entry.description} ${entry.section}`);
  if (haystack.includes("open source") || haystack.includes("free ")) {
    return "Free";
  }
  if (haystack.includes("enterprise") || haystack.includes("paid")) {
    return "Paid";
  }
  return "Free Trial";
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

const isValidCandidate = (entry) => {
  if (!entry.name || !entry.websiteUrl || !entry.description) {
    return false;
  }

  const domain = getDomain(entry.websiteUrl);
  if (!domain || domain.includes("github.com") || domain.includes("raw.githubusercontent.com")) {
    return false;
  }

  const category = inferCategory(entry);
  if (category === "Productivity") {
    return false;
  }

  return true;
};

const getLogoCandidates = (websiteUrl) => {
  const domain = getDomain(websiteUrl);
  if (!domain) {
    return [];
  }
  let origin = "";
  try {
    origin = new URL(websiteUrl).origin;
  } catch {
    origin = "";
  }

  return [
    `${origin}/favicon.ico`,
    `${origin}/apple-touch-icon.png`,
    `https://logo.clearbit.com/${domain}`,
    `https://icon.horse/icon/${domain}`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
  ].filter(Boolean);
};

const downloadImageBuffer = async (url) => {
  const response = await fetch(url, {
    headers: { "User-Agent": "Ai-Gyan-Rebalance/1.0" },
    redirect: "follow",
  });

  const contentType = response.headers.get("content-type") || "";
  if (!response.ok || !contentType.startsWith("image/")) {
    throw new Error(`Invalid image response for ${url}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length || buffer.length < 300) {
    throw new Error(`Image too small for ${url}`);
  }

  return buffer;
};

const sha256 = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");

const ensureTmpDir = () => {
  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
  }
};

const uploadUniqueLogo = async (toolName, websiteUrl, usedHashes) => {
  ensureTmpDir();
  const logoCandidates = getLogoCandidates(websiteUrl);

  for (const [index, candidate] of logoCandidates.entries()) {
    const tempFile = path.join(TMP_DIR, `${createSlug(toolName)}-${index}.png`);

    try {
      const buffer = await downloadImageBuffer(candidate);
      const hash = sha256(buffer);

      if (usedHashes.has(hash)) {
        continue;
      }

      fs.writeFileSync(tempFile, buffer);
      const uploaded = await uploadToCloudinary(tempFile, "ai-gyan/tool-logos");
      fs.unlinkSync(tempFile);
      usedHashes.add(hash);
      return uploaded;
    } catch {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }

  throw new Error(`No unique real logo found for ${toolName}`);
};

const parseVisitsToNumber = (value) => {
  const text = String(value || "").toUpperCase().trim();
  const number = Number(text.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(number)) {
    return 0;
  }
  if (text.includes("M")) {
    return Math.round(number * 1_000_000);
  }
  if (text.includes("K")) {
    return Math.round(number * 1_000);
  }
  return Math.round(number);
};

const removeToolAndLogo = async (tool) => {
  if (tool.image?.publicId) {
    try {
      await cloudinary.uploader.destroy(tool.image.publicId, { resource_type: "image" });
    } catch (error) {
      console.warn(`Cloudinary delete failed for ${tool.slug}: ${error.message}`);
    }
  }
  await Tool.deleteOne({ _id: tool._id });
};

const recalculateCategoryCounts = async () => {
  const counts = await Tool.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
  const countMap = new Map(counts.map((entry) => [entry._id, entry.count]));
  const categories = await Category.find({}, "name");

  await Promise.all(
    categories.map((category) =>
      Category.updateOne({ _id: category._id }, { $set: { toolCount: countMap.get(category.name) || 0 } })
    )
  );
};

const buildToolPayload = (entry, index, image) => {
  const category = inferCategory(entry);
  const pricing = inferPricing(entry);

  return {
    name: entry.name,
    slug: createSlug(entry.name),
    description: entry.description.slice(0, 280),
    longDescription: `${entry.description} ${entry.name} helps teams in ${category} workflows with practical AI execution.`.slice(0, 1900),
    category,
    pricing,
    featured: index % 25 === 0,
    websiteUrl: entry.websiteUrl,
    image,
    tags: [category, pricing, "AI Tool", "Curated"].slice(0, 8),
    rating: 4.6,
    monthlyVisits: "50K+",
    reviews: [],
  };
};

const run = async () => {
  await connectDatabase();
  console.log(`Connected. DRY_RUN=${DRY_RUN} REMOVE_COUNT=${REMOVE_COUNT} ADD_COUNT=${ADD_COUNT}`);

  const productivityTools = await Tool.find({ category: "Productivity" })
    .select("_id name slug websiteUrl image monthlyVisits viewCount rating featured createdAt")
    .lean();

  const removalTargets = [...productivityTools]
    .sort((left, right) => {
      if (left.featured !== right.featured) {
        return left.featured ? 1 : -1;
      }
      const viewDelta = (left.viewCount || 0) - (right.viewCount || 0);
      if (viewDelta !== 0) {
        return viewDelta;
      }
      const visitsDelta = parseVisitsToNumber(left.monthlyVisits) - parseVisitsToNumber(right.monthlyVisits);
      if (visitsDelta !== 0) {
        return visitsDelta;
      }
      const ratingDelta = (left.rating || 0) - (right.rating || 0);
      if (ratingDelta !== 0) {
        return ratingDelta;
      }
      return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    })
    .slice(0, REMOVE_COUNT);

  console.log(`Planned remove: ${removalTargets.length} productivity tools`);

  const existingTools = await Tool.find().select("name slug websiteUrl").lean();
  const existingNameKeys = new Set(existingTools.map((tool) => normalizeKey(tool.name)));
  const existingUrlKeys = new Set(existingTools.map((tool) => sanitizeUrl(tool.websiteUrl)).filter(Boolean));
  const existingSlugKeys = new Set(existingTools.map((tool) => tool.slug));

  const fetchedSources = await Promise.all(
    sourceConfigs.map(async (source) => {
      const markdown = await fetch(source.url).then((response) => response.text());
      return { ...source, markdown };
    })
  );

  const rawEntries = fetchedSources.flatMap((source) =>
    source.key === "ai-tools-inc" ? parseAiToolsInc(source.markdown) : parseGenericMarkdownList(source.markdown, source.key)
  );

  const seenBatchNames = new Set();
  const seenBatchUrls = new Set();
  const candidatePool = [];

  for (const entry of rawEntries) {
    if (!isValidCandidate(entry)) {
      continue;
    }

    const nameKey = normalizeKey(entry.name);
    const urlKey = sanitizeUrl(entry.websiteUrl);
    const slugKey = createSlug(entry.name);

    if (!nameKey || !urlKey) {
      continue;
    }

    if (existingNameKeys.has(nameKey) || existingUrlKeys.has(urlKey) || existingSlugKeys.has(slugKey)) {
      continue;
    }

    if (seenBatchNames.has(nameKey) || seenBatchUrls.has(urlKey)) {
      continue;
    }

    seenBatchNames.add(nameKey);
    seenBatchUrls.add(urlKey);

    candidatePool.push({
      ...entry,
      sourcePriority: sourceConfigs.find((source) => source.key === entry.source)?.priority || 0,
    });
  }

  candidatePool.sort((left, right) => right.sourcePriority - left.sourcePriority);
  const selectedCandidates = candidatePool.slice(0, Math.max(ADD_COUNT * 3, ADD_COUNT));

  if (DRY_RUN) {
    console.log("Dry run summary:");
    console.log(`- Remove targets: ${removalTargets.length}`);
    console.log(`- Candidate pool after db dedupe: ${candidatePool.length}`);
    console.log(`- Top candidates considered: ${selectedCandidates.length}`);
    console.log("Sample remove targets:", removalTargets.slice(0, 10).map((tool) => tool.name).join(", "));
    console.log("Sample add candidates:", selectedCandidates.slice(0, 10).map((tool) => tool.name).join(", "));
    await mongoose.connection.close();
    return;
  }

  for (const tool of removalTargets) {
    await removeToolAndLogo(tool);
    existingNameKeys.delete(normalizeKey(tool.name));
    existingUrlKeys.delete(sanitizeUrl(tool.websiteUrl));
    existingSlugKeys.delete(tool.slug);
    console.log(`Removed: ${tool.name}`);
  }

  const usedLogoHashes = new Set();
  let addedCount = 0;

  for (const [index, entry] of selectedCandidates.entries()) {
    if (addedCount >= ADD_COUNT) {
      break;
    }

    const nameKey = normalizeKey(entry.name);
    const urlKey = sanitizeUrl(entry.websiteUrl);
    const slugKey = createSlug(entry.name);

    if (existingNameKeys.has(nameKey) || existingUrlKeys.has(urlKey) || existingSlugKeys.has(slugKey)) {
      continue;
    }

    try {
      const image = await uploadUniqueLogo(entry.name, entry.websiteUrl, usedLogoHashes);
      const payload = buildToolPayload(entry, index, image);
      await Tool.create(payload);

      existingNameKeys.add(nameKey);
      existingUrlKeys.add(urlKey);
      existingSlugKeys.add(slugKey);
      addedCount += 1;
      console.log(`Added (${addedCount}/${ADD_COUNT}): ${entry.name} [${payload.category}]`);
    } catch (error) {
      console.warn(`Skipped ${entry.name}: ${error.message}`);
    }
  }

  await recalculateCategoryCounts();
  console.log(`Done. Removed ${removalTargets.length}, Added ${addedCount}`);
  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error("Rebalance failed", error);
  try {
    await mongoose.connection.close();
  } catch {
    // ignore
  }
  process.exit(1);
});
