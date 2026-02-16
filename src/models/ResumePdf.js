import mongoose from "mongoose";

const resumePdfSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
      default: "application/pdf",
    },
    size: {
      type: Number,
      required: true,
      min: 1,
    },
    data: {
      type: Buffer,
      required: true,
    },
  },
  { timestamps: true },
);

export const ResumePdf = mongoose.model("ResumePdf", resumePdfSchema);
