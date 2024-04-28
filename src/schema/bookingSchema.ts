import z, { ZodAny } from "zod";
export const BasicBookingSchema = z.object({
  id: z.number(),
  createdAt: z.date().or(z.string()),
  cabinPrice: z.coerce.number(),
  extrasPrice: z.coerce.number(),
  hasBreakfast: z.coerce.boolean(),
  startDate: z.date().or(z.string()),
  endDate: z.date().or(z.string()),
  numNights: z.number(),
  numGuests: z.number(),
  observations: z.string(),
  isPaid: z.coerce.boolean(),
  status: z.enum(["checkedIn", "unconfirmed", "checkedOut"]),
  totalPrice: z.number(),
});

export const BookingsSchema = BasicBookingSchema.merge(
  z.object({
    cabin: z.object({
      name: z.string(),
    }),
    guest: z.object({
      fullName: z.string(),
      email: z.string().email(),
    }),
  })
);

const FullBookingSchema = BasicBookingSchema.merge(
  z.object({
    cabin: z.object({
      id: z.coerce.number(),
      createdAt: z.date().or(z.string()),
      name: z.string(),
      maxCapacity: z.coerce.number(),
      regularPrice: z.coerce.number(),
      discount: z.coerce.number(),
      description: z.string(),
      image: z.string(),
    }),
    guest: z.object({
      id: z.coerce.number(),
      createdAt: z.date().or(z.string()),
      fullName: z.string(),
      email: z.string().email(),
      nationalID: z.string(),
      nationality: z.string(),
      countryFlag: z.string(),
    }),
  })
);

export const UpdateBookingSchema = FullBookingSchema.pick({
  status: true,
  isPaid: true,
  hasBreakfast: true,
  extrasPrice: true,
  totalPrice: true,
});

export type TBookingType = z.infer<typeof BookingsSchema>;
export type TBookingTypeArray = TBookingType[];
export type TFullBookingType = z.infer<typeof FullBookingSchema>;
export type TUpdateBookingType = z.infer<typeof UpdateBookingSchema>;
