import axios from "axios";
import { backendLocation, routes } from "../config/api.jsx";

export async function resetPassword(payLoad) {
  try {
    const response = await axios.post(`${backendLocation}/${routes.resetPassword}`, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}
