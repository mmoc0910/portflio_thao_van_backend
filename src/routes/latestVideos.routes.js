import { Router } from "express";
import { LatestVideo } from "../models/LatestVideo.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildPayload } from "../utils/payload.js";
import { ApiError } from "../utils/apiError.js";

const router = Router();

const videoFields = {
  title: { type: "string", required: true, maxLength: 200 },
  videoId: { type: "string", required: true, maxLength: 100 },
  description: { type: "string", required: false, allowEmpty: true, maxLength: 1200 },
  order: { type: "number", required: false, default: 0 },
};

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await LatestVideo.find().sort({ order: 1, createdAt: -1 });
    res.json(items);
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = buildPayload(req.body, videoFields);
    const created = await LatestVideo.create(payload);
    res.status(201).json(created);
  }),
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const payload = buildPayload(req.body, videoFields, { partial: true });

    const updated = await LatestVideo.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw new ApiError(404, "Video not found.");
    }

    res.json(updated);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await LatestVideo.findByIdAndDelete(req.params.id);

    if (!deleted) {
      throw new ApiError(404, "Video not found.");
    }

    res.status(204).send();
  }),
);

export default router;
