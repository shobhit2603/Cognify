import { axiosInstance } from "../../../lib/axios";

export const getDashboardActivity = async (category = "all", limit = 8) => {
  const response = await axiosInstance.get("/dashboard/activity", {
    params: { category, limit },
  });
  return response.data.data;
};
