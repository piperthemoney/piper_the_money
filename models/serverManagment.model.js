import mongoose from "mongoose";
import { extractDataFromVlessLink } from "../utils/vlessExtractor.js";
import CustomError from "../utils/customError.js";

const Schema = mongoose.Schema;

const serverManagmentSchema = new Schema({
  batch: {
    type: String,
    required: true,
    // unique: true,
  },
  serverData: [
    {
      vlessServers: {
        type: String,
        required: true,
        unique: true,
      },
      hostname: {
        type: String,
      },
      geoLocation: {
        type: String,
      },
      serverAddress: {
        type: String,
      },
    },
  ],
});

serverManagmentSchema.pre("save", function (next) {
  if (this.serverData && Array.isArray(this.serverData)) {
    this.serverData.forEach((server) => {
      if (server.vlessServers) {
        try {
          const extractedData = extractDataFromVlessLink(server.vlessServers);
          server.hostname = extractedData.hostname;
          server.geoLocation = extractedData.geoLocation;
          server.serverAddress = extractedData.serverAddress;
        } catch (error) {
          return next(new CustomError(400, "Error processing VLESS link."));
        }
      }
    });
    next();
  } else {
    return next(
      new CustomError(400, "Invalid server data format. Expected an array.")
    );
  }
});

const ServerManager = mongoose.model("server", serverManagmentSchema);

export default ServerManager;
