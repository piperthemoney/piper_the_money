import AppVersion from "../models/appVersion.model.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/customError.js";

export const createAppVersion = asyncErrorHandler(async (req, res, next) => {
  const { version, playstore, externalUrl } = req.body;

  if (!version || !playstore || !externalUrl) {
    return next(new CustomError(400, "You have to fill all required field.  "));
  }

  const newAppVersion = new AppVersion({
    version,
    playstore,
    externalUrl,
  });

  const savedAppVersion = await newAppVersion.save();

  res.status(201).json({
    code: 201,
    status: "success",
    message: "App version control successfully created.",
  });
});

export const retrivedVersionControl = asyncErrorHandler(
  async (req, res, next) => {
    const retrivedData = await AppVersion.find();

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

export const updateVersionControlData = asyncErrorHandler(
  async (req, res, next) => {
    const { id } = req.params;
    const { version, playstore, externalUrl } = req.body;

    if (!id) {
      return next(new CustomError(404, "Please provide the document id."));
    }

    const appVersion = await AppVersion.findById(id);

    if (!appVersion) {
      return next(
        new CustomError(404, "Can't find the document on the server.")
      );
    }

    const updatedAppVersion = await AppVersion.findByIdAndUpdate(
      id,
      { version, playstore, externalUrl },
      { new: true, runValidators: true }
    );

    if (!updatedAppVersion) {
      return next(new CustomError(400, "Please fill in the data to update."));
    }

    const { __v, ...data } = updatedAppVersion._doc;

    res.status(200).json({
      code: 200,
      status: "success",
      message: "App version control data updated successfully.",
    });
  }
);
