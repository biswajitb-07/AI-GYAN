import { Router } from "express";
import {
  createTool,
  deleteToolsBulk,
  deleteTool,
  getToolBySlug,
  getTools,
  updateTool,
} from "../controllers/toolController.js";
import { requireAdminAuth } from "../middleware/adminAuth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.use(requireAdminAuth);
router.get("/", getTools);
router.get("/slug/:slug", getToolBySlug);
router.post("/", upload.single("image"), createTool);
router.delete("/", deleteToolsBulk);
router.put("/:id", upload.single("image"), updateTool);
router.delete("/:id", deleteTool);

export default router;
