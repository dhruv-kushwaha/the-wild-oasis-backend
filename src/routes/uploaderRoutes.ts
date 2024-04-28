import express from "express";
import {
  createBookings,
  createCabins,
  createGuests,
  deleteBookings,
  deleteCabins,
  deleteGuests,
} from "../data/uploader";

const router = express.Router();

router.route("/guests").post(createGuests).delete(deleteGuests);
router.route("/cabins").post(createCabins).delete(deleteCabins);
router.route("/bookings").post(createBookings).delete(deleteBookings);

export default router;
