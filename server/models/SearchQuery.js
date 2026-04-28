import mongoose from "mongoose";

const searchQuerySchema = new mongoose.Schema(
  {
    term: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    noResultCount: {
      type: Number,
      default: 0,
    },
    lastSearchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const SearchQuery = mongoose.model("SearchQuery", searchQuerySchema);
