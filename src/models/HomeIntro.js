import mongoose from "mongoose";

const homeIntroSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

export const HomeIntro = mongoose.model("HomeIntro", homeIntroSchema);
