import cors from "cors";
import express from "express";
import fs from "fs";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminCategoryRoutes from "./routes/adminCategoryRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import adminToolRoutes from "./routes/adminToolRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import toolRoutes from "./routes/toolRoutes.js";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

fs.mkdirSync("tmp", { recursive: true });

const app = express();

app.use(
  cors({
    origin: [env.clientUrl, env.adminUrl],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/tools", toolRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin-auth", adminAuthRoutes);
app.use("/api/admin/tools", adminToolRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
