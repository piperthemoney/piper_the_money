import mongoose from "mongoose";
const Schema = mongoose.Schema;
const socialMediaSchema = new Schema({
  platform_name: {
    type: String,
    required: true,
  },
  platform_link: {
    type: String,
    required: true,
  },
});
const SocialMedia = mongoose.model("socailmedia", socialMediaSchema);
export default SocialMedia;
