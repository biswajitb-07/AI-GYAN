import mongoose from "mongoose";

const pageViewSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
      trim: true,
    },
    toolSlug: {
      type: String,
      default: "",
      trim: true,
    },
    sessionId: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

pageViewSchema.index({ path: 1, sessionId: 1 });
pageViewSchema.index({ toolSlug: 1, createdAt: -1 });

export const PageView = mongoose.model("PageView", pageViewSchema);
