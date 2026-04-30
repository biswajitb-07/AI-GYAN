import { Category } from "../models/Category.js";
import { SearchQuery } from "../models/SearchQuery.js";
import { Tool } from "../models/Tool.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalTools, totalCategories, featuredTools, pricingBreakdown, categoryBreakdown, recentTools, topSearches, noResultSearches] =
    await Promise.all([
      Tool.countDocuments(),
      Category.countDocuments(),
      Tool.countDocuments({ featured: true }),
      Tool.aggregate([{ $group: { _id: "$pricing", count: { $sum: 1 } } }]),
      Tool.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      Tool.find().sort({ createdAt: -1 }).limit(6).select("name category pricing featured createdAt viewCount").lean(),
      SearchQuery.find().sort({ count: -1, lastSearchedAt: -1 }).limit(8).select("term count lastSearchedAt").lean(),
      SearchQuery.find({ noResultCount: { $gt: 0 } }).sort({ noResultCount: -1, lastSearchedAt: -1 }).limit(8).select("term noResultCount lastSearchedAt").lean(),
    ]);

  res.json({
    data: {
      overview: {
        totalTools,
        totalCategories,
        featuredTools,
      },
      pricingBreakdown,
      categoryBreakdown,
      recentTools,
      topSearches,
      noResultSearches,
    },
  });
});
