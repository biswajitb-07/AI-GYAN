import { Router } from "express";
import { trackPageView, trackSearchQuery } from "../controllers/analyticsController.js";

const router = Router();

router.post("/view", trackPageView);
router.post("/search", trackSearchQuery);

export default router;
