import Db from "./configs/db.config.js";
import app from "./app.js";
import http from "http";
import cron from "node-cron";
import { updateActivationStatuses } from "./crons/updateUserStatuses.js";
import { Server } from "socket.io";
import {
  initializeSocketIO,
  startPingTesting,
} from "./controllers/serverManagment.controller.js";

// Error handling for uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("Inside uncaughtException handler");
  console.log(err.name, err.message);
  console.log("Uncaught Exception occurred. Server is Shutting down!!!");
  process.exit(1);
});

// Connect to the database
Db();

const port = process.env.PORT || 5500;

// Schedule the cron job to run every five minutes
cron.schedule("*/5 * * * *", () => {
  console.log("Running cron job to update activation statuses...");
  updateActivationStatuses();
});

// Create an HTTP server using the Express app
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

initializeSocketIO(io);

startPingTesting(io);

// Socket.IO connection setup
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("pingResult", (data) => {
    console.log("Ping Results:", data);

    socket.emit("pingResult", data); // Emit to the connected socket
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(port, () => {
  console.log(`SERVER is Running at PORT:${port}`);
});

// Error handling for unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandled Rejection occurred. Server is Shutting down!!!");
  server.close(() => {
    process.exit(1);
  });
});
