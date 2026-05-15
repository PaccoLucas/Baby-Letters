import { Router, type IRouter } from "express";
import healthRouter from "./health";
import testimonialsRouter from "./testimonials";

const router: IRouter = Router();

router.use(healthRouter);
router.use(testimonialsRouter);

export default router;
