import z from "zod";

type Cabin = {
  id: number;
  createdAt: Date;
  name: string;
  maxCapacity: number;
  regularPrice: number;
  discount: number;
  description: string;
  image: string;
};

export const createCabinSchema = z.object({
  name: z.string(),
  maxCapacity: z.coerce.number(),
  regularPrice: z.coerce.number(),
  discount: z.coerce.number(),
  description: z.string().optional(),
  image: z.string().optional(),
});

export type ICabinType = z.infer<typeof createCabinSchema>;
