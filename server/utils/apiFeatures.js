export const buildToolFilters = (query) => {
  const filters = {};

  if (query.search) {
    filters.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
      { tags: { $in: [new RegExp(query.search, "i")] } },
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

  if (query.tag) {
    filters.tags = { $in: [new RegExp(query.tag, "i")] };
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
