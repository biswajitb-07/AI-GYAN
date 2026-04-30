import { Category } from "../models/Category.js";
import { Tool } from "../models/Tool.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createSlug } from "../utils/createSlug.js";
import { getPagination } from "../utils/apiFeatures.js";
import { clampString, toSafeRegex } from "../utils/requestSafety.js";

export const getCategories = asyncHandler(async (req, res) => {
  const filters = {};
  const { page, limit, skip } = getPagination(req.query);

  const search = clampString(req.query.search, 80);

  if (search) {
    filters.$or = [
      { name: { $regex: toSafeRegex(search) } },
      { description: { $regex: toSafeRegex(search) } },
    ];
  }

  const [categories, total] = await Promise.all([
    Category.find(filters).sort({ toolCount: -1, name: 1 }).skip(skip).limit(limit).lean(),
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
    name: clampString(req.body.name, 80),
    slug: createSlug(req.body.name),
    description: clampString(req.body.description, 400),
    icon: clampString(req.body.icon || "Sparkles", 40),
    color: clampString(req.body.color || "from-sky-500 to-cyan-400", 80),
  });

  res.status(201).json({ data: category });
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug }).lean();

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  const { page, limit, skip } = getPagination(req.query);
  const [tools, total] = await Promise.all([
    Tool.find({ category: category.name }).sort({ featured: -1, viewCount: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
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
      name: clampString(nextName, 80),
      description: clampString(req.body.description ?? current.description, 400),
      icon: clampString(req.body.icon ?? current.icon, 40),
      color: clampString(req.body.color ?? current.color, 80),
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

export const deleteCategoriesBulk = asyncHandler(async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  const sanitizedIds = ids.map((id) => String(id || "").trim()).filter(Boolean);

  if (!sanitizedIds.length) {
    res.status(400);
    throw new Error("At least one category id is required");
  }

  const categories = await Category.find({ _id: { $in: sanitizedIds } }).select("_id");

  if (!categories.length) {
    res.status(404);
    throw new Error("No categories found for deletion");
  }

  await Category.deleteMany({ _id: { $in: categories.map((category) => category._id) } });

  res.json({
    message: "Categories deleted successfully",
    deletedCount: categories.length,
  });
});
