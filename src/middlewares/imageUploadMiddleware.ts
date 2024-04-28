import { Request } from "express";
import multer from "multer";
import AppError from "../utils/AppError";
import { StatusCode } from "../utils/globalConstants";

const multerStorage = multer.memoryStorage();
const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: Function
) => {
  if (file?.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Not an image! Please upload only image",
        StatusCode.BAD_REQUEST
      )
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadPhoto = upload.single("image");
const uploadAvatar = upload.single("avatar");

export { uploadAvatar };
export default uploadPhoto;
