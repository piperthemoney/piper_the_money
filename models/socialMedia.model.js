import mongoose from "mongoose";
const Schema = mongoose.Schema;
const socialMediaSchema = new Schema({
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
const SocialMedia = mongoose.model("socialmedia", socialMediaSchema);
export default SocialMedia;
