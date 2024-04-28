import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { StatusCode } from "../utils/globalConstants";

import { guests } from "./data-guests";
import { cabins } from "./data-cabins";
import { bookings } from "./data-bookings";
import {
  differenceInDays,
  isFuture,
  isPast,
  isToday,
  parseISO,
} from "date-fns";
import prisma from "../utils/client";

export const deleteBookings = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  await prisma.booking.deleteMany({
    where: {
      id: {
        gt: 0,
      },
    },
  });

  res.status(StatusCode.NO_CONTENT).send({
    status: "success",
  });
});

export const deleteCabins = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  await prisma.cabin.deleteMany({
    where: {
      id: {
        gt: 0,
      },
    },
  });

  res.status(StatusCode.NO_CONTENT).send({
    status: "success",
  });
});

export const deleteGuests = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  await prisma.guest.deleteMany({
    where: {
      id: {
        gt: 0,
      },
    },
  });

  res.status(StatusCode.NO_CONTENT).send({
    status: "success",
  });
});

export const createGuests = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const createdGuests = await prisma.guest.createMany({
    data: guests,
    skipDuplicates: true,
  });

  res.status(StatusCode.CREATED).send({
    status: "success",
    guests: createdGuests,
  });
});

export const createCabins = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const createdCabins = await prisma.cabin.createMany({
    data: cabins,
    skipDuplicates: true,
  });

  res.status(StatusCode.CREATED).send({
    status: "success",
    cabins: createdCabins,
  });
});

export const subtractDates = (dateStr1: string, dateStr2: string) =>
  differenceInDays(parseISO(String(dateStr1)), parseISO(String(dateStr2)));

type BookingStatus = "unconfirmed" | "checkedIn" | "checkedOut";

interface BookingType {
  createdAt: string;
  startDate: string;
  endDate: string;
  cabinId: number;
  guestId: number;
  hasBreakfast: boolean;
  observations: string;
  isPaid: boolean;
  numGuests: number;
}

export const createBookings = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Bookings need a guestId and a cabinId. We can't tell Supabase IDs for each object, it will calculate them on its own. So it might be different for different people, especially after multiple uploads. Therefore, we need to first get all guestIds and cabinIds, and then replace the original IDs in the booking data with the actual ones from the DB

  const guestsIds = await prisma.guest.findMany({
    select: {
      id: true,
    },
    orderBy: {
      id: "asc",
    },
  });
  const allGuestIds = guestsIds.map((cabin) => cabin.id);
  const cabinsIds = await prisma.cabin.findMany({
    select: {
      id: true,
    },
    orderBy: {
      id: "asc",
    },
  });
  const allCabinIds = cabinsIds.map((cabin) => cabin.id);

  const finalBookings = bookings.map((booking) => {
    const cabin = cabins.at((booking.cabinId as number) - 1);
    const numNights = subtractDates(
      booking.endDate as string,
      booking.startDate as string
    );
    const cabinPrice =
      numNights * ((cabin?.regularPrice ?? 1) - (cabin?.discount ?? 0));
    const extrasPrice = booking.hasBreakfast
      ? numNights * 15 * booking.numGuests
      : 0; // hardcoded breakfast price
    const totalPrice = cabinPrice + extrasPrice;

    let status: BookingStatus | undefined;
    if (
      isPast(new Date(booking.endDate as string)) &&
      !isToday(new Date(booking.endDate as string))
    )
      status = "checkedOut";
    if (
      isFuture(new Date(booking.startDate as string)) ||
      isToday(new Date(booking.startDate as string))
    )
      status = "unconfirmed";
    if (
      (isFuture(new Date(booking.endDate as string)) ||
        isToday(new Date(booking.endDate as string))) &&
      isPast(new Date(booking.startDate as string)) &&
      !isToday(new Date(booking.startDate as string))
    )
      status = "checkedIn";

    if (status === undefined) {
      status = "unconfirmed";
    }
    return {
      ...booking,
      numNights,
      createdAt: parseISO(booking.createdAt),
      startDate: parseISO(booking.startDate),
      endDate: parseISO(booking.endDate),
      cabinPrice,
      extrasPrice,
      totalPrice,
      guestId: allGuestIds.at(booking.guestId - 1) ?? 1,
      cabinId: allCabinIds.at(booking.cabinId - 1) ?? 1,
      status,
    };
  });

  // console.log(finalBookings);

  const uploadedBookings = await prisma.booking.createMany({
    data: finalBookings,
    skipDuplicates: true,
  });

  res.status(StatusCode.CREATED).send({
    status: "success",
    bookings: uploadedBookings,
  });
});
// const finalBookings = bookings.map((booking) => {
//   // Here relying on the order of cabins, as they don't have and ID yet
//   const cabin = cabins.at(booking.cabinId - 1);
//   const numNights = subtractDates(booking.endDate, booking.startDate);
//   const cabinPrice = numNights * (cabin.regularPrice - cabin.discount);
//   const extrasPrice = booking.hasBreakfast
//     ? numNights * 15 * booking.numGuests
//     : 0; // hardcoded breakfast price
//   const totalPrice = cabinPrice + extrasPrice;

//   let status;
//   if (
//     isPast(new Date(booking.endDate)) &&
//     !isToday(new Date(booking.endDate))
//   )
//     status = "checked-out";
//   if (
//     isFuture(new Date(booking.startDate)) ||
//     isToday(new Date(booking.startDate))
//   )
//     status = "unconfirmed";
//   if (
//     (isFuture(new Date(booking.endDate)) ||
//       isToday(new Date(booking.endDate))) &&
//     isPast(new Date(booking.startDate)) &&
//     !isToday(new Date(booking.startDate))
//   )
//     status = "checked-in";

//   return {
//     ...booking,
//     numNights,
//     cabinPrice,
//     extrasPrice,
//     totalPrice,
//     guestId: allGuestIds.at(booking.guestId - 1),
//     cabinId: allCabinIds.at(booking.cabinId - 1),
//     status,
//   };
// });

// console.log(finalBookings);

// const { error } = await supabase.from("bookings").insert(finalBookings);
// if (error) console.log(error.message);
