import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { BookingStatus } from "@prisma/client";
import prisma from "../utils/client";
import { StatusCode } from "../utils/globalConstants";
import AppError from "../utils/AppError";
import { ParsedQs } from "qs";
import { UpdateBookingSchema } from "../schema/bookingSchema";
import { filterQuery } from "../utils/AppFeatures";

export const getAllBookings = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  // console.log(req.query);
  const filter: Record<
    string,
    string | number | ParsedQs | string[] | ParsedQs[] | undefined
  > = { ...req.query };

  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete filter[el]);

  const fields = ["id", "numNights", "numGuests", "totalPrice"];

  Object.entries(filter).forEach(([key, value]) => {
    if (fields.includes(key))
      if (typeof value === "object") {
        const operatorObject = value as unknown as Record<
          string,
          string | number
        >;
        for (const operator in operatorObject) {
          if (["gte", "gt", "lte", "lt", "equals"].includes(operator)) {
            operatorObject[operator] = parseFloat(
              operatorObject[operator] as string
            );
          }
        }
      } else {
        const operatorValue = value as unknown as string | number | undefined;
        if (typeof operatorValue === "string") {
          filter[key] = parseFloat(operatorValue as string);
        }
      }
  });

  if (filter.status !== undefined) {
    // Attempt to parse the status as a BookingStatus enum value
    const parsedStatus = filter.status as BookingStatus | undefined;

    // Check if the parsed status is a valid enum value
    const isValidStatus = ["checkedIn", "checkedOut", "unconfirmed"].includes(
      parsedStatus ?? ""
    );

    if (!isValidStatus) {
      return next(
        new AppError(
          "Invalid status value in query string",
          StatusCode.BAD_REQUEST
        )
      );
    }

    filter.status = parsedStatus;
  }

  // 2) SORTING
  // console.log(req.query.sort);
  const sortBy = {} as Record<string, "asc" | "desc">;
  // const sortBy = [] as Record<string, "asc" | "desc">[];
  if (req.query.sort !== undefined && typeof req.query.sort === "object") {
    //
    // console.log(req.query);
    Object.entries(req.query.sort).forEach(([key, value]) => {
      if (value !== "asc" && value !== "desc") {
        return next(
          new AppError(`Invalid Sort Option for ${key}`, StatusCode.BAD_REQUEST)
        );
      }
      // const sortOption = {
      //   [key]: value as "asc" | "desc",
      // };
      // sortBy.push(sortOption);
      sortBy[key] = value as "asc" | "desc";
    });
    // console.log("sortBy : ", sortBy);
  }
  // console.log(sortBy);

  // 3) PAGINATION
  const rawPage = req.query.page;
  const rawLimit = req.query.limit;
  let page: number;
  let limit: number | undefined = undefined;
  let skip: number = 0;

  if (rawPage !== undefined && rawLimit !== undefined) {
    page = Number(rawPage);
    limit = Number(rawLimit);
    if (
      Number.isNaN(page) ||
      Number.isNaN(limit) ||
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page <= 0
    ) {
      return next(
        new AppError("Invalid Pagination options", StatusCode.BAD_REQUEST)
      );
    }
    // Page indexing starts from 0
    page = page - 1;
    skip = page * limit;
  }

  // const limitFields = filterQuery(req);
  // console.log(limitFields);

  const data = await prisma.booking.findMany({
    select: {
      id: true,
      createdAt: true,
      startDate: true,
      endDate: true,
      numNights: true,
      numGuests: true,
      status: true,
      totalPrice: true,
      cabin: {
        select: {
          name: true,
        },
      },
      guest: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
    // select: limitFields,
    where: filter,
    // orderBy: sortBy,
    // orderBy: {
    //   id: "asc",
    //   guest: {
    //     fullName: "asc",
    //   },
    // },
    // orderBy: [{ id: "asc", cabinPrice: "asc" }, { cabinPrice: "desc" }],
    orderBy: sortBy,
    skip: skip,
    take: limit,
  });

  const totalBookings = await prisma.booking.count({
    where: filter,
  });

  // const totalCount = await prdisma.booking.count();
  // console.log(data);
  res.status(StatusCode.OK).json({
    status: "success",
    length: data.length,
    totalBookings,
    bookings: data,
  });
});

export const getBooking = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const bookingId: number = Number(req.params.bookingId);
  if (Number.isNaN(bookingId) || !Number.isInteger(bookingId)) {
    next(new AppError("Invalid bookingId", StatusCode.BAD_REQUEST));
  }

  const data = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      cabin: true,
      guest: true,
    },
  });

  if (!data) {
    return next(new AppError("Booking not found", StatusCode.NOT_FOUND));
  }

  res.status(StatusCode.OK).send({
    status: "success",
    booking: data,
  });
});

export const updateBooking = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const bookingId: number = Number(req.params.bookingId);
  if (Number.isNaN(bookingId) || !Number.isInteger(bookingId)) {
    next(new AppError("Invalid bookingId", StatusCode.BAD_REQUEST));
  }

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      cabin: true,
      guest: true,
    },
  });

  if (!booking) {
    return next(new AppError("Booking not found", StatusCode.NOT_FOUND));
  }

  const rawBody = req.body;
  let Schema;

  if (req.body.hasBreakfast) {
    Schema = UpdateBookingSchema;
  } else {
    Schema = UpdateBookingSchema.pick({ status: true, isPaid: true });
  }

  const validationResult = Schema.safeParse(rawBody);

  if (validationResult.success === false) {
    return next(
      new AppError("Invalid booking data passed", StatusCode.BAD_REQUEST)
    );
  }
  const body = validationResult.data;

  if (body?.status !== undefined) {
    if (booking?.isPaid === true && req.body?.hasBreakfast === false)
      return next(
        new AppError("Booking is already paid for", StatusCode.BAD_REQUEST)
      );
    else if (body?.status === "unconfirmed") {
      return next(
        new AppError("Invalid booking status", StatusCode.BAD_REQUEST)
      );
    }

    if (body.status === "checkedOut" && req.body.hasBreakfast === true) {
      return next(new AppError("Invalid Data passed", StatusCode.BAD_REQUEST));
    }
  }

  const data = await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      ...body,
    },
  });

  res.status(StatusCode.OK).send({
    status: "success",
    booking: data,
  });
});

export const deleteBooking = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id: number = Number(req.params?.bookingId);

  if (!id || Number.isNaN(id)) {
    return next(new AppError("Invalid id", 404));
  }

  const booking = await prisma.booking.findUnique({
    where: {
      id,
    },
  });

  if (!booking) {
    return next(
      new AppError("No booking found with that Id", StatusCode.NOT_FOUND)
    );
  }

  await prisma.booking.delete({
    where: {
      id,
    },
  });

  res.status(StatusCode.NO_CONTENT).json({
    status: "success",
  });
});

export const getBookingsAfterDate = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const days = Number(req.query.days);
  console.log(req.query);

  if (Number.isNaN(days)) {
    return next(
      new AppError("No. of days is not provided", StatusCode.BAD_REQUEST)
    );
  }

  const roundedDate = new Date().setUTCHours(23, 59, 59, 999);
  const today = new Date(roundedDate);

  const initialDate = new Date(new Date().setDate(today.getDate() - days));

  const bookings = await prisma.booking.findMany({
    select: {
      createdAt: true,
      totalPrice: true,
      extrasPrice: true,
    },

    where: {
      createdAt: {
        gte: initialDate,
        lte: today,
      },
    },
  });
  // console.log(bookings);

  res.status(200).json({
    status: "success",
    bookings,
  });
});

export const getStaysAfterDate = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const days = Number(req.query.days);

  if (Number.isNaN(days) || days < 0) {
    return next(
      new AppError(`Invalid "days" parameter`, StatusCode.BAD_REQUEST)
    );
  }

  // end date
  const today = new Date(new Date().setUTCHours(0, 0, 0, 0));

  // start date
  const startDate = new Date(new Date().setDate(today.getDate() - days));

  const stays = await prisma.booking.findMany({
    include: {
      guest: {
        select: {
          fullName: true,
        },
      },
    },

    where: {
      startDate: {
        lte: today,
        gte: startDate,
      },
    },
  });

  res.status(200).json({
    status: "success",
    stays,
  });
});

export const getToday = function (options: { end?: boolean } = {}) {
  const today = new Date();

  // This is necessary to compare with created_at from Supabase, because it it not at 0.0.0.0, so we need to set the date to be END of the day when we compare it with earlier dates
  if (options?.end)
    // Set to the last second of the day
    today.setUTCHours(23, 59, 59, 999);
  else today.setUTCHours(0, 0, 0, 0);
  return today.toISOString();
};

export const getStaysTodayActivity = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const stays = await prisma.booking.findMany({
    include: {
      guest: {
        select: {
          fullName: true,
          nationality: true,
          countryFlag: true,
        },
      },
    },

    where: {
      OR: [
        {
          status: "unconfirmed",
          startDate: {
            gte: getToday(),
            lte: getToday({ end: true }),
          },
        },
        {
          status: "checkedIn",
          endDate: {
            gte: getToday(),
            lte: getToday({ end: true }),
          },
        },
      ],
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  res.status(200).send({
    status: "success",
    stays: stays,
  });
});
