import { NextFunction, Request, Response } from "express";
import { User } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { asyncHandler } from "../utils/asyncHandler";
import AppError from "../utils/AppError";
import {
  ISignupType,
  IloginType,
  updateUserSchema,
  loginSchema,
  signupSchema,
} from "../schema/authSchema";
import {
  COOKIE_EXPIRY,
  DEFAULT_USER,
  StatusCode,
} from "../utils/globalConstants";
import supabase, { supabaseUrl } from "../utils/supabase";
import prisma from "../utils/client";

async function hashPassword(password: string): Promise<string> {
  const hashedPassword = await bcrypt.hash(password, 12);
  return hashedPassword;
}

const createSendJWT = function (
  user: User,
  statusCode: number,
  res: Response,
  isSignupReq: boolean = false
) {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // user.password = "";

  const resUser = { ...user, password: undefined };

  if (!isSignupReq)
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000 * COOKIE_EXPIRY),
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

  res.status(statusCode).json({
    status: "success",
    token,
    user: resUser,
  });
};

const verifyAndSendToken = async function (
  user: User,
  inputPassword: string,
  res: Response,
  next: NextFunction,
  isSignupReq: boolean = false
) {
  const passwordVerification = await bcrypt.compare(
    inputPassword,
    user.password
  );

  if (!passwordVerification) {
    return next(
      new AppError("Invalid email or password", StatusCode.BAD_REQUEST)
    );
  }

  createSendJWT(user, StatusCode.OK, res, isSignupReq);
};

export interface UserTypes extends User {
  confirmPassword?: string;
}

export const signup = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email, password, name, confirmPassword }: ISignupType = req.body;

  if (!email || !password) {
    return next(
      new AppError("Email or Password not Specified", StatusCode.BAD_REQUEST)
    );
  }

  // validate kar le bhai
  // zod
  const validationResult = signupSchema.safeParse({
    email,
    password,
    name,
    confirmPassword,
  });

  if (!validationResult.success) {
    return next(
      new AppError("Input validation failed", StatusCode.BAD_REQUEST)
    );
  }

  const {
    name: parsedName,
    email: parsedEmail,
    password: parsedPassword,
  } = validationResult.data;

  // Password hash kar le

  const hashedPassword = await hashPassword(parsedPassword);

  // create new user
  const newUser = await prisma.user.create({
    data: {
      email: parsedEmail,
      name: parsedName,
      password: hashedPassword,
      avatar: DEFAULT_USER,
    },
  });

  // createSendJWT

  createSendJWT(newUser, StatusCode.CREATED, res, true);
});

export const login = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email, password }: IloginType = req.body;

  // validate
  const validationResult = loginSchema.safeParse({
    email,
    password,
  });

  if (!validationResult.success) {
    return next(new AppError("Login Input Validation Failed", 400));
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return next(new AppError("No user exist with this email", 403));
  }

  verifyAndSendToken(user, password, res, next);
});

export const getCurrentUser = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId: number = Number(req.headers["userId"]);

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      avatar: true,
    },
  });

  res.status(StatusCode.OK).json({
    status: "success",
    user,
  });
});

export const logout = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(204).clearCookie("jwt").send({
    message: "success",
  });
});

export const updateUser = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const file = req.file;
  const userId: number = Number(req.headers["userId"]);
  const body = req.body;
  console.log("Entered");

  let imageUrl: string | undefined = undefined;
  if (file) {
    const imageName = `${Math.ceil(
      Math.random() * 10000000000
    )}-${Date.now()}-${file.originalname}`
      .replace(/\//g, "")
      .replace(" ", "");

    const { error: storageError } = await supabase.storage
      .from("avatars")
      .upload(imageName, file.buffer, {
        contentType: file.mimetype,
      });

    req.file = undefined;

    if (storageError) {
      console.log(storageError);
      return next(
        new AppError(
          "Avatar image could not be uploaded and the cabin was not created",
          StatusCode.INTERNAL_SERVER_ERROR
        )
      );
    }

    imageUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${imageName}`;
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      ...body,
      ...(imageUrl && { avatar: imageUrl }),
    },
  });

  res.status(StatusCode.CREATED).send({
    status: "success",
    user: { ...updatedUser, password: undefined },
  });
});

export const updatePassword = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = Number(req.headers["userId"]);

  const newHashedPassword = await hashPassword(req.body.password);

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: newHashedPassword,
    },
  });

  createSendJWT(updatedUser, 200, res);
});
