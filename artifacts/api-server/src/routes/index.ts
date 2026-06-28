import { Router, type IRouter } from "express";
import healthRouter from "./health";
import providersRouter from "./providers";
import portfolioRouter from "./portfolio";
import reviewsRouter from "./reviews";
import aiRouter from "./ai";
import statsRouter from "./stats";
import bookRouter from "./book";

const router: IRouter = Router();

router.use(healthRouter);
router.use(providersRouter);
router.use(portfolioRouter);
router.use(reviewsRouter);
router.use(aiRouter);
router.use(statsRouter);
router.use(bookRouter);

export default router;
