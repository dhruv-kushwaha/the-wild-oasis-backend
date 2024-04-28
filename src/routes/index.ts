import express from "express";
import cabinRouter from "./cabinRoutes";
import userRouter from "./userRoutes";
import settingsRouter from "./settingsRoutes";
import bookingRouter from "./bookingRoutes";
import uploaderRouter from "./uploaderRoutes";

const router = express.Router();

router.use("/cabins", cabinRouter);
router.use("/settings", settingsRouter);
router.use("/users", userRouter);
router.use("/bookings", bookingRouter);
router.use("/upload", uploaderRouter);

export default router;
