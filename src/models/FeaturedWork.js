import mongoose from "mongoose";

const featuredWorkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    imagePublicId: {
      type: String,
      default: "",
      trim: true,
    },
    projectUrl: {
      type: String,
      default: "",
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export const FeaturedWork = mongoose.model("FeaturedWork", featuredWorkSchema);
