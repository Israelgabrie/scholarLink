import { routes, axiosInstance } from "../config/api.jsx";

export async function fetchAdminLogs(payLoad) {
  try {
    const response = await axiosInstance.post(routes.adminGetLogs, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}