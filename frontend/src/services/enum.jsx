import { routes, axiosInstance } from "../config/api.jsx";

export async function fetchEnum(payLoad) {
  try {
    const response = await axiosInstance.get(routes.fetchEnum, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}
