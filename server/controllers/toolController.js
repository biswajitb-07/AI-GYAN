import fs from "fs";
import { cloudinary } from "../config/cloudinary.js";
import { Tool } from "../models/Tool.js";
import { Category } from "../models/Category.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildToolFilters, getPagination } from "../utils/apiFeatures.js";
import { createSlug } from "../utils/createSlug.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { clampString, isValidHttpUrl } from "../utils/requestSafety.js";

const normalizeToolPayload = async (body, file) => {
  let image = body.imageUrl
    ? { url: body.imageUrl, publicId: body.imagePublicId || "" }
    : null;

  if (file) {
    image = await uploadToCloudinary(file.path);
    fs.unlinkSync(file.path);
  }

  if (!image?.url) {
    throw new Error("Image is required");
  }

  const name = body.name?.trim();
  const category = body.category?.trim();
  const websiteUrl = clampString(body.websiteUrl, 300);

  if (!name || !category) {
    throw new Error("Tool name and category are required");
  }

  if (!isValidHttpUrl(websiteUrl)) {
    throw new Error("A valid website URL is required");
  }

  return {
    name,
    slug: body.slug?.trim() || createSlug(name),
    description: clampString(body.description, 300),
    longDescription: clampString(body.longDescription || body.description, 2000),
    category,
    pricing: body.pricing,
    featured: body.featured === "true" || body.featured === true,
    websiteUrl,
    image,
    tags: Array.isArray(body.tags)
      ? body.tags
      : String(body.tags || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
          .slice(0, 12),
    rating: Number(body.rating) || 4.7,
    monthlyVisits: clampString(body.monthlyVisits || "10K+", 30),
  };
};

const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
};

const sortOptions = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  popular: { viewCount: -1, featured: -1, createdAt: -1 },
  rating: { rating: -1, featured: -1, createdAt: -1 },
  az: { name: 1 },
};

export const getTools = asyncHandler(async (req, res) => {
  const filters = buildToolFilters(req.query);
  const { page, limit, skip } = getPagination(req.query);
  const sort = sortOptions[req.query.sort] || { featured: -1, createdAt: -1 };

  const [tools, total] = await Promise.all([
    Tool.find(filters).sort(sort).skip(skip).limit(limit).lean(),
    Tool.countDocuments(filters),
  ]);

  res.json({
    data: tools,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const getFeaturedTools = asyncHandler(async (req, res) => {
  const tools = await Tool.find({ featured: true }).sort({ createdAt: -1 }).limit(8).lean();
  res.json({ data: tools });
});

export const getToolBySlug = asyncHandler(async (req, res) => {
  const tool = await Tool.findOne({ slug: req.params.slug }).lean();

  if (!tool) {
    res.status(404);
    throw new Error("Tool not found");
  }

  res.json({ data: tool });
});

export const getRelatedTools = asyncHandler(async (req, res) => {
  const currentTool = await Tool.findOne({ slug: req.params.slug }).lean();

  if (!currentTool) {
    res.status(404);
    throw new Error("Tool not found");
  }

  const tools = await Tool.find({
    slug: { $ne: currentTool.slug },
    $or: [
      { category: currentTool.category },
      { tags: { $in: currentTool.tags } },
    ],
  })
    .sort({ featured: -1, viewCount: -1, createdAt: -1 })
    .limit(6)
    .lean();

  res.json({ data: tools });
});

export const getCompareTools = asyncHandler(async (req, res) => {
  const slugs = String(req.query.slugs || "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean)
    .slice(0, 4);

  if (!slugs.length) {
    res.status(400);
    throw new Error("At least one tool slug is required");
  }

  const tools = await Tool.find({ slug: { $in: slugs } }).lean();
  const orderMap = new Map(slugs.map((slug, index) => [slug, index]));

  tools.sort((left, right) => (orderMap.get(left.slug) ?? 0) - (orderMap.get(right.slug) ?? 0));

  res.json({ data: tools });
});

export const createToolReview = asyncHandler(async (req, res) => {
  const tool = await Tool.findOne({ slug: req.params.slug });

  if (!tool) {
    res.status(404);
    throw new Error("Tool not found");
  }

  const review = {
    name: String(req.body.name || "Anonymous").trim() || "Anonymous",
    rating: Math.min(Math.max(Number(req.body.rating) || 5, 1), 5),
    comment: String(req.body.comment || "").trim(),
  };

  if (!review.comment) {
    res.status(400);
    throw new Error("Review comment is required");
  }

  tool.reviews.unshift(review);
  tool.rating = Number(
    (tool.reviews.reduce((total, current) => total + current.rating, 0) / tool.reviews.length).toFixed(1)
  );

  await tool.save();

  res.status(201).json({ data: tool.reviews[0], rating: tool.rating });
});

export const createTool = asyncHandler(async (req, res) => {
  const payload = await normalizeToolPayload(req.body, req.file);
  const tool = await Tool.create(payload);

  await Category.findOneAndUpdate({ slug: createSlug(payload.category) }, { $inc: { toolCount: 1 } });

  res.status(201).json({ data: tool });
});

export const updateTool = asyncHandler(async (req, res) => {
  const existing = await Tool.findById(req.params.id);

  if (!existing) {
    res.status(404);
    throw new Error("Tool not found");
  }

  const payload = await normalizeToolPayload(
    {
      ...existing.toObject(),
      ...req.body,
      imageUrl: req.body.imageUrl || existing.image.url,
      imagePublicId: req.body.imagePublicId || existing.image.publicId,
      tags: req.body.tags || existing.tags,
    },
    req.file
  );

  if (req.file && existing.image.publicId) {
    await deleteCloudinaryImage(existing.image.publicId);
  }

  if (existing.category !== payload.category) {
    await Promise.all([
      Category.findOneAndUpdate({ slug: createSlug(existing.category) }, { $inc: { toolCount: -1 } }),
      Category.findOneAndUpdate({ slug: createSlug(payload.category) }, { $inc: { toolCount: 1 } }),
    ]);
  }

  const tool = await Tool.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  res.json({ data: tool });
});

export const deleteTool = asyncHandler(async (req, res) => {
  const tool = await Tool.findById(req.params.id);

  if (!tool) {
    res.status(404);
    throw new Error("Tool not found");
  }

  await deleteCloudinaryImage(tool.image.publicId);
  await tool.deleteOne();
  await Category.findOneAndUpdate({ slug: createSlug(tool.category) }, { $inc: { toolCount: -1 } });

  res.json({ message: "Tool deleted successfully" });
});
