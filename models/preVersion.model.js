import mongoose from "mongoose";

const Schema = mongoose.Schema;

const preAppVresionSchema = new Schema({
  preVersion: {
    type: String,
    required: true,
  },
  playstore: {
    type: String,
    required: true,
  },
  externalUrl: { type: String, required: true },
});

const PreAppVersion = mongoose.model("preappversion", preAppVresionSchema);

export default PreAppVersion;
