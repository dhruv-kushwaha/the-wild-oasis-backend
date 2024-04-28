import express from "express";
import {
  createCabin,
  deleteCabin,
  getAllCabins,
  updateCabin,
} from "../controllers/cabinController";
import uploadPhoto from "../middlewares/imageUploadMiddleware";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = express.Router();

// Authentication Middleware
router.use(authenticateJWT);

// Routes
router.route("/").get(getAllCabins).post(uploadPhoto, createCabin);
router.route("/:id").patch(uploadPhoto, updateCabin).delete(deleteCabin);

export default router;
