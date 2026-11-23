import { StatusCodes } from "http-status-codes";
import ApiResponse from "../utils/apiResponse.util.js";

export const validate = (schema, source = "body") => (req, res, next) => {
  try {
    const target = source === "query" ? req.query : source === "params" ? req.params : req.body;
    const parsed = schema.parse(target);
    if (source === "query") {
      Object.assign(req.query, parsed);
    } else if (source === "params") {
      Object.assign(req.params, parsed);
    } else {
      req.body = parsed;
    }
    next();
  } catch (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(ApiResponse(StatusCodes.BAD_REQUEST, "Validation Error", error.issues || error.errors));
  }
};
