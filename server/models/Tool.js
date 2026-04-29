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
    verificationStatus: {
      type: String,
      enum: ["unchecked", "verified", "review", "broken"],
      default: "unchecked",
    },
    lastCheckedAt: {
      type: Date,
      default: null,
    },
    lastCheckStatusCode: {
      type: Number,
      default: null,
    },
    lastCheckFinalUrl: {
      type: String,
      default: "",
      trim: true,
    },
    lastCheckIssue: {
      type: String,
      default: "",
      trim: true,
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

toolSchema.index({ category: 1, featured: -1, createdAt: -1 });
toolSchema.index({ featured: -1, viewCount: -1, createdAt: -1 });
toolSchema.index({ name: 1 });
toolSchema.index({ tags: 1 });
toolSchema.index({ verificationStatus: 1, lastCheckedAt: -1 });

export const Tool = mongoose.model("Tool", toolSchema);
