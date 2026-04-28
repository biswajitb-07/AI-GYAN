import { Router } from "express";
import { syncAdminLatestNews } from "../controllers/newsController.js";
import { requireAdminAuth } from "../middleware/adminAuth.js";

const router = Router();

router.use(requireAdminAuth);
router.post("/sync", syncAdminLatestNews);

export default router;
