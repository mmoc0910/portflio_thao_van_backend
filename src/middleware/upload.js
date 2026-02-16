import multer from "multer";
import { ApiError } from "../utils/apiError.js";

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  fileFilter(req, file, callback) {
    if (!file.mimetype.startsWith("image/")) {
      callback(new ApiError(400, "Only image files are allowed."));
      return;
    }

    callback(null, true);
  },
});

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 12 * 1024 * 1024,
  },
  fileFilter(req, file, callback) {
    const normalizedName = file.originalname.toLowerCase();
    const isPdfMime = file.mimetype === "application/pdf";
    const isPdfExtension = normalizedName.endsWith(".pdf");

    if (!isPdfMime || !isPdfExtension) {
      callback(new ApiError(400, "Only PDF files are allowed."));
      return;
    }

    callback(null, true);
  },
});

export const uploadImage = imageUpload.single("image");
export const uploadPdf = pdfUpload.single("file");
