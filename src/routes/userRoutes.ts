import express from "express";
import {
  getCurrentUser,
  login,
  logout,
  signup,
  updatePassword,
  updateUser,
} from "../controllers/authController";
import { authenticateJWT } from "../middlewares/authMiddleware";
import uploadPhoto, {
  uploadAvatar,
} from "../middlewares/imageUploadMiddleware";
import { parseBody } from "../middlewares/zodSchemaMiddleware";
import { updatePasswordSchema, updateUserSchema } from "../schema/authSchema";

const router = express.Router();

router.post("/login", login);

router.use(authenticateJWT);
router.post("/signup", signup);
router.get("/logout", logout);
router.get("/me", getCurrentUser);
router.patch("/me", parseBody(updateUserSchema), uploadAvatar, updateUser);

router.patch(
  "/updatePassword",
  parseBody(updatePasswordSchema),
  updatePassword
);

export default router;
