import { routes, axiosInstance } from "../config/api.jsx";

export async function startPayment(payLoad) {
  try {
    const response = await axiosInstance.post(routes.startPayment, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}

export async function getTransaction(payLoad) {
  try {
    const response = await axiosInstance.post(routes.getTransaction, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}


export async function getUserTransaction(payLoad) {
  try {
    const response = await axiosInstance.post(routes.getUserTransaction, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}
