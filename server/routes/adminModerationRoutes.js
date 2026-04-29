import { Router } from "express";
import {
  checkSingleToolLink,
  getFeedbackQueue,
  getModerationStats,
  runBulkToolLinkScan,
  updateFeedbackStatus,
} from "../controllers/moderationController.js";
import { requireAdminAuth } from "../middleware/adminAuth.js";

const router = Router();

router.use(requireAdminAuth);
router.get("/stats", getModerationStats);
router.get("/feedback", getFeedbackQueue);
router.put("/feedback/:id", updateFeedbackStatus);
router.post("/tools/:id/check-link", checkSingleToolLink);
router.post("/tools/check-links", runBulkToolLinkScan);

export default router;
