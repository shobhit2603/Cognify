import { StatusCodes } from "http-status-codes";
import ApiResponse from "../utils/apiResponse.util.js";

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(ApiResponse(StatusCodes.BAD_REQUEST, "Validation Error", error.issues));
  }
};
