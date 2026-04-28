import { cloudinary } from "../config/cloudinary.js";

export const uploadToCloudinary = async (filePath, folder = "ai-gyan/tools") => {
  const response = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: "image",
  });

  return {
    url: response.secure_url,
    publicId: response.public_id,
  };
};
