import { Router, type IRouter } from "express";
import healthRouter from "./health";
import testimonialsRouter from "./testimonials";
import portfolioRouter from "./portfolio";

const router: IRouter = Router();

router.use(healthRouter);
router.use(testimonialsRouter);
router.use(portfolioRouter);

export default router;
