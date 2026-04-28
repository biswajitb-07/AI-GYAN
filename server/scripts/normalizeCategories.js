import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import { Category } from "../models/Category.js";
import { Tool } from "../models/Tool.js";
import { broadCategories, normalizeCategory } from "../seed/categoryTaxonomy.js";

const buildLongDescription = (description, name, category) =>
  `${description} ${name} helps teams in the ${category.toLowerCase()} category move faster with cleaner workflows, stronger output quality, and scalable AI-powered execution.`;

const normalizeTags = (tool, normalizedCategory, originalCategory) => {
  const nextTags = new Set();

  nextTags.add(normalizedCategory);
  nextTags.add(tool.pricing);
  nextTags.add(tool.featured ? "Featured" : "Trending");
  nextTags.add("AI Tool");

  for (const tag of tool.tags || []) {
    if (!tag || tag === tool.category) {
      continue;
    }

    nextTags.add(tag);
  }

  if (normalizedCategory !== originalCategory) {
    nextTags.add(originalCategory);
  }

  return Array.from(nextTags);
};

const run = async () => {
  await connectDatabase();

  const tools = await Tool.find();
  let updatedTools = 0;

  for (const tool of tools) {
    const originalCategory = tool.category;
    const normalizedCategory = normalizeCategory(originalCategory);

    const updatePayload = {
      category: normalizedCategory,
      tags: normalizeTags(tool, normalizedCategory, originalCategory),
      longDescription: buildLongDescription(tool.description, tool.name, normalizedCategory),
    };

    const needsUpdate =
      originalCategory !== normalizedCategory ||
      updatePayload.longDescription !== tool.longDescription ||
      JSON.stringify(updatePayload.tags) !== JSON.stringify(tool.tags || []);

    if (!needsUpdate) {
      continue;
    }

    await Tool.updateOne({ _id: tool._id }, { $set: updatePayload });
    updatedTools += 1;
  }

  await Category.deleteMany({});

  const categoryCounts = await Tool.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
  const countMap = new Map(categoryCounts.map((entry) => [entry._id, entry.count]));

  await Category.insertMany(
    broadCategories
      .filter((category) => countMap.has(category.name))
      .map((category) => ({
        ...category,
        toolCount: countMap.get(category.name) || 0,
      }))
  );

  console.log(`Normalized ${updatedTools} tools into ${countMap.size} broad categories`);
  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});
