import { asyncHandler } from "../utils/asyncHandler.js";
import { ensureLatestNews, syncLatestNewsWithMeta } from "../services/newsSyncService.js";

export const getLatestNews = asyncHandler(async (req, res) => {
  res.set("Cache-Control", "no-store");
  const articles = await ensureLatestNews();

  res.json({
    data: articles,
  });
});

export const syncAdminLatestNews = asyncHandler(async (req, res) => {
  res.set("Cache-Control", "no-store");
  const { articles, changed } = await syncLatestNewsWithMeta({ force: true });

  res.json({
    message: changed
      ? `Synced ${articles.length} latest AI news stories`
      : "Latest batch refreshed, but no newer stories were available yet",
    data: articles,
    changed,
  });
});
