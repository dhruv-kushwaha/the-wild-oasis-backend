import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import AppError from "../utils/AppError";
import { StatusCode } from "../utils/globalConstants";

async function verifyToken(token: string, secret: string): Promise<any> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decodedToken) => {
      if (err) {
        reject(err);
      } else {
        resolve(decodedToken);
      }
    });
  });
}

const authenticateJWT = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  // const token = req.cookies("jwt");
  // if (!token) {
  //   return next(new AppError("No token found", StatusCode.UNAUTHENTICATED));
  // }
  let token: string;
  // console.log("cookie", req.cookies.jwt);

  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        new AppError(
          "Invalid or missing authorization header",
          StatusCode.UNAUTHENTICATED
        )
      );
    }

    token = authHeader?.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("No Token Found", StatusCode.UNAUTHENTICATED));
  }
  // You do not have permission to perform this action

  // const payload = jwt.verify(token,
  //   process.env.JWT_SECRET as string

  // ) as JwtPayload;
  let payload = {} as JwtPayload;
  try {
    payload = await verifyToken(token, process.env.JWT_SECRET as string);
    // console.log(payload);
  } catch (error) {
    return next(
      new AppError(
        "Invalid Token. Please login again",
        StatusCode.UNAUTHENTICATED
      )
    );
  }

  // console.log("Decoded JWT payload : ", payload);
  req.headers["userId"] = payload.id;
  next();
});

export { authenticateJWT };
