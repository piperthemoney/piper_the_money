import RegularUser from "../models/regularUser.model.js";
import ServerManager from "../models/serverManagment.model.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/customError.js";
import jwt from "jsonwebtoken";
import util from "util";
import XLSX from "xlsx";

// Function to generate JWT
export const generateToken = (userId, code, batch, lifespan) => {
  return jwt.sign({ userId, code, batch, lifespan }, process.env.SECRET_APP);
};

export const authenticateJWT = asyncErrorHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }
  if (!token) {
    return next(
      new CustomError(401, "You are not logged in! Activation code required")
    );
  }

  // Decode the JWT token and extract the code
  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_APP
  );
  const { userId, code: authCode } = decodedToken; // Assuming JWT contains userId and the specific code

  // Find the user based on userId
  const user = await RegularUser.findById(userId).select(); // Adjust `.select()` if you want to exclude sensitive fields

  if (!user) {
    return next(new CustomError(401, "The User does not exist"));
  }

  // Filter the genCode array to get only the authenticated code
  const matchedCode = user.genCode.find(
    (codeEntry) => codeEntry.code === authCode
  );

  if (!matchedCode) {
    return next(new CustomError(401, "Invalid activation code"));
  }

  // Attach the relevant code to req.user
  req.user = {
    ...user.toObject(), // Ensure this is converted to a plain JS object
    genCode: [matchedCode], // Only the matched code is attached
  };

  next();
});

// Create a new RegularUser and generate activation codes
export const createRegularUser = asyncErrorHandler(async (req, res, next) => {
  const { merchant, quantity, lifespan, batchName } = req.body;

  // Ensure that the quantity is a positive integer
  if (!Number.isInteger(quantity) || quantity < 1) {
    return next(new CustomError(400, "Quantity must be between 1 and 100"));
  }

  // Ensure lifespan is a valid value
  const validLifespans = ["1month", "3months", "6months", "1year"];
  if (!validLifespans.includes(lifespan)) {
    return next(new CustomError(400, "Invalid Lifespan Value."));
  }

  // Check if the batch exists
  const batch = await ServerManager.findOne({ batch: batchName });
  if (!batch) {
    return next(new CustomError(404, `Batch Name : ${batchName} not found`));
  }

  // Create a new RegularUser instance
  const newUser = new RegularUser({
    merchant,
    quantity,
    lifespan,
    batch: batchName, // Store the batch name directly
  });

  // Save the user
  const savedUser = await newUser.save();

  // Respond with the created user
  res.status(201).json({
    code: 201,
    status: "success",
    data: savedUser,
  });
});

// Fetch all users and their code statuses
export const getOverViewStatus = asyncErrorHandler(async (req, res, next) => {
  // Fetch all RegularUser documents
  const users = await RegularUser.find({});

  const results = users.map((user) => ({
    merchant: user.merchant,
    lifespan: user.lifespan,
    purchaseDate: user.generatedAt,
    quantity: user.quantity,
    id: user._id,
    // codes: user.genCode.map((codeEntry) => ({
    //   code: codeEntry.code,
    //   activationDate: codeEntry.activationDate,
    //   isActive: codeEntry.isActive,
    //   lastLogin: codeEntry.lastLogin,
    // })),
  }));

  res.status(200).json({
    status: "success",
    data: results,
  });
});

// Activate a code for a user
export const activateCode = asyncErrorHandler(async (req, res, next) => {
  const { code } = req.body; // Code provided by the user

  // Find the user that has this code in their genCode array
  const user = await RegularUser.findOne({ "genCode.code": code });

  if (!user) {
    return next(new CustomError(404, "Activation code not found."));
  }

  // Find the specific code entry in the user's genCode array
  const codeEntry = user.genCode.find((entry) => entry.code === code);

  // Check if the code is valid and active
  if (!codeEntry || codeEntry.isActive === false) {
    return next(
      new CustomError(
        400,
        "Activation code is either invalid, inactive, or expired."
      )
    );
  }

  // Activate the code if it's not already activated
  if (!codeEntry.activationDate) {
    codeEntry.activationDate = new Date();
    codeEntry.isActive = true; // Set to true upon activation
  }

  // Update last login date
  codeEntry.lastLogin = new Date(); // Update lastLogin for the specific code entry

  // Save the updated user document
  await user.save();

  // Generate JWT with user id and batch
  const token = generateToken(user._id, code, user.batch, user.lifespan); // Adjust token generation to include batch

  res.status(200).json({
    code: 200,
    status: "success",
    message: "Code activated successfully",
    token,
    data: {
      user: {
        batch: user.batch, // Include batch in the response
        codeEntry,
        lifespan: user.lifespan,
      },
    },
  });
});
``;

export const getDetailStatus = asyncErrorHandler(async (req, res, next) => {
  const user = await RegularUser.findById(req.params.id);

  if (!user) {
    return next(
      new CustomError(404, "No documentation found with the given Id")
    );
  }
  const results = {
    merchant: user.merchant,
    purchaseDate: user.generatedAt,
    quantity: user.quantity,
    lifespan: user.lifespan,
    codes: user.genCode.map((codeEntry) => ({
      code: codeEntry.code,
      activationDate: codeEntry.activationDate,
      isActive: codeEntry.isActive,
      lastLogin: codeEntry.lastLogin,
    })),
  };
  res.status(200).json({
    status: "success",
    data: results,
  });
});

const convertToMyanmarTime = (date) => {
  if (!date) return "";

  const utcDate = new Date(date);
  const myanmarOffset = 6 * 60 + 30; // Offset in minutes
  const myanmarTime = new Date(utcDate.getTime() + myanmarOffset * 60 * 1000);

  return myanmarTime.toLocaleString("en-GB", { timeZone: "Asia/Yangon" });
};

export const exportUserById = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await RegularUser.findById(id).select(
    "genCode generatedAt merchant lifespan quantity"
  );

  if (!user) {
    return next(new CustomError(404, "Can't find given Id"));
  }

  // Prepare the data for Excel
  const data = [
    ["Code", "Generated At", "Merchant", "Lifespan", "Quantity"], // Header
    ...user.genCode.map((gen, index) => [
      gen.code || "", // Code
      index === 0 ? convertToMyanmarTime(user.generatedAt) : "", // Generated At (only once)
      index === 0 ? user.merchant : "", // Merchant (only once)
      index === 0 ? user.lifespan : "", // Lifespan (only once)
      index === 0 ? user.quantity : "", // Quantity (only once)
    ]),
  ];

  // Create a new workbook and add a worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, "UserExport");

  // Add basic formatting
  ws["!cols"] = [
    { width: 30 }, // Code
    { width: 20 }, // Generated At
    { width: 20 }, // Merchant
    { width: 15 }, // Lifespan
    { width: 10 }, // Quantity
  ];

  // Create the Excel file in memory
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

  // Set headers to prompt file download
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=id-${id}-export.xlsx`
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  // Send the buffer directly to the client
  res.send(buffer);
});
