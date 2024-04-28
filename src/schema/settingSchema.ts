import z from "zod";

export const settingSchema = z.object({}).partial().extend({
  minBookingLength: z.number().optional(),
  maxBookingLength: z.number().optional(),
  maxGuestsPerBooking: z.number().optional(),
  breakfastPrice: z.number().optional(),
});

export type USettingType = z.infer<typeof settingSchema>;
