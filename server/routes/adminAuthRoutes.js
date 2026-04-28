import { Router } from "express";
import { getAdminSession, loginAdmin, logoutAdmin } from "../controllers/adminAuthController.js";
import { requireAdminAuth } from "../middleware/adminAuth.js";

const router = Router();

router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.get("/session", requireAdminAuth, getAdminSession);

export default router;
