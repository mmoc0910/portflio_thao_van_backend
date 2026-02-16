import { Router } from "express";
import photographyRoutes from "./photography.routes.js";
import awardsRoutes from "./awards.routes.js";
import latestVideosRoutes from "./latestVideos.routes.js";
import featuredWorkRoutes from "./featuredWork.routes.js";
import homeIntrosRoutes from "./homeIntros.routes.js";
import resumePdfRoutes from "./resumePdf.routes.js";

const router = Router();

router.use("/photography", photographyRoutes);
router.use("/awards", awardsRoutes);
router.use("/latest-videos", latestVideosRoutes);
router.use("/featured-work", featuredWorkRoutes);
router.use("/home-intros", homeIntrosRoutes);
router.use("/resume-pdf", resumePdfRoutes);

export default router;
