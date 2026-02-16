import dotenv from "dotenv";
import mongoose from "mongoose";
import { PhotoItem } from "./models/PhotoItem.js";
import { Award } from "./models/Award.js";
import { LatestVideo } from "./models/LatestVideo.js";
import { FeaturedWork } from "./models/FeaturedWork.js";
import { HomeIntro } from "./models/HomeIntro.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI in environment variables.");
}

const behindScenes = [
  {
    section: "behind-scenes",
    imageUrl:
      "https://images.unsplash.com/photo-1770297345804-e6af74ee764d?q=80&w=1170&auto=format&fit=crop",
    caption: "Behind the scenes 1",
    order: 1,
  },
  {
    section: "behind-scenes",
    imageUrl:
      "https://images.unsplash.com/photo-1770296877116-c4973c84d339?q=80&w=687&auto=format&fit=crop",
    caption: "Behind the scenes 2",
    order: 2,
  },
  {
    section: "behind-scenes",
    imageUrl:
      "https://images.unsplash.com/photo-1770754288999-c545fc028b18?q=80&w=737&auto=format&fit=crop",
    caption: "Behind the scenes 3",
    order: 3,
  },
  {
    section: "behind-scenes",
    imageUrl:
      "https://images.unsplash.com/photo-1770105328550-b0e90d770c17?q=80&w=2071&auto=format&fit=crop",
    caption: "Behind the scenes 4",
    order: 4,
  },
];

const campusEvents = [
  {
    section: "campus-events",
    imageUrl:
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop",
    caption: "Campus event 1",
    order: 1,
  },
  {
    section: "campus-events",
    imageUrl:
      "https://images.unsplash.com/photo-1519337265831-281ec6cc8514?q=80&w=1200&auto=format&fit=crop",
    caption: "Campus event 2",
    order: 2,
  },
  {
    section: "campus-events",
    imageUrl:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1200&auto=format&fit=crop",
    caption: "Campus event 3",
    order: 3,
  },
  {
    section: "campus-events",
    imageUrl:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1200&auto=format&fit=crop",
    caption: "Campus event 4",
    order: 4,
  },
];

const portraitLandscape = [
  {
    section: "portrait-landscape",
    imageUrl:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1200&auto=format&fit=crop",
    caption: "Portrait and landscape 1",
    order: 1,
  },
  {
    section: "portrait-landscape",
    imageUrl:
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop",
    caption: "Portrait and landscape 2",
    order: 2,
  },
  {
    section: "portrait-landscape",
    imageUrl:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop",
    caption: "Portrait and landscape 3",
    order: 3,
  },
  {
    section: "portrait-landscape",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
    caption: "Portrait and landscape 4",
    order: 4,
  },
];

const awards = [
  {
    title: "Best Full Length Fright",
    description:
      'Directed the short slasher film "We Love You Now" at Tulsa Underground Film Festival 48 Hour Horror Filmmaking and won Best Full Length Fright.',
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1770279777207-696c1c044e67?q=80&w=687&auto=format&fit=crop",
    articleUrl: "",
    order: 1,
  },
  {
    title: "Student Storytelling Award",
    description:
      "Recognized for outstanding narrative storytelling in student film production.",
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1770279777207-696c1c044e67?q=80&w=687&auto=format&fit=crop",
    articleUrl: "",
    order: 2,
  },
  {
    title: "Creative Media Excellence",
    description:
      "Awarded for innovative content creation and production quality in campus media projects.",
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1770279777207-696c1c044e67?q=80&w=687&auto=format&fit=crop",
    articleUrl: "",
    order: 3,
  },
];

const latestVideos = [
  {
    title: "5 Thói Quen Học Tiếng Anh 100% Hiệu Quả",
    videoId: "nZDTmX3iHI8",
    description: "English learning tips and self-development content.",
    order: 1,
  },
  {
    title: "Study With Me - Deep Focus Session",
    videoId: "nZDTmX3iHI8",
    description: "Productive study session for students and creators.",
    order: 2,
  },
];

const featuredWork = [
  {
    title: "Behind The Scene Reel",
    description: "A short-form reel capturing on-set moments and workflow.",
    imageUrl:
      "https://images.unsplash.com/photo-1770319125023-0c26b193507b?q=80&w=687&auto=format&fit=crop",
    projectUrl: "",
    order: 1,
  },
  {
    title: "Creative Production Showcase",
    description: "Highlights from social campaigns and visual storytelling projects.",
    imageUrl:
      "https://images.unsplash.com/photo-1770297346253-f1255dd167dc?q=80&w=687&auto=format&fit=crop",
    projectUrl: "",
    order: 2,
  },
];

const homeIntros = [
  {
    description:
      "My name is Van Vo from Quang Ngai, Vietnam, and I am currently a sophomore at The University of Tulsa double majoring in Media Studies and Arts, Culture & Entertainment Management.",
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);

  await Promise.all([
    PhotoItem.deleteMany({}),
    Award.deleteMany({}),
    LatestVideo.deleteMany({}),
    FeaturedWork.deleteMany({}),
    HomeIntro.deleteMany({}),
  ]);

  await Promise.all([
    PhotoItem.insertMany([...behindScenes, ...campusEvents, ...portraitLandscape]),
    Award.insertMany(awards),
    LatestVideo.insertMany(latestVideos),
    FeaturedWork.insertMany(featuredWork),
    HomeIntro.insertMany(homeIntros),
  ]);

  console.log("Seed completed.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
