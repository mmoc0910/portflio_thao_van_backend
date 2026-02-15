import mongoose from "mongoose";

const photoItemSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      enum: ["behind-scenes", "campus-events", "portrait-landscape"],
      required: true,
      index: true,
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
    caption: {
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

export const PhotoItem = mongoose.model("PhotoItem", photoItemSchema);
