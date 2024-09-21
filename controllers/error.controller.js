import CustomError from "../utils/customError.js";
const devErrors = (res, error) => {
  res.status(error.statusCode).json({
    code: error.statusCode,
    status: error.status,
    message: error.message,
    stackTrace: error.stack,
    error: error,
  });
};

const castErrorHandler = (err) => {
  const message = `Invalid value for ${err.path}: ${err.value}!`;
  return new CustomError(400, message);
};

const duplicateKeyErrorHandler = (err) => {
  const key = Object.keys(err.keyValue)[0];
  const value = err.keyValue[key];

  const message = `The ${key} "${value}" is already in use. Please choose another one.`;

  return new CustomError(400, message);
};

const validationErrorHandler = (err) => {
  const errors = Object.values(err.errors).map((val) => val.message);
  const errorMessages = errors.join(". ");
  const msg = `Invalid input data: ${errorMessages}`;

  return new CustomError(400, msg);
};

const handleExpiredJWT = (err) => {
  return new CustomError(401, "JWT has expired.Please Login again");
};

const handleJWTError = (err) => {
  return new CustomError(401, "Invalid token.Please login again");
};

const prodErrors = (res, error) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      code: error.statusCode,
      status: error.status,
      message: error.message,
    });
  } else {
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Something went wrong. Please try again later!!!",
    });
  }
};

export const globalErrorHandler = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "fail";
  if (process.env.NODE_ENV === "development") {
    devErrors(res, error);
  } else if (process.env.NODE_ENV === "production") {
    if (error.name === "CastError") error = castErrorHandler(error);
    if (error.code === 11000) error = duplicateKeyErrorHandler(error);
    if (error.name === "ValidationError") error = validationErrorHandler(error);
    if (error.name === "TokenExpiredError") error = handleExpiredJWT(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError(error);
    prodErrors(res, error);
  }
};

export default globalErrorHandler;
