import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "./apiError.js";

let cloudinaryConfigured = false;

function getCloudinaryConfig() {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  };
}

function ensureConfigured() {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new ApiError(
      500,
      "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.",
    );
  }

  if (!cloudinaryConfigured) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    cloudinaryConfigured = true;
  }
}

export function uploadImageBuffer(buffer, folder) {
  ensureConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary upload returned empty result."));
          return;
        }

        resolve({
          imageUrl: result.secure_url,
          imagePublicId: result.public_id,
        });
      },
    );

    stream.end(buffer);
  });
}

export async function deleteCloudinaryImage(publicId) {
  if (!publicId) {
    return;
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  if (!cloudName || !apiKey || !apiSecret) {
    return;
  }

  ensureConfigured();

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
  } catch (error) {
    console.error("Failed to delete image from Cloudinary:", error);
  }
}
