import multer from "multer";
import { ApiError } from "../utils/apiError.js";

const upload = multer({
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

export const uploadImage = upload.single("image");
