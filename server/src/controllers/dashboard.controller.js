import { StatusCodes } from "http-status-codes";
import * as dashboardService from "../services/dashboard.service.js";
import ApiResponse from "../utils/apiResponse.util.js";

export const getDashboardActivity = async (req, res, next) => {
  try {
    const { category = "all", limit = 8 } = req.query;
    const data = await dashboardService.getRecentActivity(
      req.user._id,
      category,
      limit
    );

    return res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Dashboard activity fetched successfully", data));
  } catch (error) {
    next(error);
  }
};
