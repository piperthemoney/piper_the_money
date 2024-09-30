import Db from "./configs/db.config.js";
import app from "./app.js";
import http from "http";
import cron from "node-cron";
import { updateActivationStatuses } from "./crons/updateUserStatuses.js";
// Import http to create the server
import { Server } from "socket.io"; // Import Socket.IO
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
const io = new Server(server); // Initialize Socket.IO with the HTTP server

// Initialize Socket.IO in the controller
initializeSocketIO(io);

// Start the ping testing process
startPingTesting(io); // Pass the io instance to startPingTesting

// Socket.IO connection setup
io.on("connection", (socket) => {
  console.log("New client connected");

  // Listen for ping results from the server-side pinging process
  socket.on("pingResults", (data) => {
    console.log("Ping Results:", data);
    // You can also emit these results back to the client if needed
    socket.emit("pingResults", data); // Emit to the connected socket
  });

  // Clean up on client disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start the server
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
