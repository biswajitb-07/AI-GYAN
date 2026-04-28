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

export const PageView = mongoose.model("PageView", pageViewSchema);
