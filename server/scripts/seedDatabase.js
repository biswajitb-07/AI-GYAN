import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import { Category } from "../models/Category.js";
import { Tool } from "../models/Tool.js";
import { categories, tools } from "../seed/toolSeedData.js";

const seedDatabase = async () => {
  await connectDatabase();

  await Promise.all([Category.deleteMany({}), Tool.deleteMany({})]);

  const categoryDocs = categories.map((category) => ({
    ...category,
    toolCount: tools.filter((tool) => tool.category === category.name).length,
  }));

  await Category.insertMany(categoryDocs);
  await Tool.insertMany(tools);

  console.log(`Seeded ${categoryDocs.length} categories and ${tools.length} tools`);
  await mongoose.connection.close();
};

seedDatabase().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});
