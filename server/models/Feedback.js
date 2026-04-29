import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open",
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    pageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      trim: true,
      default: "Suggestion",
    },
    toolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tool",
      default: null,
    },
    toolName: {
      type: String,
      trim: true,
      default: "",
    },
    toolSlug: {
      type: String,
      trim: true,
      default: "",
    },
    source: {
      type: String,
      trim: true,
      default: "public-site",
    },
  },
  { timestamps: true }
);

feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ type: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ toolSlug: 1, createdAt: -1 });

export const Feedback = mongoose.model("Feedback", feedbackSchema);
