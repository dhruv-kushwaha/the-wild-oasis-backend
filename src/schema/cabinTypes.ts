export interface cabin {
  id: number;
  createdAt: Date;
  name: string;
  maxCapacity: number;
  regularPrice: number;
  discount: number;
  description: string;
  image: string;
}

export type UpdateCabinType = {
  name?: string;
  maxCapacity?: number;
  regularPrice?: number;
  discount?: number;
  description?: string;
  image?: string;
};

export type cabinArray = cabin[];
