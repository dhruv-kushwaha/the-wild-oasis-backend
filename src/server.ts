import dotenv from "dotenv";
import prisma from "./utils/client";
dotenv.config();

import app from "./app";
import { PrismaClient } from "@prisma/client";

process.on("uncaughtException", async function (err: Error) {
  console.log("UNHANDLED EXCEPTION! SHUTTING DOWN 💥💥");
  console.log(err.name, err.message);
  await handleAppExit();
  process.exit(1);
});

const handleAppExit = async () => {
  console.log("Closing Prisma connection...");
  await prisma.$disconnect();
  console.log("Prisma connection closed.");
};

(async function () {
  await prisma.$connect();
  console.log("Connected to DB 🫡🫡");
})();

const PORT = process.env.PORT || 3009;

const server = app.listen(PORT, () =>
  console.log(`App running on PORT ${PORT}`)
);

process.on("SIGINT", async () => {
  console.log("SIGINT! SHUTTING DOWN 💥💥");
  await handleAppExit();
  server.close(() => process.exit(0));
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM! SHUTTING DOWN 💥💥");
  await handleAppExit();
  server.close(() => process.exit(0));
});

// unhandled Promise rejection
// db is down, can't login etc
// errors outside express
// whenever there is an unhandled promise rejection in our application, process object will emit an object called unhandled rejection

process.on("unhandledRejection", async function (err: Error) {
  console.log("UNHANDLED REJECTION! SHUTTING DOWN 💥💥");
  console.log(err.name, err.message);
  await handleAppExit();
  server.close(() => process.exit(1));
});
