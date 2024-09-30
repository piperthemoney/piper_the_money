import mongoose from "mongoose";

const Schema = mongoose.Schema;

const appVresionSchema = new Schema({
  version: {
    type: String,
    required: true,
  },
  playstore: {
    type: String,
    required: true,
  },
  externalUrl: { type: String, required: true },
});

const AppVersion = mongoose.model("appversion", appVresionSchema);

export default AppVersion;
