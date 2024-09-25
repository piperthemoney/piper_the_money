import Support from "../models/customersupport.model.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/customError.js";

export const createCustomerSupport = asyncErrorHandler(
  async (req, res, next) => {
    const { guide, platform } = req.body;

    if (!guide && !platform) {
      return next(new CustomError(400, "Please fill all require field."));
    }

    const newCustomerSupport = new Support({
      platform,
      guide,
    });

    const savedCustomerSupport = await newCustomerSupport.save();

    res.status(201).json({
      code: 201,
      status: "success",
      messgae: "New Customer Support Channel created successfully",
    });
  }
);

export const pushCustomerSupportData = asyncErrorHandler(
  async (req, res, next) => {
    const { guideId } = req.params;
    const { name, link } = req.body;
    if (!name || !link) {
      return next(new CustomError(400, "Please fill all required field."));
    }

    const updatedCustomerSupport = await Support.findByIdAndUpdate(
      guideId,
      {
        $push: { platform: { name, link } },
      },
      { new: true, runValidators: true }
    );

    if (!updatedCustomerSupport) {
      return next(new CustomError(404, "Given Id doesn't exist"));
    }

    res.status(200).json({
      code: 200,
      status: "success",
      message: "New Social Media Related data successfully added.",
    });
  }
);

export const getCustomerSupportData = asyncErrorHandler(
  async (req, res, next) => {
    const customerSupportData = await Support.find();

    if (customerSupportData.length === 0) {
      return next(new CustomError(404, "There is no data to show"));
    }

    const data = customerSupportData.map(({ _doc }) => {
      const { __v, ...rest } = _doc;
      return rest;
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Social media data successfully retrived.",
      data,
    });
  }
);
