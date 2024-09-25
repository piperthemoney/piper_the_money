import SocialMedia from "../models/socialMedia.model.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/customError.js";

export const createSocialMedia = asyncErrorHandler(async (req, res, next) => {
  const { platform_name, platform_link } = req.body;

  if (!platform_link && !platform_name) {
    return new CustomError(400, "Please fill all require field.");
  }

  const newSocialMedia = new SocialMedia({ platform_link, platform_name });

  const savedSocialMedia = await newSocialMedia.save();

  res.status(201).json({
    code: 201,
    status: "success",
    messgae: "New Social Media Interaction created successfully",
  });
});
