import { Category } from "../models/Category.js";
import { Tool } from "../models/Tool.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createSlug } from "../utils/createSlug.js";
import { getPagination } from "../utils/apiFeatures.js";

export const getCategories = asyncHandler(async (req, res) => {
  const filters = {};
  const { page, limit, skip } = getPagination(req.query);

  if (req.query.search) {
    filters.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { description: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const [categories, total] = await Promise.all([
    Category.find(filters).sort({ toolCount: -1, name: 1 }).skip(skip).limit(limit),
    Category.countDocuments(filters),
  ]);

  res.json({
    data: categories,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({
    name: req.body.name,
    slug: createSlug(req.body.name),
    description: req.body.description,
    icon: req.body.icon || "Sparkles",
    color: req.body.color || "from-sky-500 to-cyan-400",
  });

  res.status(201).json({ data: category });
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  const { page, limit, skip } = getPagination(req.query);
  const [tools, total] = await Promise.all([
    Tool.find({ category: category.name }).sort({ featured: -1, viewCount: -1, createdAt: -1 }).skip(skip).limit(limit),
    Tool.countDocuments({ category: category.name }),
  ]);

  res.json({
    data: {
      category,
      tools,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const current = await Category.findById(req.params.id);

  if (!current) {
    res.status(404);
    throw new Error("Category not found");
  }

  const nextName = req.body.name || current.name;

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      slug: createSlug(nextName),
    },
    { new: true, runValidators: true }
  );

  if (nextName !== current.name) {
    await Tool.updateMany({ category: current.name }, { category: nextName });
  }

  res.json({ data: category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  await category.deleteOne();
  res.json({ message: "Category deleted successfully" });
});
