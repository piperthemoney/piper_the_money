import ServerManager from "../models/serverManagment.model.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/customError.js";
import { extractDataFromVlessLink } from "../utils/vlessExtractor.js";

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

export const viewServers = asyncErrorHandler(async (req, res, next) => {
  // Fetch all ServerManager documents
  const servers = await ServerManager.find({});

  const results = servers.map((server) => ({
    batch: server.batch, // Access `batch` from each `server`
    id: server._id,
    serverData: server.serverData.map((dataEntry) => ({
      vlessServers: dataEntry.vlessServers, // Retain the original VLESS link
      hostname: dataEntry.hostname,
      geoLocation: dataEntry.geoLocation,
      serverAddress: dataEntry.serverAddress,
      id: dataEntry._id,
    })),
  }));

  // Send the response
  res.status(200).json({
    status: "success",
    length: results.length,
    data: results,
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
    code: 200,
    status: "success",
    length: server.serverData.length,
    data: server,
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
