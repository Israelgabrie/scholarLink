import { routes, axiosInstance } from "../config/api.jsx";

export async function createInvite(payLoad) {
  try {
    const response = await axiosInstance.post(routes.createInvite, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}


export async function getInvites(payLoad) {
  try {
    const response = await axiosInstance.post(routes.getInvites, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}

export async function deleteInvite(payLoad) {
  try {
    const response = await axiosInstance.post(routes.deleteInvite, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}

export async function editInvite(payLoad) {
  try {
    const response = await axiosInstance.post(routes.editInvite, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}

export async function addUser(payLoad) {
  try {
    const response = await axiosInstance.post(routes.addUser, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}
