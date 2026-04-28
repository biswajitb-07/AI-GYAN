import { PageView } from "../models/PageView.js";
import { SearchQuery } from "../models/SearchQuery.js";
import { Tool } from "../models/Tool.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { clampString, sanitizePath } from "../utils/requestSafety.js";

export const trackPageView = asyncHandler(async (req, res) => {
  const path = sanitizePath(req.body.path);
  const toolSlug = clampString(req.body.toolSlug, 120);
  const sessionId = clampString(req.body.sessionId, 120);

  if (!path) {
    res.status(400);
    throw new Error("Path is required");
  }

  if (sessionId) {
    const result = await PageView.updateOne(
      { path, sessionId },
      {
        $setOnInsert: {
          path,
          toolSlug,
          sessionId,
        },
      },
      { upsert: true }
    );

    if (!result.upsertedCount) {
      res.status(200).json({ success: true, deduped: true });
      return;
    }
  } else {
    await PageView.create({
      path,
      toolSlug,
      sessionId,
    });
  }

  if (toolSlug) {
    await Tool.findOneAndUpdate({ slug: toolSlug }, { $inc: { viewCount: 1 } });
  }

  res.status(201).json({ success: true });
});

export const trackSearchQuery = asyncHandler(async (req, res) => {
  const term = clampString(req.body.term, 120);
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
