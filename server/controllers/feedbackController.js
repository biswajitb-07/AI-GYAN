import { Feedback } from "../models/Feedback.js";
import { Tool } from "../models/Tool.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { clampString, isValidHttpUrl } from "../utils/requestSafety.js";

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

export const createFeedback = asyncHandler(async (req, res) => {
  const message = clampString(req.body.message, 1200);
  const name = clampString(req.body.name, 80);
  const email = clampString(req.body.email, 140);
  const pageUrl = clampString(req.body.pageUrl, 300);
  const type = clampString(req.body.type, 40) || "Suggestion";
  const status = "open";
  const toolSlug = clampString(req.body.toolSlug, 120);
  const source = clampString(req.body.source, 40) || "public-site";
  let toolId = null;
  let toolName = "";

  if (!message) {
    res.status(400);
    throw new Error("Feedback message is required");
  }

  if (email && !isValidEmail(email)) {
    res.status(400);
    throw new Error("Please enter a valid email address");
  }

  if (pageUrl && !isValidHttpUrl(pageUrl)) {
    res.status(400);
    throw new Error("Please enter a valid page URL");
  }

  if (toolSlug) {
    const tool = await Tool.findOne({ slug: toolSlug }).select("_id name slug").lean();

    if (tool) {
      toolId = tool._id;
      toolName = tool.name;
    }
  }

  const feedback = await Feedback.create({
    name,
    email,
    status,
    message,
    pageUrl,
    type,
    toolId,
    toolName,
    toolSlug,
    source,
  });

  res.status(201).json({
    message: "Thanks for the feedback. We will review your suggestion.",
    data: {
      id: feedback._id,
      message: "Thanks for the feedback. We will review your suggestion.",
    },
  });
});
