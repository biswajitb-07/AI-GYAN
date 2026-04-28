import { env } from "../config/env.js";
import { Tool } from "../models/Tool.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { clampString } from "../utils/requestSafety.js";

const shouldRetryWithAnotherModel = (errorMessage) =>
  /no endpoints found|no provider available|not available|temporarily unavailable/i.test(errorMessage);

const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "for",
  "from",
  "i",
  "in",
  "is",
  "me",
  "need",
  "of",
  "on",
  "or",
  "please",
  "show",
  "some",
  "suggest",
  "suggestion",
  "the",
  "to",
  "tool",
  "tools",
  "want",
]);

const greetingTokens = new Set([
  "hello",
  "hey",
  "hi",
  "hii",
  "hiii",
  "hiiii",
  "yo",
  "sup",
  "hola",
  "namaste",
  "hy",
]);

const vagueQueryTokens = new Set([
  "ai",
  "tool",
  "tools",
  "help",
  "idea",
  "ideas",
  "recommend",
  "recommendation",
  "suggest",
  "suggestion",
]);

const categoryIntentMap = {
  "Video Editing": ["video", "videos", "yt", "youtube", "edit", "editing", "short", "shorts", "reel", "clips", "subtitle"],
  "Avatar / Video Avatar": ["avatar", "presenter", "talking", "dub", "dubbing", "face", "spokesperson"],
  "Audio / Voice": ["voice", "audio", "speech", "tts", "podcast", "transcript", "transcription", "dub"],
  Writing: ["write", "writing", "blog", "copy", "script", "article", "caption", "content"],
  "Image Generation": ["image", "art", "photo", "poster", "logo", "thumbnail", "design"],
  Design: ["ui", "design", "graphics", "brand", "creative"],
  Coding: ["code", "coding", "developer", "dev", "app", "website", "programming"],
  Research: ["research", "search", "find", "paper", "study", "knowledge"],
  Productivity: ["notes", "meeting", "summary", "task", "calendar", "productivity"],
  Marketing: ["marketing", "campaign", "ads", "sales", "lead", "outreach"],
  "Social Media": ["social", "instagram", "linkedin", "twitter", "x", "post", "creator"],
  Chatbots: ["chatbot", "bot", "support", "assistant", "chat"],
  Education: ["learn", "education", "student", "teacher", "course", "quiz"],
};

const tokenAliases = {
  yt: ["youtube", "video"],
  youtube: ["yt", "video"],
  vid: ["video"],
  vids: ["video"],
  short: ["shorts", "video"],
  shorts: ["short", "video"],
  reel: ["reels", "video"],
  reels: ["reel", "video"],
  edit: ["editing", "editor", "video"],
  editing: ["edit", "editor", "video"],
  subtitle: ["subtitles", "caption", "video"],
  subtitles: ["subtitle", "caption", "video"],
  caption: ["captions", "subtitle"],
  captions: ["caption", "subtitle"],
};

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9+/.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (value) => {
  const tokens = normalizeText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token && token.length > 1 && !stopWords.has(token));

  const expanded = new Set(tokens);

  for (const token of tokens) {
    for (const alias of tokenAliases[token] || []) {
      expanded.add(alias);
    }
  }

  return [...expanded];
};

const getIntentCategories = (tokens) =>
  Object.entries(categoryIntentMap)
    .filter(([, keywords]) => keywords.some((keyword) => tokens.includes(keyword)))
    .map(([category]) => category);

const isGreetingOnly = (message, tokens) => {
  const normalized = normalizeText(message);

  if (!normalized) {
    return false;
  }

  const compact = normalized.replace(/\s+/g, "");

  if (greetingTokens.has(compact)) {
    return true;
  }

  return tokens.length > 0 && tokens.every((token) => greetingTokens.has(token));
};

const isTooVagueToRecommend = (tokens, intentCategories) => {
  if (intentCategories.length > 0) {
    return false;
  }

  if (!tokens.length) {
    return true;
  }

  return tokens.every((token) => vagueQueryTokens.has(token) || greetingTokens.has(token));
};

const buildToolSearchScore = (tool, tokens, normalizedQuery, intentCategories) => {
  const fields = {
    name: normalizeText(tool.name),
    category: normalizeText(tool.category),
    description: normalizeText(tool.description),
    longDescription: normalizeText(tool.longDescription),
    pricing: normalizeText(tool.pricing),
    tags: tool.tags.map((tag) => normalizeText(tag)),
  };

  let score = 0;
  let relevanceMatched = false;

  if (fields.name === normalizedQuery) {
    score += 160;
    relevanceMatched = true;
  }

  if (fields.name.includes(normalizedQuery) && normalizedQuery.length > 2) {
    score += 50;
    relevanceMatched = true;
  }

  if (intentCategories.includes(tool.category)) {
    score += 42;
    relevanceMatched = true;
  }

  for (const token of tokens) {
    if (fields.name.split(" ").includes(token)) {
      score += 18;
      relevanceMatched = true;
    } else if (fields.name.includes(token)) {
      score += 12;
      relevanceMatched = true;
    }

    if (fields.category.includes(token)) {
      score += 14;
      relevanceMatched = true;
    }

    if (fields.pricing === token) {
      score += 8;
    }

    if (fields.tags.some((tag) => tag === token)) {
      score += 14;
      relevanceMatched = true;
    } else if (fields.tags.some((tag) => tag.includes(token))) {
      score += 9;
      relevanceMatched = true;
    }

    if (fields.description.includes(token)) {
      score += 5;
      relevanceMatched = true;
    }

    if (fields.longDescription.includes(token)) {
      score += 3;
      relevanceMatched = true;
    }
  }

  if (!relevanceMatched) {
    return 0;
  }

  if (tool.featured) {
    score += 4;
  }

  score += Math.min(Number(tool.viewCount || 0) / 250, 10);
  score += Math.min(Number(tool.rating || 0), 5);

  return score;
};

const compactTool = (tool) => ({
  name: tool.name,
  slug: tool.slug,
  category: tool.category,
  pricing: tool.pricing,
  description: tool.description,
  image: tool.image,
});

const buildFallbackReply = (message, tools, intentCategories) => {
  if (!tools.length) {
    return `I could not find a strong match for "${message}". Try adding your goal like video editing, coding, image generation, or chatbot.`;
  }

  const intro = intentCategories.length
    ? `For ${intentCategories[0].toLowerCase()}, these tools look like the best fit:`
    : `These tools match your request best:`;

  const lines = tools.slice(0, 3).map((tool) => `${tool.name} for ${tool.description.toLowerCase()}`);

  return `${intro} ${lines.join(" ")}`;
};

const buildGreetingReply = () =>
  "Hi! Tell me what you want to do, and I will suggest the right AI tools. For example: YouTube video editing, coding assistant, logo design, voice cloning, or research.";

const buildClarifyingReply = (message) =>
  `I can help with that. Tell me your goal a bit more clearly, like "${message} for YouTube editing", "${message} for coding", or "${message} for image generation".`;

const buildAiPrompt = (message, tools, intentCategories) => {
  const toolCatalog = tools
    .slice(0, 6)
    .map(
      (tool, index) =>
        `${index + 1}. ${tool.name} | ${tool.category} | ${tool.pricing} | ${tool.description} | tags: ${tool.tags.join(", ")} | slug: ${tool.slug}`
    )
    .join("\n");

  const intentLine = intentCategories.length
    ? `Detected user intent: ${intentCategories.join(", ")}.`
    : "Detected user intent: infer from the user query.";

  return [
    {
      role: "system",
      content:
        "You are Ai Gyan assistant. Recommend only tools from the provided catalog. Never suggest tutorials, YouTube videos, courses, or made-up products. If the query is rough like 'yt video', infer the likely use case and map it to relevant tool categories. Keep the answer concise, practical, and under 120 words. Mention 2 to 4 tool names and why they fit.",
    },
    {
      role: "system",
      content: `${intentLine}\nCatalog:\n${toolCatalog}`,
    },
    {
      role: "user",
      content: message,
    },
  ];
};

const generateGroundedReply = async (message, tools, intentCategories) => {
  const configuredModels = String(env.aiChatModel || "")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);

  if (!env.aiApiUrl || !env.aiApiKey || !configuredModels.length || !tools.length) {
    return { reply: buildFallbackReply(message, tools, intentCategories), model: "catalog-fallback" };
  }

  const candidateModels = [
    ...new Set([
      ...configuredModels,
      ...env.aiFallbackModels,
      env.aiApiUrl.includes("openrouter.ai") ? "openrouter/auto" : "",
    ].filter(Boolean)),
  ];
  const messages = buildAiPrompt(message, tools, intentCategories);
  let lastError = "AI chat request failed";

  for (const model of candidateModels) {
    try {
      const response = await fetch(env.aiApiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.aiApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": env.clientUrl,
          "X-Title": "Ai Gyan",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.4,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        const reply = String(data.choices?.[0]?.message?.content || "").trim();

        if (reply) {
          return { reply, model };
        }
      }

      lastError = data.error?.message || "AI chat request failed";

      if (!shouldRetryWithAnotherModel(lastError)) {
        break;
      }
    } catch (error) {
      lastError = error.message || "AI chat request failed";

      if (!shouldRetryWithAnotherModel(lastError)) {
        break;
      }
    }
  }

  return { reply: buildFallbackReply(message, tools, intentCategories), model: "catalog-fallback" };
};

export const chatWithAi = asyncHandler(async (req, res) => {
  const message = clampString(req.body.message, 400);

  if (!message) {
    res.status(400);
    throw new Error("Message is required");
  }

  const normalizedQuery = normalizeText(message);
  const tokens = tokenize(message);
  const intentCategories = getIntentCategories(tokens);

  if (isGreetingOnly(message, tokens)) {
    res.json({
      data: {
        reply: buildGreetingReply(),
        model: "conversation-guard",
        suggestions: [],
        intentCategories: [],
      },
    });
    return;
  }

  if (isTooVagueToRecommend(tokens, intentCategories)) {
    res.json({
      data: {
        reply: buildClarifyingReply(message),
        model: "conversation-guard",
        suggestions: [],
        intentCategories,
      },
    });
    return;
  }

  const tools = await Tool.find()
    .select("name slug category pricing description longDescription tags featured viewCount rating image")
    .lean();

  const rankedTools = tools
    .map((tool) => ({
      ...tool,
      score: buildToolSearchScore(tool, tokens, normalizedQuery, intentCategories),
    }))
    .filter((tool) => tool.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 8);

  if (!rankedTools.length || (rankedTools[0]?.score || 0) < 18) {
    res.json({
      data: {
        reply: buildClarifyingReply(message),
        model: "conversation-guard",
        suggestions: [],
        intentCategories,
      },
    });
    return;
  }

  const suggestions = rankedTools.slice(0, 4).map(compactTool);
  const { reply, model } = await generateGroundedReply(message, rankedTools, intentCategories);

  res.json({
    data: {
      reply,
      model,
      suggestions,
      intentCategories,
    },
  });
});
