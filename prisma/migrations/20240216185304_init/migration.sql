-- AlterTable
CREATE SEQUENCE booking_id_seq;
ALTER TABLE "Booking" ALTER COLUMN "id" SET DEFAULT nextval('booking_id_seq');
ALTER SEQUENCE booking_id_seq OWNED BY "Booking"."id";

-- AlterTable
CREATE SEQUENCE cabin_id_seq;
ALTER TABLE "Cabin" ALTER COLUMN "id" SET DEFAULT nextval('cabin_id_seq');
ALTER SEQUENCE cabin_id_seq OWNED BY "Cabin"."id";

-- AlterTable
CREATE SEQUENCE guest_id_seq;
ALTER TABLE "Guest" ALTER COLUMN "id" SET DEFAULT nextval('guest_id_seq');
ALTER SEQUENCE guest_id_seq OWNED BY "Guest"."id";

-- AlterTable
CREATE SEQUENCE setting_id_seq;
ALTER TABLE "Setting" ALTER COLUMN "id" SET DEFAULT nextval('setting_id_seq');
ALTER SEQUENCE setting_id_seq OWNED BY "Setting"."id";

-- AlterTable
CREATE SEQUENCE user_id_seq;
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT nextval('user_id_seq');
ALTER SEQUENCE user_id_seq OWNED BY "User"."id";
