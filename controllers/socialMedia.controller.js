import SocialMedia from "../models/socialMedia.model.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/customError.js";

export const createSocialMedia = asyncErrorHandler(async (req, res, next) => {
  const { guide, platform } = req.body;

  if (!guide && !platform) {
    return next(new CustomError(400, "Please fill all require field."));
  }

  const newSocialMedia = new SocialMedia({
    platform,
    guide,
  });

  const savedSocialMedia = await newSocialMedia.save();

  res.status(201).json({
    code: 201,
    status: "success",
    messgae: "New Social Media Interaction created successfully",
    data: savedSocialMedia,
  });
});

export const pushPlatformData = asyncErrorHandler(async (req, res, next) => {
  const { guideId } = req.params;
  const { name, link } = req.body;
  if (!name || !link) {
    return next(new CustomError(400, "Please fill all required field."));
  }

  const updatedSocialMedia = await SocialMedia.findByIdAndUpdate(
    guideId,
    {
      $push: { platform: { name, link } },
    },
    { new: true, runValidators: true }
  );

  if (!updatedSocialMedia) {
    return next(new CustomError(404, "Given Id doesn't exist"));
  }

  res.status(200).json({
    code: 200,
    status: "success",
    message: "New Social Media Related data successfully added.",
  });
});

export const getSocialMediaData = asyncErrorHandler(async (req, res, next) => {
  const socialMediaData = await SocialMedia.find();

  if (socialMediaData.length === 0) {
    return next(new CustomError(404, "There is no data to show"));
  }

  const data = socialMediaData.map(({ _doc }) => {
    const { __v, ...rest } = _doc;
    return rest;
  });

  res.status(200).json({
    code: 200,
    status: "success",
    message: "Social media data successfully retrived.",
    data,
  });
});
