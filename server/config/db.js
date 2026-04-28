import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDatabase = async () => {
  if (!env.mongoUri) {
    throw new Error("MONGODB_URI is missing");
  }

  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
};
