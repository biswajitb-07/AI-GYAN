import Parser from "rss-parser";
import { env } from "../config/env.js";
import { cloudinary } from "../config/cloudinary.js";
import { NewsArticle } from "../models/NewsArticle.js";
import { createSlug } from "../utils/createSlug.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

const parser = new Parser({
  customFields: {
    item: [
      ["content:encoded", "contentEncoded"],
      ["dc:creator", "creator"],
    ],
  },
});

const DEFAULT_FEED_URLS = [
  "https://techcrunch.com/category/artificial-intelligence/feed/",
  "https://www.technologyreview.com/topic/artificial-intelligence/feed/",
  "https://www.artificialintelligence-news.com/feed/",
];
const NEWS_BATCH_SIZE = 5;
const CANDIDATE_POOL_LIMIT = 40;
const ENRICHED_POOL_LIMIT = 15;
const NEWS_TIMEZONE = env.newsSyncTimezone || "Asia/Kolkata";
const FEED_URLS = String(env.aiNewsFeedUrls || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const ACTIVE_FEEDS = FEED_URLS.length ? FEED_URLS : DEFAULT_FEED_URLS;

let activeSyncPromise = null;
let schedulerStarted = false;

const decodeEntities = (value = "") =>
  String(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const stripHtml = (value = "") =>
  decodeEntities(String(value).replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

const clampText = (value, maxLength) => {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return "";
  }

  return normalized.length <= maxLength ? normalized : `${normalized.slice(0, maxLength - 1).trim()}...`;
};

const getNewsDateKey = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: NEWS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const fetchText = async (url, timeoutMs = 12000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; AI-Gyan-NewsSync/1.0)",
        accept: "text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.text();
  } finally {
    clearTimeout(timeout);
  }
};

const extractImageFromMarkup = (markup = "") => {
  const imageMatch = String(markup).match(/<img[^>]+src=["']([^"']+)["']/i);
  return imageMatch?.[1] || "";
};

const extractMetaImage = (html = "") => {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return "";
};

const getExistingNews = () => NewsArticle.find().sort({ publishedAt: -1 }).limit(NEWS_BATCH_SIZE).lean();
const createBatchSignature = (articles = []) => articles.map((article) => article.articleUrl).join("|");

const purgeExistingNewsWithImages = async () => {
  const existingArticles = await NewsArticle.find({}).select("_id image.publicId").lean();
  const publicIds = [...new Set(existingArticles.map((article) => article?.image?.publicId).filter(Boolean))];

  await Promise.all(
    publicIds.map(async (publicId) => {
      try {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: "image",
        });
      } catch (error) {
        console.error("Failed to delete news image from Cloudinary", publicId, error.message);
      }
    })
  );

  await NewsArticle.deleteMany({});
};

const normalizeAbsoluteUrl = (value, baseUrl = "") => {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return "";
  }

  if (normalized.startsWith("//")) {
    return `https:${normalized}`;
  }

  try {
    return new URL(normalized, baseUrl || undefined).href;
  } catch {
    return normalized;
  }
};

const getHostnameLabel = (value = "") => {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

const fetchFeedItems = async (feedUrl) => {
  const xml = await fetchText(feedUrl);
  const feed = await parser.parseString(xml);

  return (feed.items || []).map((item) => ({
    title: stripHtml(item.title),
    articleUrl: item.link,
    summary: clampText(stripHtml(item.contentSnippet || item.contentEncoded || item.content || item.summary || item.description), 260),
    publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
    sourceName: stripHtml(item.source?.title || feed.title || getHostnameLabel(item.link) || "AI News"),
    sourceFeed: feed.title || "",
    contentEncoded: item.contentEncoded || item["content:encoded"] || item.content || item.description || "",
  }));
};

const buildCandidatePool = async () => {
  const settled = await Promise.allSettled(ACTIVE_FEEDS.map(fetchFeedItems));
  const candidates = [];
  const seenLinks = new Set();

  settled.forEach((entry) => {
    if (entry.status !== "fulfilled") {
      return;
    }

    entry.value.forEach((item) => {
      if (!item.articleUrl || seenLinks.has(item.articleUrl)) {
        return;
      }

      seenLinks.add(item.articleUrl);
      candidates.push(item);
    });
  });

  return candidates
    .filter((item) => item.title && item.summary)
    .sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime())
    .slice(0, CANDIDATE_POOL_LIMIT);
};

const enrichArticle = async (item, syncDateKey, index) => {
  const articleHtml = await fetchText(item.articleUrl, 15000).catch(() => "");
  const imageUrl = normalizeAbsoluteUrl(extractImageFromMarkup(item.contentEncoded) || extractMetaImage(articleHtml), item.articleUrl);

  if (!imageUrl) {
    return null;
  }
  const publishedAt = new Date(item.publishedAt);

  return {
    title: clampText(item.title, 180),
    slug: `${createSlug(item.title)}-${syncDateKey}-${index + 1}`,
    summary: clampText(item.summary, 260),
    articleUrl: item.articleUrl,
    sourceName: clampText(item.sourceName, 80) || "AI News",
    sourceFeed: clampText(item.sourceFeed, 120),
    imageUrl,
    publishedAt: Number.isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
    syncDateKey,
  };
};

const buildPreparedArticles = async (candidates, syncDateKey) => {
  const preparedArticles = [];

  for (let index = 0; index < candidates.length && preparedArticles.length < ENRICHED_POOL_LIMIT; index += 1) {
    try {
      const article = await enrichArticle(candidates[index], syncDateKey, preparedArticles.length);

      if (article) {
        preparedArticles.push(article);
      }
    } catch (error) {
      console.error("Failed to prepare news article", candidates[index]?.articleUrl, error.message);
    }
  }

  return preparedArticles;
};

const selectNewsBatch = (preparedArticles, existingNews, force) => {
  const primaryBatch = preparedArticles.slice(0, NEWS_BATCH_SIZE);

  if (primaryBatch.length < NEWS_BATCH_SIZE) {
    return {
      articles: primaryBatch,
      changed: createBatchSignature(primaryBatch) !== createBatchSignature(existingNews),
    };
  }

  const existingUrls = new Set(existingNews.map((article) => article.articleUrl));
  const primaryChanged = createBatchSignature(primaryBatch) !== createBatchSignature(existingNews);

  if (!force || primaryChanged || !existingUrls.size) {
    return {
      articles: primaryBatch,
      changed: primaryChanged,
    };
  }

  const alternateArticles = preparedArticles.filter((article) => !existingUrls.has(article.articleUrl));

  if (alternateArticles.length) {
    const rotatedBatch = [...alternateArticles, ...primaryBatch.filter((article) => !alternateArticles.some((candidate) => candidate.articleUrl === article.articleUrl))].slice(
      0,
      NEWS_BATCH_SIZE
    );
    const rotatedChanged = createBatchSignature(rotatedBatch) !== createBatchSignature(existingNews);

    if (rotatedBatch.length === NEWS_BATCH_SIZE && rotatedChanged) {
      return {
        articles: rotatedBatch,
        changed: true,
      };
    }
  }

  return {
    articles: primaryBatch,
    changed: false,
  };
};

const uploadSelectedBatchImages = async (articles = []) => {
  const uploadedArticles = [];

  for (const article of articles) {
    const uploadedImage = await uploadToCloudinary(article.imageUrl, "ai-gyan/news");
    uploadedArticles.push({
      ...article,
      image: uploadedImage,
    });
  }

  return uploadedArticles;
};

export const syncLatestNewsWithMeta = async ({ force = false } = {}) => {
  if (activeSyncPromise) {
    return activeSyncPromise;
  }

  activeSyncPromise = (async () => {
    const syncDateKey = getNewsDateKey();
    const currentBatch = await NewsArticle.find({ syncDateKey }).sort({ publishedAt: -1 }).limit(NEWS_BATCH_SIZE).lean();

    if (!force && currentBatch.length >= NEWS_BATCH_SIZE) {
      return {
        articles: currentBatch,
        changed: false,
      };
    }

    const existingNews = await getExistingNews();
    const candidates = await buildCandidatePool();
    const preparedArticles = await buildPreparedArticles(candidates, syncDateKey);
    const selectedBatch = selectNewsBatch(preparedArticles, existingNews, force);

    if (selectedBatch.articles.length < NEWS_BATCH_SIZE) {
      if (existingNews.length) {
        return {
          articles: existingNews,
          changed: false,
        };
      }

      throw new Error("Unable to fetch enough AI news articles");
    }

    const uploadReadyBatch = await uploadSelectedBatchImages(selectedBatch.articles);
    await purgeExistingNewsWithImages();
    await NewsArticle.insertMany(
      uploadReadyBatch.map(({ imageUrl, ...article }) => article)
    );

    return {
      articles: await getExistingNews(),
      changed: selectedBatch.changed,
    };
  })();

  try {
    return await activeSyncPromise;
  } finally {
    activeSyncPromise = null;
  }
};

export const syncLatestNews = async (options = {}) => {
  const result = await syncLatestNewsWithMeta(options);
  return result.articles;
};

export const ensureLatestNews = async () => {
  const syncDateKey = getNewsDateKey();
  const currentBatch = await NewsArticle.find({ syncDateKey }).sort({ publishedAt: -1 }).limit(NEWS_BATCH_SIZE).lean();

  if (currentBatch.length >= NEWS_BATCH_SIZE) {
    return currentBatch;
  }

  return syncLatestNews();
};

export const startNewsSyncScheduler = () => {
  if (schedulerStarted) {
    return;
  }

  schedulerStarted = true;

  setTimeout(() => {
    ensureLatestNews().catch((error) => {
      console.error("Initial AI news sync failed", error.message);
    });
  }, 5000);

  setInterval(() => {
    ensureLatestNews().catch((error) => {
      console.error("Scheduled AI news sync failed", error.message);
    });
  }, 60 * 60 * 1000);
};
