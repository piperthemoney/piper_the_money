import User from "../models/auth.model.js";
import jwt from "jsonwebtoken";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/customError.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import utli from "util";

export const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_WEB, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });
};

export const signup = asyncErrorHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const token = signToken(newUser._id);
  const { password: pass, __v, ...rest } = newUser._doc;

  res.status(201).json({
    statusCode: 201,
    status: "success",
    message: "User created successfully.",
    data: { user: rest, token },
  });
});

export const login = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //Check id email & password is present in request body
  if (!email || !password) {
    const error = new CustomError(
      400,
      "Please provide correct Email ID & Password for login!"
    );
    return next(error);
  }

  //Check if user exit in db
  const user = await User.findOne({ email }).select("+password");

  //Checked the user exit & password matches
  if (!user || !(await user.comparePasswordInDb(password, user.password))) {
    const error = new CustomError(400, "Incorrect email or password");
    return next(error);
  }

  const token = signToken(user._id);
  const {
    password: pass,
    __v,
    passwordResetToken,
    passwordResetTokenExpire,
    ...rest
  } = user._doc;

  res.status(200).json({
    code: 200,
    status: "success",
    message: "User successfully log in.",
    data: {
      user: rest,
      token,
    },
  });
});

export const protect = asyncErrorHandler(async (req, res, next) => {
  //read the token & check if it exist
  const testToken = req.headers.authorization;
  let token;
  if (testToken && testToken.startsWith("Bearer")) {
    token = testToken.split(" ")[1];
  }
  if (!token) {
    next(
      new CustomError(401, "You are not logged in! Authentication required")
    );
  }
  //validate the token
  const decodedToken = await utli.promisify(jwt.verify)(
    token,
    process.env.SECRET_WEB
  );
  //if the user exist
  const user = await User.findById(decodedToken.id);

  if (!user) {
    const error = new CustomError(401, "The User does not exist");
    next(error);
  }
  const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);
  //if user changed password after the token was issued
  if (isPasswordChanged) {
    const error = new CustomError(
      401,
      "The password has been changed recently.Please login again"
    );
    return next(error);
  }
  //allow user to access route
  req.user = user;
  next();
});

export const restrict = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      const error = new CustomError(403, "Forbidden Access");
      return next(error);
    }
    next();
  };
};

export const forgotPassword = asyncErrorHandler(async (req, res, next) => {
  //1.Get User Base on posted email
  const user = await User.findOne({ email: req.body.email });
  console.log(user);

  if (!user) {
    const error = new CustomError(
      404,
      "We Could not find the user with given email."
    );
    next(error);
  }

  //2. generate a random token

  const resetToken = user.createResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  //3.Send the token back to user email
  const resetUrl = `${process.env.FRONTEND_URL}reset/${resetToken}`;
  console.log(`resetUrl : ${resetUrl}`);
  const message = `We have recieved a password reset request.Please use the below link to reset password.
   \n\n ${resetUrl} \n\n
  This reset password link will be valid only for 10 min. 

  Please note that you cannot reply to this Email.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password change request recieved",
      message: message,
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: `Password reset link has been sent to the user email : ${req.body.email}`,
    });
  } catch (err) {
    (user.passwordResetToken = undefined),
      (user.passwordResetTokenExpire = undefined);
    user.save({ validateBeforeSave: false });

    return next(
      new CustomError(
        500,
        "There was an error sending password reset email.please try again later"
      )
    );
  }
});

export const resetPassword = asyncErrorHandler(async (req, res, next) => {
  // 1. If the user exists with the given token & token has not expired
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    const error = new CustomError(400, "Token is invalid or has expired");
    return next(error);
  }

  // 2. Resetting the user password
  user.password = req.body.password;
  console.log(`req.body.password : ${req.body.password}`);
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpire = undefined;
  user.passwordChangedAt = Date.now();

  await user.save(); // Await the save operation

  // 3. Login the user
  const loginToken = signToken(user._id);

  res.status(200).json({
    code: 200,
    status: "success",
    message: `Password successfully reset for your account: ${user.email}`,
    token: loginToken,
  });
});
