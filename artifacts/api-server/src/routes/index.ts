import { Router, type IRouter } from "express";
import healthRouter from "./health";
import testimonialsRouter from "./testimonials";
import portfolioRouter from "./portfolio";
import settingsRouter from "./settings";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(testimonialsRouter);
router.use(portfolioRouter);
router.use(settingsRouter);
router.use("/storage", storageRouter);

export default router;
