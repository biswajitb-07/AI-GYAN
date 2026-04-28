import { PageView } from "../models/PageView.js";
import { SearchQuery } from "../models/SearchQuery.js";
import { Tool } from "../models/Tool.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const trackPageView = asyncHandler(async (req, res) => {
  const path = String(req.body.path || "").trim();
  const toolSlug = String(req.body.toolSlug || "").trim();
  const sessionId = String(req.body.sessionId || "").trim();

  if (!path) {
    res.status(400);
    throw new Error("Path is required");
  }

  if (sessionId) {
    const existingView = await PageView.findOne({ path, sessionId });

    if (existingView) {
      res.status(200).json({ success: true, deduped: true });
      return;
    }
  }

  await PageView.create({
    path,
    toolSlug,
    sessionId,
  });

  if (toolSlug) {
    await Tool.findOneAndUpdate({ slug: toolSlug }, { $inc: { viewCount: 1 } });
  }

  res.status(201).json({ success: true });
});

export const trackSearchQuery = asyncHandler(async (req, res) => {
  const term = String(req.body.term || "").trim();
  const hasResults = req.body.hasResults !== false;

  if (!term) {
    res.status(400);
    throw new Error("Search term is required");
  }

  await SearchQuery.findOneAndUpdate(
    { term },
    {
      $inc: {
        count: 1,
        ...(hasResults ? {} : { noResultCount: 1 }),
      },
      $set: {
        lastSearchedAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  res.status(201).json({ success: true });
});
