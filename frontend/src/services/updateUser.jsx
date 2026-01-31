import { routes, axiosInstance } from "../config/api.jsx";

export async function updateAdminUser(payLoad) {
  try {
    const response = await axiosInstance.post(routes.updateAdminUser, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}

export async function updateTeacherUser(payLoad) {
  try {
    const response = await axiosInstance.post(routes.updateTeacherUser, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}

