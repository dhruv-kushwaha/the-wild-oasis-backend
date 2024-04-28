import express from "express";
import morgan from "morgan";
import cors from "cors";
import globalErrorHandler from "./controllers/errorController";
import router from "./routes/index";
import AppError from "./utils/AppError";
import cookieParser from "cookie-parser";

const app = express();

const whitelist = [
  "http://localhost:5173",
  "http://192.168.29.4:5173",
  undefined,
];
app.use(
  cors({
    origin: function (origin, cb) {
      // console.log("CORS :", origin);
      if (whitelist.includes(origin as string)) {
        cb(null, true);
      } else {
        cb(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// app.use(delayMiddleware(500));

// routes
app.use("/api/v1", router);

app.all("*", (req, res, next) => {
  return next(
    new AppError(`Can't find ${req.originalUrl} on this server!`, 404)
  );
});

// global error handler
app.use(globalErrorHandler);

export default app;
