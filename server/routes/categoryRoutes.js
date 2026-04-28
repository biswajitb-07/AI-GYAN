import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategoryBySlug,
  getCategories,
  updateCategory,
} from "../controllers/categoryController.js";

const router = Router();

router.get("/", getCategories);
router.get("/:slug", getCategoryBySlug);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
