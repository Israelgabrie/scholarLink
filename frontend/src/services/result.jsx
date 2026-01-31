import { routes, axiosInstance } from "../config/api.jsx";

export async function fetchUploadResultData(payLoad) {
  try {
    const response = await axiosInstance.post(
      routes.fetchUploadResultData,
      payLoad,
    );
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}

export async function uploadResult(payLoad) {
  try {
    const response = await axiosInstance.post(routes.uploadResult, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}


