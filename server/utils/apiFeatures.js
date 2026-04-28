import { clampString, toSafeRegex } from "./requestSafety.js";

export const buildToolFilters = (query) => {
  const filters = {};
  const search = clampString(query.search, 80);
  const tag = clampString(query.tag, 40);

  if (search) {
    filters.$or = [
      { name: { $regex: toSafeRegex(search) } },
      { description: { $regex: toSafeRegex(search) } },
      { tags: { $in: [toSafeRegex(search)] } },
    ];
  }

  if (query.category) {
    filters.category = query.category;
  }

  if (query.pricing) {
    filters.pricing = query.pricing;
  }

  if (query.featured === "true") {
    filters.featured = true;
  }

  if (tag) {
    filters.tags = { $in: [toSafeRegex(tag)] };
  }

  return filters;
};

export const getPagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 12, 1), 200);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};
