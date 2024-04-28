-- AlterTable
ALTER TABLE "Cabin" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "image" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Guest" ALTER COLUMN "countryFlag" DROP NOT NULL;
