import mongoose from "mongoose";
import { cloudinary } from "../config/cloudinary.js";

const newsArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    articleUrl: {
      type: String,
      required: true,
      trim: true,
    },
    sourceName: {
      type: String,
      required: true,
      trim: true,
    },
    sourceFeed: {
      type: String,
      default: "",
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
    publishedAt: {
      type: Date,
      required: true,
    },
    syncDateKey: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

newsArticleSchema.index({ syncDateKey: 1, publishedAt: -1 });
newsArticleSchema.index({ publishedAt: -1 });
newsArticleSchema.index({ sourceName: 1 });

const removeCloudinaryImages = async (articles = []) => {
  await Promise.all(
    articles
      .map((article) => article?.image?.publicId)
      .filter(Boolean)
      .map((publicId) =>
        cloudinary.uploader.destroy(publicId, {
          resource_type: "image",
        })
      )
  );
};

newsArticleSchema.pre("deleteMany", async function preDeleteMany() {
  const articles = await this.model.find(this.getFilter()).select("image.publicId").lean();
  await removeCloudinaryImages(articles);
});

newsArticleSchema.pre("findOneAndDelete", async function preFindOneAndDelete() {
  const article = await this.model.findOne(this.getFilter()).select("image.publicId").lean();

  if (article) {
    await removeCloudinaryImages([article]);
  }
});

export const NewsArticle = mongoose.model("NewsArticle", newsArticleSchema);
