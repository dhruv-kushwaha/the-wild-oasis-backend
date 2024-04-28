import express from "express";
import {
  deleteBooking,
  getAllBookings,
  getBooking,
  getBookingsAfterDate,
  getStaysAfterDate,
  getStaysTodayActivity,
  updateBooking,
} from "../controllers/bookingController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = express.Router();

// Authentication Middleware
router.use(authenticateJWT);

// Routes
router.route("/").get(getAllBookings);
router.route("/bookingsAfterDate").get(getBookingsAfterDate);
router.route("/staysAfterDate").get(getStaysAfterDate);
router.route("/staysToday").get(getStaysTodayActivity);
router
  .route("/:bookingId")
  .get(getBooking)
  .patch(updateBooking)
  .delete(deleteBooking);

export default router;
