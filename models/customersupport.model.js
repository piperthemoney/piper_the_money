import mongoose from "mongoose";
const Schema = mongoose.Schema;
const customerSupportSchema = new Schema({
  guide: {
    type: String,
    required: true,
  },
  platform: [
    {
      name: { type: String, required: true },
      link: { type: String, required: true },
    },
  ],
});
const Support = mongoose.model("support", customerSupportSchema);
export default Support;
