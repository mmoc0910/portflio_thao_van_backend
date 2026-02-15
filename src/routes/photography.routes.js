import { Router } from "express";
import { PhotoItem } from "../models/PhotoItem.js";
import { uploadImage } from "../middleware/upload.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildPayload } from "../utils/payload.js";
import { ApiError } from "../utils/apiError.js";
import { deleteCloudinaryImage, uploadImageBuffer } from "../utils/cloudinary.js";

const router = Router();

const photoFields = {
  imageUrl: { type: "string", required: false, maxLength: 2000 },
  caption: { type: "string", required: false, allowEmpty: true, maxLength: 300 },
  order: { type: "number", required: false, default: 0 },
};

async function resolveImageFromRequest(req, folder) {
  if (req.file?.buffer) {
    return uploadImageBuffer(req.file.buffer, folder);
  }

  const imageUrl = typeof req.body?.imageUrl === "string" ? req.body.imageUrl.trim() : "";
  if (imageUrl) {
    return {
      imageUrl,
      imagePublicId: "",
    };
  }

  return null;
}

function mountSection(section) {
  const cloudinaryFolder = `portfolio-thao-van/${section}`;

  router.get(
    `/${section}`,
    asyncHandler(async (req, res) => {
      const items = await PhotoItem.find({ section }).sort({ order: 1, createdAt: -1 });
      res.json(items);
    }),
  );

  router.post(
    `/${section}`,
    uploadImage,
    asyncHandler(async (req, res) => {
      const payload = buildPayload(req.body, photoFields);
      payload.section = section;

      const uploaded = await resolveImageFromRequest(req, cloudinaryFolder);
      if (!uploaded) {
        throw new ApiError(400, "Image is required. Please upload an image file.");
      }

      payload.imageUrl = uploaded.imageUrl;
      payload.imagePublicId = uploaded.imagePublicId;

      const created = await PhotoItem.create(payload);
      res.status(201).json(created);
    }),
  );

  router.put(
    `/${section}/:id`,
    uploadImage,
    asyncHandler(async (req, res) => {
      const existing = await PhotoItem.findOne({ _id: req.params.id, section });
      if (!existing) {
        throw new ApiError(404, "Photo item not found.");
      }

      const hasBodyInput = Object.keys(req.body ?? {}).length > 0;
      let payload = {};

      if (hasBodyInput) {
        payload = buildPayload(req.body, photoFields, { partial: true });
      }

      const uploaded = await resolveImageFromRequest(req, cloudinaryFolder);
      if (uploaded) {
        payload.imageUrl = uploaded.imageUrl;
        payload.imagePublicId = uploaded.imagePublicId;

        if (existing.imagePublicId && existing.imagePublicId !== uploaded.imagePublicId) {
          await deleteCloudinaryImage(existing.imagePublicId);
        }
      }

      if (Object.keys(payload).length === 0) {
        throw new ApiError(400, "No valid fields provided for update.");
      }

      const updated = await PhotoItem.findOneAndUpdate(
        { _id: req.params.id, section },
        payload,
        { new: true, runValidators: true },
      );

      res.json(updated);
    }),
  );

  router.delete(
    `/${section}/:id`,
    asyncHandler(async (req, res) => {
      const deleted = await PhotoItem.findOneAndDelete({ _id: req.params.id, section });

      if (!deleted) {
        throw new ApiError(404, "Photo item not found.");
      }

      await deleteCloudinaryImage(deleted.imagePublicId);
      res.status(204).send();
    }),
  );
}

mountSection("behind-scenes");
mountSection("campus-events");
mountSection("portrait-landscape");

export default router;
