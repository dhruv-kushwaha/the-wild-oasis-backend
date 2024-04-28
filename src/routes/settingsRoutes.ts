import express from "express";
import {
  getAllSettings,
  updateSetting,
} from "../controllers/settingsController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = express.Router();

// Authentication Middleware
router.use(authenticateJWT);

// Routes
router.route("/").get(getAllSettings).patch(updateSetting);

export default router;
