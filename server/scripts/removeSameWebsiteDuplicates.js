import mongoose from "mongoose";
import { cloudinary } from "../config/cloudinary.js";
import { connectDatabase } from "../config/db.js";
import { Category } from "../models/Category.js";
import { Tool } from "../models/Tool.js";

const normalizeUrl = (value = "") => {
  try {
    const url = new URL(String(value).trim());
    url.hash = "";
    const pathname = url.pathname.replace(/\/$/, "") || "/";
    return `${url.protocol}//${url.hostname.replace(/^www\./, "")}${pathname}${url.search}`;
  } catch {
    return "";
  }
};

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
      console.error(`Failed Cloudinary removal for ${tool.slug}: ${error.message}`);
    }
  }

  await Tool.deleteOne({ _id: tool._id });
  console.log(`Removed duplicate tool: ${tool.slug} (${tool.name})`);
};

const run = async () => {
  await connectDatabase();

  const tools = await Tool.find({}, "name slug websiteUrl image category createdAt").lean();
  const groups = new Map();

  for (const tool of tools) {
    const key = normalizeUrl(tool.websiteUrl);
    if (!key) {
      continue;
    }

    groups.set(key, [...(groups.get(key) || []), tool]);
  }

  const duplicateGroups = [...groups.entries()].filter(([, items]) => items.length > 1);
  console.log(`Found ${duplicateGroups.length} same-website duplicate groups.`);

  for (const [url, items] of duplicateGroups) {
    const sortedItems = [...items].sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt));
    const [keeper, ...duplicates] = sortedItems;
    console.log(`Keeping ${keeper.slug} for ${url}`);

    for (const duplicate of duplicates) {
      await removeToolAndLogo(duplicate);
    }
  }

  await recalculateCategoryCounts();
  console.log("Category counts recalculated.");
  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error("Same website duplicate cleanup failed", error);
  await mongoose.connection.close();
  process.exit(1);
});
