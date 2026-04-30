import mongoose from "mongoose";
import { cloudinary } from "../config/cloudinary.js";
import { connectDatabase } from "../config/db.js";
import { Category } from "../models/Category.js";
import { Tool } from "../models/Tool.js";

const DRY_RUN = process.env.DRY_RUN === "true";

const familyRules = [
  {
    family: "openai",
    match: /(chatgpt|openai|codex|dall[\s.-]*e|sora|gpt)/i,
    preferred: [
      /chatgpt/i,
      /^openai$/i,
      /openai\.com\/chatgpt/i,
    ],
  },
  {
    family: "adobe",
    match: /(adobe|firefly|acrobat ai|photoshop ai|illustrator ai)/i,
    preferred: [
      /adobe express/i,
      /firefly/i,
      /adobe\.com\/express/i,
    ],
  },
  {
    family: "google-ai",
    match: /(google ai|gemini|bard|imagen|veo)/i,
    preferred: [
      /^gemini$/i,
      /google ai/i,
      /gemini\.google\.com/i,
      /ai\.google/i,
    ],
  },
];

const removeToolAndLogo = async (tool) => {
  if (tool.image?.publicId) {
    try {
      await cloudinary.uploader.destroy(tool.image.publicId, { resource_type: "image" });
    } catch (error) {
      console.warn(`Cloudinary remove failed for ${tool.name}: ${error.message}`);
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

const scoreTool = (tool, preferredPatterns) => {
  let score = 0;
  for (const pattern of preferredPatterns) {
    if (pattern.test(tool.name) || pattern.test(tool.websiteUrl)) {
      score += 50;
    }
  }
  if (tool.featured) {
    score += 20;
  }
  score += Math.min(Number(tool.viewCount || 0), 1000) / 100;
  score += Math.min(Number(tool.rating || 0), 5);
  return score;
};

const run = async () => {
  await connectDatabase();
  const tools = await Tool.find().select("name websiteUrl image.publicId featured viewCount rating category createdAt").lean();

  let totalRemoveCount = 0;
  const logs = [];

  for (const rule of familyRules) {
    const familyTools = tools.filter((tool) => rule.match.test(`${tool.name} ${tool.websiteUrl}`));

    if (familyTools.length <= 1) {
      continue;
    }

    const sorted = [...familyTools].sort((a, b) => {
      const scoreDiff = scoreTool(b, rule.preferred) - scoreTool(a, rule.preferred);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const keeper = sorted[0];
    const duplicates = sorted.slice(1);

    logs.push({
      family: rule.family,
      keeper: `${keeper.name} | ${keeper.websiteUrl}`,
      remove: duplicates.map((tool) => `${tool.name} | ${tool.websiteUrl}`),
    });

    if (!DRY_RUN) {
      for (const duplicate of duplicates) {
        await removeToolAndLogo(duplicate);
      }
    }

    totalRemoveCount += duplicates.length;
  }

  if (!DRY_RUN) {
    await recalculateCategoryCounts();
  }

  console.log(JSON.stringify({ dryRun: DRY_RUN, removed: totalRemoveCount, details: logs }, null, 2));
  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error("Brand-family dedupe failed", error);
  try {
    await mongoose.connection.close();
  } catch {
    // ignore
  }
  process.exit(1);
});
