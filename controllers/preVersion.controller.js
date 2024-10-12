import PreAppVersion from "../models/preVersion.model.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/customError.js";

export const createPreAppVersion = asyncErrorHandler(async (req, res, next) => {
  const { preVersion, playstore, externalUrl } = req.body;

  if (!preVersion || !playstore || !externalUrl) {
    return next(new CustomError(400, "You have to fill all required field."));
  }

  const newPreAppVersion = new PreAppVersion({
    preVersion,
    playstore,
    externalUrl,
  });

  const savedPreAppVersion = await newPreAppVersion.save();

  res.status(201).json({
    code: 201,
    status: "success",
    message: "App version control successfully created.",
  });
});

export const retrivedPreVersionControl = asyncErrorHandler(
  async (req, res, next) => {
    const retrivedData = await PreAppVersion.find();

    if (!retrivedData === 0) {
      return next(new CustomError(404), "There is no data to give.");
    }

    const data = retrivedData.map(({ _doc }) => {
      const { __v, ...rest } = _doc;
      return rest;
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Data retrived successully for app version control.",
      data,
    });
  }
);

export const updatePreVersionControlData = asyncErrorHandler(
  async (req, res, next) => {
    const { id } = req.params;
    const { preVersion, playstore, externalUrl } = req.body;

    if (!id) {
      return next(new CustomError(404, "Please provide the document id."));
    }

    const preAppVersion = await PreAppVersion.findById(id);

    if (!preAppVersion) {
      return next(
        new CustomError(404, "Can't find the document on the server.")
      );
    }

    const updatedPreAppVersion = await PreAppVersion.findByIdAndUpdate(
      id,
      { preVersion, playstore, externalUrl },
      { new: true, runValidators: true }
    );

    if (!updatedPreAppVersion) {
      return next(new CustomError(400, "Please fill in the data to update."));
    }

    const { __v, ...data } = updatedPreAppVersion._doc;

    res.status(200).json({
      code: 200,
      status: "success",
      message: "App version control data updated successfully.",
    });
  }
);
