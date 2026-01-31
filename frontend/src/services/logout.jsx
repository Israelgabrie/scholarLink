import { routes, axiosInstance } from "../config/api.jsx";

export async function logOutUser(payLoad) {
  try {
    const response = await axiosInstance.post(routes.logout, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}
