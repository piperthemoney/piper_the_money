// import dotenv from "dotenv";
// // dotenv.config({ path: "./.env" });
import express from "express";
import cors from "cors";
import sanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import CustomError from "./utils/customError.js";
import globalErrorHandler from "./controllers/error.controller.js";
import appVersionControlRouter from "./routes/appVersion.route.js";
import customerSupportRouter from "./routes/customerSupport.route.js";
import socialMediaRouer from "./routes/socialMedia.route.js";
import serverManagerRouter from "./routes/serverManagment.route.js";
import authRouter from "./routes/auth.route.js";
import regularUserRouter from "./routes/regularUser.route.js";
import monitorRouter from "./routes/monitor.route.js";

import setupSwagger from "./configs/swagger.config.js";

const app = express();
app.use(helmet());

let limiter = rateLimit({
  max: 60,
  windowMs: 60 * 1000,
  handler: (req, res) => {
    res.status(429).json({
      code: 429,
      status: "fail",
      message: "Too many requests. Please try again later",
    });
  },
});

app.use("/api", limiter);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10kb" }));
app.use(sanitize());

// mount routing
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/regular-users", regularUserRouter);
app.use("/api/v1/monitor", monitorRouter);
app.use("/api/v1/server-manager", serverManagerRouter);
app.use("/api/v1/social", socialMediaRouer);
app.use("/api/v1/support", customerSupportRouter);
app.use("/api/v1/version", appVersionControlRouter);

setupSwagger(app);
app.all("*", (req, res, next) => {
  const err = new CustomError(
    404,
    `Can't find ${req.originalUrl} on the server!`
  );
  next(err);
});

app.use(globalErrorHandler);
export default app;
