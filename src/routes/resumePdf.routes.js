import { Router } from "express";
import { uploadPdf } from "../middleware/upload.js";
import { ResumePdf } from "../models/ResumePdf.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

const router = Router();

function buildAbsoluteFileUrl(req) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol =
    typeof forwardedProto === "string" && forwardedProto.length > 0
      ? forwardedProto.split(",")[0].trim()
      : req.protocol;
  const host = req.get("host");

  return `${protocol}://${host}/api/resume-pdf/file`;
}

function mapResumePdf(item, req) {
  return {
    _id: item._id,
    fileName: item.fileName,
    mimeType: item.mimeType,
    size: item.size,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    fileUrl: buildAbsoluteFileUrl(req),
  };
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const latest = await ResumePdf.findOne().sort({ createdAt: -1 }).select("-data");
    res.json(latest ? [mapResumePdf(latest, req)] : []);
  }),
);

router.get(
  "/file",
  asyncHandler(async (req, res) => {
    const latest = await ResumePdf.findOne().sort({ createdAt: -1 });
    if (!latest) {
      throw new ApiError(404, "Resume PDF not found.");
    }

    const safeFileName = latest.fileName.replaceAll('"', "");

    res.setHeader("Content-Type", latest.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${safeFileName}"`);
    res.setHeader("Cache-Control", "no-store");
    res.send(latest.data);
  }),
);

router.post(
  "/",
  uploadPdf,
  asyncHandler(async (req, res) => {
    if (!req.file?.buffer) {
      throw new ApiError(400, "PDF file is required.");
    }

    await ResumePdf.deleteMany({});

    const created = await ResumePdf.create({
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer,
    });

    res.status(201).json(mapResumePdf(created, req));
  }),
);

router.put(
  "/:id",
  uploadPdf,
  asyncHandler(async (req, res) => {
    if (!req.file?.buffer) {
      throw new ApiError(400, "PDF file is required.");
    }

    const existing = await ResumePdf.findById(req.params.id);
    if (!existing) {
      throw new ApiError(404, "Resume PDF not found.");
    }

    existing.fileName = req.file.originalname;
    existing.mimeType = req.file.mimetype;
    existing.size = req.file.size;
    existing.data = req.file.buffer;
    await existing.save();

    await ResumePdf.deleteMany({ _id: { $ne: existing._id } });

    res.json(mapResumePdf(existing, req));
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await ResumePdf.findByIdAndDelete(req.params.id);
    if (!deleted) {
      throw new ApiError(404, "Resume PDF not found.");
    }

    await ResumePdf.deleteMany({});
    res.status(204).send();
  }),
);

export default router;
