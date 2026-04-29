import { Feedback } from "../models/Feedback.js";
import { Tool } from "../models/Tool.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination } from "../utils/apiFeatures.js";
import { runToolHealthCheck } from "../utils/toolHealthCheck.js";

const applyToolHealthResult = async (toolId, result) =>
  Tool.findByIdAndUpdate(
    toolId,
    {
      verificationStatus: result.verificationStatus,
      lastCheckedAt: result.lastCheckedAt,
      lastCheckStatusCode: result.lastCheckStatusCode,
      lastCheckFinalUrl: result.lastCheckFinalUrl,
      lastCheckIssue: result.lastCheckIssue,
    },
    { new: true }
  ).lean();

export const getModerationStats = asyncHandler(async (req, res) => {
  const [openFeedback, resolvedFeedback, toolReports, toolClaims, siteSuggestions, brokenLinks, reviewLinks, uncheckedLinks, recentlyChecked] = await Promise.all([
    Feedback.countDocuments({ status: "open" }),
    Feedback.countDocuments({ status: "resolved" }),
    Feedback.countDocuments({ type: "tool-report" }),
    Feedback.countDocuments({ type: "tool-claim" }),
    Feedback.countDocuments({ type: { $in: ["site-improvement", "feature-request", "bug-report", "tool-quality", "Suggestion"] } }),
    Tool.countDocuments({ verificationStatus: "broken" }),
    Tool.countDocuments({ verificationStatus: "review" }),
    Tool.countDocuments({ verificationStatus: "unchecked" }),
    Tool.find({ lastCheckedAt: { $ne: null } })
      .sort({ lastCheckedAt: -1 })
      .limit(8)
      .select("name slug verificationStatus lastCheckedAt lastCheckIssue lastCheckStatusCode")
      .lean(),
  ]);

  res.json({
    data: {
      overview: {
        openFeedback,
        resolvedFeedback,
        toolReports,
        toolClaims,
        siteSuggestions,
        brokenLinks,
        reviewLinks,
        uncheckedLinks,
      },
      recentlyChecked,
    },
  });
});

export const getFeedbackQueue = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filters = {};

  if (req.query.status) {
    filters.status = req.query.status;
  }

  if (req.query.type) {
    filters.type = req.query.type;
  }

  if (req.query.toolSlug) {
    filters.toolSlug = req.query.toolSlug;
  }

  const [items, total] = await Promise.all([
    Feedback.find(filters).sort({ status: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Feedback.countDocuments(filters),
  ]);

  res.json({
    data: items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const updateFeedbackStatus = asyncHandler(async (req, res) => {
  const nextStatus = req.body.status === "resolved" ? "resolved" : "open";
  const feedback = await Feedback.findByIdAndUpdate(req.params.id, { status: nextStatus }, { new: true }).lean();

  if (!feedback) {
    res.status(404);
    throw new Error("Feedback entry not found");
  }

  res.json({ data: feedback });
});

export const checkSingleToolLink = asyncHandler(async (req, res) => {
  const tool = await Tool.findById(req.params.id).select("name websiteUrl").lean();

  if (!tool) {
    res.status(404);
    throw new Error("Tool not found");
  }

  const result = await runToolHealthCheck(tool);
  const updatedTool = await applyToolHealthResult(req.params.id, result);

  res.json({
    data: updatedTool,
    message: result.verificationStatus === "verified" ? "Tool verified successfully" : "Tool check completed",
  });
});

export const runBulkToolLinkScan = asyncHandler(async (req, res) => {
  const concurrency = 8;
  const tools = await Tool.find().select("_id name websiteUrl").lean();
  let cursor = 0;
  const summary = {
    total: tools.length,
    verified: 0,
    review: 0,
    broken: 0,
  };

  const worker = async () => {
    while (cursor < tools.length) {
      const currentIndex = cursor;
      cursor += 1;
      const tool = tools[currentIndex];
      const result = await runToolHealthCheck(tool);
      await applyToolHealthResult(tool._id, result);
      summary[result.verificationStatus] += 1;
    }
  };

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  res.json({
    data: summary,
    message: `Scanned ${summary.total} tools`,
  });
});
