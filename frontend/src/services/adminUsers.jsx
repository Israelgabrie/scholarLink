import { routes, axiosInstance } from "../config/api.jsx";

export async function fetchAdminUsers(payLoad) {
  try {
    const response = await axiosInstance.post(routes.adminUsers, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}

export async function fetchTeacgerAndCourses(payLoad) {
  try {
    const response = await axiosInstance.post(routes.teacherAndCourses, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}

