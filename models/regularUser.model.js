import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Function to generate a random activation code
const generateCode = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  return code;
};

// Function to generate unique codes with retries
const generateUniqueCodes = async (quantity) => {
  if (quantity < 1) {
    throw new Error("Quantity must be at least 1.");
  }

  const codes = new Set();
  const maxAttempts = quantity * 2;
  let attempts = 0;

  while (codes.size < quantity && attempts < maxAttempts) {
    attempts++;
    codes.add(generateCode());
  }

  // Check for existing codes in the database
  const existingCodes = await RegularUser.find({
    "genCode.code": { $in: Array.from(codes) },
  }).select("genCode.code");
  existingCodes.forEach((doc) => codes.delete(doc.genCode.code));

  // Regenerate codes if there are duplicates
  while (codes.size < quantity && attempts < maxAttempts) {
    attempts++;
    codes.add(generateCode());
  }

  if (codes.size < quantity) {
    throw new Error("Unable to generate enough unique codes.");
  }

  return Array.from(codes);
};

// Helper function to convert lifespan to days
const lifespanToDays = (lifespan) => {
  switch (lifespan) {
    case "5mins":
      return 5 / (24 * 60);
    case "1hour":
      return 1 / 24;
    case "1day":
      return 1;
    case "7days":
      return 7;
    case "1month":
      return 30;
    case "3months":
      return 90;
    case "6months":
      return 180;
    case "1year":
      return 365;
    default:
      return 30;
  }
};

// Define schema for RegularUser
const regularUserSchema = new Schema({
  genCode: [
    {
      code: {
        type: String,
        unique: true,
        required: true,
      },
      activationDate: {
        type: Date,
        default: null,
      },
      isActive: {
        type: Boolean,
        default: null,
      },
      lastLogin: {
        type: Date,
        default: null,
      },
    },
  ],
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  merchant: {
    type: String,
    required: true,
  },
  lifespan: {
    type: String,
    enum: [
      "5mins",
      "1hour",
      "1day",
      "7days",
      "1month",
      "3months",
      "6months",
      "1year",
    ],
    default: "1month",
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
    max: 100,
  },
});

// Middleware to generate codes before saving
regularUserSchema.pre("save", async function (next) {
  if (
    this.isNew &&
    this.quantity > 0 &&
    (!this.genCode || this.genCode.length === 0)
  ) {
    try {
      let uniqueCodes = await generateUniqueCodes(this.quantity);
      this.genCode = uniqueCodes.map((code) => ({
        code,
        activationDate: null,
        isActive: null,
        lastLogin: null,
      }));
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to activate a code and set the activation date
regularUserSchema.methods.activateCode = function (codeString) {
  const codeEntry = this.genCode.find((entry) => entry.code === codeString);
  if (codeEntry) {
    if (!codeEntry.activationDate) {
      codeEntry.activationDate = new Date();
    }
    codeEntry.lastLogin = new Date();
    this.updateActivationStatus();
  }
};

const RegularUser = mongoose.model("RegularUser", regularUserSchema);

export default RegularUser;
