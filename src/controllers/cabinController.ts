import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import AppError from "../utils/AppError";
import { ICabinType, createCabinSchema } from "../schema/cabinSchema";
import { UpdateCabinType } from "../schema/cabinTypes";
import { StatusCode } from "../utils/globalConstants";
import supabase, { supabaseUrl } from "../utils/supabase";
import prisma from "../utils/client";

export const getAllCabins = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const cabins = await prisma.cabin.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });

  res.status(StatusCode.OK).json({
    status: "success",
    cabins,
  });
});

export const createCabin = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const body: ICabinType = req.body;
  const file = req.file;

  console.log(body);
  console.log(file);

  const validationResult = createCabinSchema.safeParse(body);

  if (validationResult.success === false) {
    return next(new AppError("Invalid Payload", StatusCode.BAD_REQUEST));
  }

  // TODO: File upload

  if (!file && validationResult.data.image === undefined) {
    return next(new AppError("No Image Found!", StatusCode.BAD_REQUEST));
  }

  let imageUrl;
  if (file) {
    const imageName = `${Math.ceil(
      Math.random() * 10000000000
    )}-${Date.now()}-${file.originalname}`
      .replace(/\//g, "")
      .replace(" ", "");

    const { error: storageError } = await supabase.storage
      .from("cabin-images")
      .upload(imageName, file.buffer, {
        contentType: file.mimetype,
      });

    req.file = undefined;

    if (storageError) {
      console.log(storageError);
      return next(
        new AppError(
          "Cabin image could not be uploaded and the cabin was not created",
          StatusCode.INTERNAL_SERVER_ERROR
        )
      );
    }

    imageUrl = `${supabaseUrl}/storage/v1/object/public/cabin-images/${imageName}`;
  }
  const newCabin = await prisma.cabin.create({
    data: {
      ...validationResult.data,
      image: imageUrl || validationResult.data.image,
    },
  });

  res.status(StatusCode.CREATED).json({
    status: "success",
    cabin: newCabin,
  });
});

export const updateCabin = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id: number = Number(req.params?.id);

  if (!id || Number.isNaN(id)) {
    return next(new AppError("Invalid id", 404));
  }

  const cabin = await prisma.cabin.findUnique({
    where: {
      id,
    },
  });

  if (!cabin) {
    return next(
      new AppError("No document found with that Id", StatusCode.NOT_FOUND)
    );
  }

  const body: UpdateCabinType = req.body;
  const file = req.file;

  const updateCabinSchema = createCabinSchema.partial();
  const validationResult = updateCabinSchema.safeParse(body);

  if (validationResult.success === false) {
    return next(new AppError("Invalid Payload", StatusCode.BAD_REQUEST));
  }
  const parsedBody = validationResult.data;
  let imageUrl: string = "";

  if (file) {
    const imageName = `${Math.ceil(
      Math.random() * 10000000000
    )}-${Date.now()}-${file.originalname}`
      .replace(/\//g, "")
      .replace(" ", "");

    const { error: storageError } = await supabase.storage
      .from("cabin-images")
      .upload(imageName, file.buffer, {
        contentType: file.mimetype,
      });

    req.file = undefined;

    if (storageError) {
      console.log(storageError);
      return next(
        new AppError(
          "Cabin image could not be uploaded and the cabin was not updated",
          StatusCode.INTERNAL_SERVER_ERROR
        )
      );
    }

    imageUrl = `${supabaseUrl}/storage/v1/object/public/cabin-images/${imageName}`;
  }
  const updatedCabin = await prisma.cabin.update({
    where: {
      id,
    },
    data: {
      ...parsedBody,
      image: imageUrl.length > 1 ? imageUrl : cabin.image,
    },
  });

  res.status(StatusCode.OK).json({
    status: "success",
    cabin: updatedCabin,
  });
});

export const deleteCabin = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id: number = Number(req.params?.id);

  if (!id || Number.isNaN(id)) {
    return next(new AppError("Invalid id", 404));
  }

  const cabin = await prisma.cabin.findUnique({
    where: {
      id,
    },
  });

  if (!cabin) {
    return next(
      new AppError("No cabin found with that Id", StatusCode.NOT_FOUND)
    );
  }

  const deleteCabin = await prisma.cabin.delete({
    where: {
      id,
    },
  });

  res.status(StatusCode.NO_CONTENT).json({
    status: "success",
  });
});
