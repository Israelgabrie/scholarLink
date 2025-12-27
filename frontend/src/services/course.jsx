import { routes, axiosInstance } from "../config/api.jsx";

export async function createCourse(payLoad) {
  try {
    const response = await axiosInstance.post(routes.addCourse, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}


export async function fetchCourse(payLoad) {
  try {
    const response = await axiosInstance.post(routes.getCourse, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}

export async function deleteCourse(payLoad) {
  try {
    const response = await axiosInstance.post(routes.deleteCourse, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}

export async function editCourse(payLoad) {
  try {
    const response = await axiosInstance.post(routes.editCourse, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}
