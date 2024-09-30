import ping from "ping";
import ServerManager from "../models/serverManagment.model.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/customError.js";
import { extractDataFromVlessLink } from "../utils/vlessExtractor.js";
import { Server } from "socket.io";

let io;

export const initializeSocketIO = (socketIO) => {
  io = socketIO; // Assign the Socket.IO instance
};

const pingServers = async () => {
  const servers = await ServerManager.find();
  const pingPromises = [];

  // Loop through each server and push ping promises
  servers.forEach((server) => {
    server.serverData.forEach((serverDetail) => {
      const serverAddress = serverDetail.serverAddress;

      // Push each ping promise to the array
      pingPromises.push(
        ping.promise.probe(serverAddress, { timeout: 3 }).then((result) => {
          const pingResult = {
            serverAddress,
            status: result.alive ? "UP" : "DOWN",
            responseTime: result.alive ? result.time : "timeout", // Response time in ms
          };

          // Emit the result to connected clients
          // console.log("Emitting ping results:", pingResult);
          io.emit("pingResult", pingResult); // Emit ping result

          return pingResult; // Return the result for further processing if needed
        })
      );
    });
  });

  // Wait for all ping results to complete
  await Promise.all(pingPromises);
};

export const startPingTesting = () => {
  pingServers(); // Initial call to start pinging

  // Set interval to ping every 3 seconds
  setInterval(() => {
    pingServers();
  }, 3000);
};

export const serversStatus = asyncErrorHandler(async (req, res, next) => {
  // Fetch all ServerManager documents
  const servers = await ServerManager.find({});
  const pingPromises = [];

  // Loop through each server
  servers.forEach((server) => {
    // const batch = server.batch;
    // const id = server.id;
    // Loop through each server detail
    server.serverData.forEach((serverDetail) => {
      const batch = server.batch;
      const id = server.id;
      const serverAddress = serverDetail.serverAddress;
      // Push each ping promise to the array
      pingPromises.push(
        ping.promise.probe(serverAddress, { timeout: 3 }).then((result) => ({
          batch,
          id,
          serverData: {
            serverAddress,
            status: result.alive ? "UP" : "DOWN",
            responseTime: result.alive ? result.time : "timeout", // Response time in ms
            geoLocation: serverDetail.geoLocation, // Include geoLocation
            vlessServers: serverDetail.vlessServers,
            id: serverDetail._id,
          },
        }))
      );
    });
  });

  // Wait for all ping results to complete
  const pingResults = await Promise.all(pingPromises);

  // Send the ping results as a response
  return res.status(200).json({
    code: 200,
    status: "success",
    message: "Ping and server data successfully retrived.",
    data: pingResults,
  });
});

export const viewBatchData = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new CustomError(400, "Please provide a server ID."));
  }

  // Find the server document by its MongoDB _id
  const server = await ServerManager.findById(id);

  if (!server) {
    return next(new CustomError(404, "Server not found."));
  }

  // Send the response with the server data
  res.status(200).json({
    status: "success",
    data: server,
  });
});

export const viewBatchDataOverview = asyncErrorHandler(
  async (req, res, next) => {
    const servers = await ServerManager.find();

    const results = servers.map((batch) => ({
      id: batch._id,
      batch: batch.batch,
      length: batch.serverData.length,
    }));

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Batch overview data successfully retrived.",
      data: results,
    });
  }
);

export const serverCreate = asyncErrorHandler(async (req, res, next) => {
  const { batch, serverData } = req.body;

  if (!batch || !serverData) {
    return next(new CustomError(400, "Please filled required data."));
  }

  const newServer = new ServerManager({
    batch,
    serverData,
  });

  const savedServer = await newServer.save();
  res.status(201).json({
    code: 201,
    status: "success",
  });
});

export const pushServer = asyncErrorHandler(async (req, res, next) => {
  const { serverId } = req.params;
  const { vlessServers } = req.body;

  // Check if vlessServers is provided
  if (!vlessServers) {
    return next(new CustomError(400, "Please fill server link."));
  }

  // Find the server manager document by ID
  const serverManager = await ServerManager.findById(serverId);

  // If the document doesn't exist, return a 404 error
  if (!serverManager) {
    return next(new CustomError(404, "Given Id Doesn't exist."));
  }

  // Push the new server data into the serverData array
  serverManager.serverData.push({ vlessServers });

  // Save the document to trigger the pre-save hook and any validations
  await serverManager.save();

  // Return a success response
  res.status(200).json({
    code: 200,
    status: "success",
    message: "New Server Link Successfully added.",
    data: serverManager, // Return the updated document
  });
});

export const updateVlessServer = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params; // ID of the document
  const { vlessServerId } = req.params; // ID of the vlessServer entry
  const { vlessServers } = req.body; // New VLESS server URL

  // Check if ID, vlessServerId, and vlessServers are provided
  if (!id || !vlessServerId || !vlessServers) {
    return next(
      new CustomError(
        400,
        "Please provide the document ID, vlessServer ID, and new vlessServers URL."
      )
    );
  }

  // Find the server document by its MongoDB _id
  const server = await ServerManager.findById(id);

  if (!server) {
    return next(new CustomError(404, "Server not found."));
  }

  // Find the index of the vlessServers entry to update
  const serverIndex = server.serverData.findIndex(
    (entry) => entry._id.toString() === vlessServerId
  );

  if (serverIndex === -1) {
    return next(new CustomError(404, "VLESS server entry not found."));
  }

  // Extract new data from the provided vlessServers URL
  const extractedData = extractDataFromVlessLink(vlessServers);

  // Update the server data
  server.serverData[serverIndex] = {
    ...server.serverData[serverIndex],
    vlessServers,
    hostname: extractedData.hostname || server.serverData[serverIndex].hostname,
    geoLocation:
      extractedData.geoLocation || server.serverData[serverIndex].geoLocation,
    serverAddress:
      extractedData.serverAddress ||
      server.serverData[serverIndex].serverAddress,
  };

  // Save the updated server document
  await server.save();

  res.status(200).json({
    status: "success",
    data: server,
  });
});

export const getServerDataByBatch = asyncErrorHandler(
  async (req, res, next) => {
    const user = req.user; // Authenticated user
    const batch = user.batch; // User's batch

    if (!batch) {
      return next(new CustomError(400, "Batch not found for the user"));
    }

    // Fetch server data from ServerManager schema based on the user's batch
    const serverData = await ServerManager.findOne({ batch }).select(
      "serverData"
    );
    if (!serverData) {
      return next(
        new CustomError(404, "No server data found for the user's batch")
      );
    }

    res.status(200).json({
      status: "success",
      data: serverData.serverData,
    });
  }
);
