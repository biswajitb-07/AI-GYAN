import mongoose from "mongoose";

const toolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
    longDescription: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    pricing: {
      type: String,
      enum: ["Free", "Free Trial", "Paid"],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    websiteUrl: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        default: "",
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 4.7,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    monthlyVisits: {
      type: String,
      default: "10K+",
    },
    reviews: {
      type: [
        {
          name: {
            type: String,
            trim: true,
            default: "Anonymous",
          },
          rating: {
            type: Number,
            min: 1,
            max: 5,
            default: 5,
          },
          comment: {
            type: String,
            trim: true,
            required: true,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const Tool = mongoose.model("Tool", toolSchema);
