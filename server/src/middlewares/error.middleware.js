import envConfig from "../config/env.config.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Check if it's already an ApiError structure
  if (!(error.statusCode && error.success === false)) {
    const statusCode =
      error.statusCode || error instanceof Error ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
    const message = error.message || "Something went wrong";
    error = ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  const response = {
    ...error,
    message: error.message,
    ...(envConfig.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode).json(response);
};

export default errorHandler;
