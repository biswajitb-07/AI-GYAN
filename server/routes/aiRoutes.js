import { Router } from "express";
import { chatWithAi } from "../controllers/aiController.js";

const router = Router();

router.post("/chat", chatWithAi);

export default router;
