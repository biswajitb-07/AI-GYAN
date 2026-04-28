import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { requireAdminAuth } from "../middleware/adminAuth.js";

const router = Router();

router.use(requireAdminAuth);
router.get("/stats", getDashboardStats);

export default router;
