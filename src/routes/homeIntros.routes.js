import { Router } from "express";
import { HomeIntro } from "../models/HomeIntro.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildPayload } from "../utils/payload.js";
import { ApiError } from "../utils/apiError.js";

const router = Router();

const homeIntroFields = {
  description: { type: "string", required: true, maxLength: 5000 },
};

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const latest = await HomeIntro.findOne().sort({ createdAt: -1 });
    res.json(latest ? [latest] : []);
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const existing = await HomeIntro.findOne();
    if (existing) {
      throw new ApiError(
        409,
        "Home intro already exists. Use update instead of creating a new record.",
      );
    }

    const payload = buildPayload(req.body, homeIntroFields);
    const created = await HomeIntro.create(payload);
    res.status(201).json(created);
  }),
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const payload = buildPayload(req.body, homeIntroFields, { partial: true });

    const updated = await HomeIntro.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw new ApiError(404, "Home intro not found.");
    }

    res.json(updated);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await HomeIntro.findByIdAndDelete(req.params.id);

    if (!deleted) {
      throw new ApiError(404, "Home intro not found.");
    }

    res.status(204).send();
  }),
);

export default router;
