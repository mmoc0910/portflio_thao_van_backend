import mongoose from "mongoose";
import multer from "multer";
import { ApiError } from "../utils/apiError.js";

export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: err.message });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: "Invalid id format." });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }

  if (err?.message === "Not allowed by CORS") {
    return res.status(403).json({ message: err.message });
  }

  console.error(err);
  return res.status(500).json({ message: "Internal server error." });
}
