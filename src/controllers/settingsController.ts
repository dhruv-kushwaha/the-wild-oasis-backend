import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { StatusCode } from "../utils/globalConstants";
import AppError from "../utils/AppError";
import { USettingType, settingSchema } from "../schema/settingSchema";
import prisma from "../utils/client";

export const getAllSettings = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const settings = await prisma.setting.findUnique({
    where: {
      id: 1,
    },
  });

  res.status(StatusCode.OK).json({
    status: "success",
    settings,
  });
});

export const updateSetting = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const rawBody: USettingType = req.body;
  console.log(rawBody);
  const partialSchema = settingSchema.partial();
  const parseResult = partialSchema.safeParse(rawBody);

  if (!parseResult.success) {
    return next(new AppError("Invalid input", StatusCode.BAD_REQUEST));
  }

  const body = parseResult.data;

  const updatedSetting = await prisma.setting.update({
    where: {
      id: 1,
    },
    data: {
      ...body,
    },
  });

  res.status(StatusCode.OK).json({
    status: "success",
    settings: updatedSetting,
  });
});
