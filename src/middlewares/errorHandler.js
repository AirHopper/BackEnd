import AppError from "../utils/AppError.js";

// Error handler middleware
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    // Handle custom application errors
    return res.status(err.statusCode).json({
      status: false,
      data: null,
      message: err.message,
      error: err,
    });
  } else {
    // Handle general errors
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal Server Error",
      error: err,
      sentry: res.sentry,
    });
  }
};

export default errorHandler;
