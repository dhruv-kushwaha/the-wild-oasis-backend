// errorController.ts

import { NextFunction, Request, Response } from "express";
import AppError, { PrismaError } from "../utils/AppError";
import { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";

const handleJWTError = () =>
  new AppError("Invalid Token. Please Login again", 401);

const handleJWTExpiredError = () =>
  new AppError("Token Expired. Please Login Again", 401);

const handlePrismaUniqueViolation = () =>
  new AppError("Record already exists", 409);

const handlePrismaClientValidationError = () =>
  new AppError("Invalid request options", 400);

const sendErrorDev = (err: AppError | PrismaError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError | PrismaError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

export default function globalErrorHandler(
  err: AppError | PrismaError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    let error = err;
    if (err instanceof PrismaClientKnownRequestError) {
      error = new PrismaError(err);
      sendErrorDev(error, res);
    } else if (err instanceof PrismaClientValidationError) {
      error = new PrismaError(err);
      // console.log(err);
    }

    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = {} as AppError;

    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        // console.log("Entered");
        error = handlePrismaUniqueViolation();
      }
    } else if (err instanceof PrismaClientValidationError) {
      error = handlePrismaClientValidationError();
    } else {
      if (err instanceof TokenExpiredError) {
        error = handleJWTExpiredError();
      } else if (err instanceof JsonWebTokenError) {
        error = handleJWTError();
      } else {
        error = err;
      }
    }

    sendErrorProd(error, res);
  }
}
