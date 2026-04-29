import { Router } from "express";
import {
  createToolReview,
  createTool,
  deleteTool,
  getCompareTools,
  getFeaturedTools,
  getRelatedTools,
  getToolBySlug,
  getTools,
  submitToolClaim,
  submitToolReport,
  updateTool,
} from "../controllers/toolController.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.get("/", getTools);
router.get("/compare", getCompareTools);
router.get("/featured/list", getFeaturedTools);
router.get("/slug/:slug/related", getRelatedTools);
router.get("/slug/:slug", getToolBySlug);
router.post("/slug/:slug/reviews", createToolReview);
router.post("/slug/:slug/report", submitToolReport);
router.post("/slug/:slug/claim", submitToolClaim);
router.post("/", upload.single("image"), createTool);
router.put("/:id", upload.single("image"), updateTool);
router.delete("/:id", deleteTool);

export default router;
