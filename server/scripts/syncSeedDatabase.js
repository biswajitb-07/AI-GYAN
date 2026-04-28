import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import { Category } from "../models/Category.js";
import { Tool } from "../models/Tool.js";
import { categories, tools } from "../seed/toolSeedData.js";

const syncSeedDatabase = async () => {
  await connectDatabase();

  let insertedCategories = 0;
  let insertedTools = 0;

  for (const category of categories) {
    const result = await Category.updateOne(
      { slug: category.slug },
      { $setOnInsert: { ...category, toolCount: 0 } },
      { upsert: true }
    );

    if (result.upsertedCount) {
      insertedCategories += 1;
    }
  }

  for (const tool of tools) {
    const result = await Tool.updateOne(
      { slug: tool.slug },
      { $setOnInsert: tool },
      { upsert: true }
    );

    if (result.upsertedCount) {
      insertedTools += 1;
    }
  }

  const categoryCounts = await Tool.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);

  for (const entry of categoryCounts) {
    await Category.updateOne({ name: entry._id }, { $set: { toolCount: entry.count } });
  }

  console.log(`Inserted ${insertedCategories} new categories and ${insertedTools} new tools`);
  await mongoose.connection.close();
};

syncSeedDatabase().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});
