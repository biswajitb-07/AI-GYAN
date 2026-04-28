import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  mongoUri: process.env.MONGODB_URI,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  adminUrl: process.env.ADMIN_URL || "http://localhost:5174",
  adminEmail: process.env.ADMIN_EMAIL || "admin@aigyan.com",
  adminPassword: process.env.ADMIN_PASSWORD || "Admin@123",
  adminAuthSecret: process.env.ADMIN_AUTH_SECRET || "ai-gyan-admin-secret",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  aiNewsFeedUrls: process.env.AI_NEWS_FEED_URLS || "",
  newsSyncTimezone: process.env.NEWS_SYNC_TIMEZONE || "Asia/Kolkata",
  aiApiUrl: process.env.AI_API_URL || "",
  aiApiKey: process.env.AI_API_KEY || "",
  aiChatModel: process.env.AI_CHAT_MODEL || "",
  aiFallbackModels: String(process.env.AI_FALLBACK_MODELS || "")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean),
};
