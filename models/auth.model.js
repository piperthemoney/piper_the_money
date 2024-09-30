import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const Schema = mongoose.Schema;
const userSchema = new Schema({
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please Enter Valid Email."],
  },
  password: {
    type: String,
    required: [true, "Please Enter a Password."],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Please Confirm your Password."],
    validate: {
      validator: function (val) {
        return val == this.password;
      },
      message: "Password Doesn't Match.",
    },
  },
  role: {
    type: String,
    enum: ["merchant", "admin", "superadmin"],
    default: "merchant",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  passwordChangedAt: { type: Date, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetTokenExpire: { type: Date, select: false },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.comparePasswordInDb = async (pswd, pswdDB) => {
  return await bcrypt.compare(pswd, pswdDB);
};

userSchema.methods.isPasswordChanged = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const pswdChangedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(JWTTimestamp, pswdChangedTimestamp);
    return JWTTimestamp < pswdChangedTimestamp; //1711588263 < 1711756800
  }
  return false;
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpire = Date.now() + 10 * 60 * 1000;

  console.log(resetToken, this.passwordResetToken);

  return resetToken;
};

const User = mongoose.model("user", userSchema);

export default User;
