import compression from "compression";
import cors from "cors";
import express from "express";
import fs from "fs";
import helmet from "helmet";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminCategoryRoutes from "./routes/adminCategoryRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import adminModerationRoutes from "./routes/adminModerationRoutes.js";
import adminNewsRoutes from "./routes/adminNewsRoutes.js";
import adminToolRoutes from "./routes/adminToolRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import toolRoutes from "./routes/toolRoutes.js";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { aiLimiter, analyticsLimiter, authLimiter } from "./middleware/rateLimiters.js";

fs.mkdirSync("tmp", { recursive: true });

const app = express();
const allowedOrigins = new Set([env.clientUrl, env.adminUrl].filter(Boolean));

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(compression());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: true, limit: "200kb" }));

app.get("/api/health", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({ status: "ok" });
});

app.use("/api/tools", toolRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/feedback", analyticsLimiter, feedbackRoutes);
app.use("/api/analytics", analyticsLimiter, analyticsRoutes);
app.use("/api/ai", aiLimiter, aiRoutes);
app.use("/api/admin-auth", authLimiter, adminAuthRoutes);
app.use("/api/admin/tools", adminToolRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/moderation", adminModerationRoutes);
app.use("/api/admin/news", adminNewsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
