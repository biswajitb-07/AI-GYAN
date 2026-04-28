import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: "Sparkles",
    },
    color: {
      type: String,
      default: "from-sky-500 to-cyan-400",
    },
    toolCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

categorySchema.index({ toolCount: -1, name: 1 });

export const Category = mongoose.model("Category", categorySchema);
