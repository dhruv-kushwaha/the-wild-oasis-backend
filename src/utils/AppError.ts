import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";

class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    // Used to distinguish operational errors from programming errors
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class PrismaError extends AppError {
  prismaError: PrismaClientKnownRequestError | PrismaClientValidationError;

  constructor(
    prismaError: PrismaClientKnownRequestError | PrismaClientValidationError
  ) {
    super(prismaError.message, 500);

    this.prismaError = prismaError;
    // this.statusCode = parseInt(prismaError?.code) ?? 500;
    this.statusCode = 500;
    this.status = `${this.statusCode}`.startsWith("4") ? "fail" : "error";

    Error.captureStackTrace(this, this.constructor);
  }
}

export { AppError, PrismaError };
export default AppError;
