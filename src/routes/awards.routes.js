import { Router } from "express";
import { Award } from "../models/Award.js";
import { uploadImage } from "../middleware/upload.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildPayload } from "../utils/payload.js";
import { ApiError } from "../utils/apiError.js";
import { deleteCloudinaryImage, uploadImageBuffer } from "../utils/cloudinary.js";

const router = Router();

const awardFields = {
  title: { type: "string", required: true, maxLength: 160 },
  description: { type: "string", required: true, maxLength: 2000 },
  imageUrl: { type: "string", required: false, maxLength: 2000 },
  articleUrl: { type: "string", required: false, allowEmpty: true, maxLength: 2000 },
  order: { type: "number", required: false, default: 0 },
};

async function resolveImageFromRequest(req) {
  if (req.file?.buffer) {
    return uploadImageBuffer(req.file.buffer, "portfolio-thao-van/awards");
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

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await Award.find().sort({ order: 1, createdAt: -1 });
    res.json(items);
  }),
);

router.post(
  "/",
  uploadImage,
  asyncHandler(async (req, res) => {
    const payload = buildPayload(req.body, awardFields);

    const uploaded = await resolveImageFromRequest(req);
    if (!uploaded) {
      throw new ApiError(400, "Image is required. Please upload an image file.");
    }

    payload.imageUrl = uploaded.imageUrl;
    payload.imagePublicId = uploaded.imagePublicId;

    const created = await Award.create(payload);
    res.status(201).json(created);
  }),
);

router.put(
  "/:id",
  uploadImage,
  asyncHandler(async (req, res) => {
    const existing = await Award.findById(req.params.id);
    if (!existing) {
      throw new ApiError(404, "Award not found.");
    }

    const hasBodyInput = Object.keys(req.body ?? {}).length > 0;
    let payload = {};

    if (hasBodyInput) {
      payload = buildPayload(req.body, awardFields, { partial: true });
    }

    const uploaded = await resolveImageFromRequest(req);
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

    const updated = await Award.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await Award.findByIdAndDelete(req.params.id);

    if (!deleted) {
      throw new ApiError(404, "Award not found.");
    }

    await deleteCloudinaryImage(deleted.imagePublicId);
    res.status(204).send();
  }),
);

export default router;
