import mongoose from "mongoose";
import { cloudinary } from "../config/cloudinary.js";
import { connectDatabase } from "../config/db.js";
import { Category } from "../models/Category.js";
import { Tool } from "../models/Tool.js";

const duplicateSlugsToRemove = [
  "brand24-ai",
  "harvey-ai",
  "manychat-ai",
  "perplexity-ai",
  "predis-ai",
  "publer-ai",
  "lovo-ai",
  "jasper-ai",
  "japser",
  "beatovenai",
  "otterai",
  "smartwriter-ai",
  "sonix-ai",
  "loudly-ai",
  "taskade-ai",
  "runwayml",
  "youcom",
  "superagi-cloud",
];

const recalculateCategoryCounts = async () => {
  const counts = await Tool.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map(counts.map((entry) => [entry._id, entry.count]));
  const categories = await Category.find({}, "name");

  await Promise.all(
    categories.map((category) =>
      Category.updateOne(
        { _id: category._id },
        {
          $set: {
            toolCount: countMap.get(category.name) || 0,
          },
        }
      )
    )
  );
};

const removeToolAndLogo = async (tool) => {
  if (tool.image?.publicId) {
    try {
      await cloudinary.uploader.destroy(tool.image.publicId, {
        resource_type: "image",
      });
      console.log(`Removed Cloudinary image for ${tool.slug}: ${tool.image.publicId}`);
    } catch (error) {
      console.error(`Failed to remove Cloudinary image for ${tool.slug}`, error.message);
    }
  }

  await Tool.deleteOne({ _id: tool._id });
  console.log(`Removed tool from database: ${tool.slug} (${tool.name})`);
};

const run = async () => {
  await connectDatabase();

  const tools = await Tool.find({ slug: { $in: duplicateSlugsToRemove } }).select("name slug image category websiteUrl").lean();
  const foundSlugs = new Set(tools.map((tool) => tool.slug));
  const missingSlugs = duplicateSlugsToRemove.filter((slug) => !foundSlugs.has(slug));

  console.log(`Duplicate cleanup targets found: ${tools.length}`);
  if (missingSlugs.length) {
    console.log(`Missing targets: ${missingSlugs.join(", ")}`);
  }

  for (const tool of tools) {
    await removeToolAndLogo(tool);
  }

  await recalculateCategoryCounts();
  console.log("Category counts recalculated.");

  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error("Duplicate cleanup failed", error);
  await mongoose.connection.close();
  process.exit(1);
});
