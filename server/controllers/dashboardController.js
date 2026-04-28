import { Category } from "../models/Category.js";
import { PageView } from "../models/PageView.js";
import { SearchQuery } from "../models/SearchQuery.js";
import { Tool } from "../models/Tool.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalTools, totalCategories, featuredTools, totalVisitors, pricingBreakdown, categoryBreakdown, recentTools, topSearches, noResultSearches] =
    await Promise.all([
      Tool.countDocuments(),
      Category.countDocuments(),
      Tool.countDocuments({ featured: true }),
      PageView.distinct("sessionId").then((sessions) => sessions.filter(Boolean).length),
      Tool.aggregate([{ $group: { _id: "$pricing", count: { $sum: 1 } } }]),
      Tool.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      Tool.find().sort({ createdAt: -1 }).limit(6).select("name category pricing featured createdAt viewCount"),
      SearchQuery.find().sort({ count: -1, lastSearchedAt: -1 }).limit(8).select("term count lastSearchedAt"),
      SearchQuery.find({ noResultCount: { $gt: 0 } }).sort({ noResultCount: -1, lastSearchedAt: -1 }).limit(8).select("term noResultCount lastSearchedAt"),
    ]);

  res.json({
    data: {
      overview: {
        totalTools,
        totalCategories,
        featuredTools,
        totalVisitors,
      },
      pricingBreakdown,
      categoryBreakdown,
      recentTools,
      topSearches,
      noResultSearches,
    },
  });
});
