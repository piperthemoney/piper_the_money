import Db from "./configs/db.config.js";
import cron from "node-cron";
import { updateActivationStatuses } from "./crons/updateUserStatuses.js";
// import process from "node:process";
process.on("uncaughtException", (err) => {
  console.log("Inside uncaughtException handler");
  console.log(err.name, err.message);
  console.log("Uncaught Expection occured. Server is Shutting down!!!");
  process.exit(1);
});
import app from "./app.js";

Db();

const port = process.env.PORT || 5500;
// Schedule the cron job to run every five minutes
cron.schedule("*/5 * * * *", () => {
  console.log("Running cron job to update activation statuses...");
  updateActivationStatuses();
});

const server = app.listen(port, () => {
  console.log(`SERVER is Running at PORT:${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandle Rejection occured. Server is Shutting down!!!");
  server.close(() => {
    process.exit(1);
  });
});
