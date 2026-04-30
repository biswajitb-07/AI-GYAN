import { Router } from "express";
import {
  createCategory,
  deleteCategoriesBulk,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/categoryController.js";
import { requireAdminAuth } from "../middleware/adminAuth.js";

const router = Router();

router.use(requireAdminAuth);
router.get("/", getCategories);
router.post("/", createCategory);
router.delete("/", deleteCategoriesBulk);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
