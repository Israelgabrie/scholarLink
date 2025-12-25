import axios from "axios";
import { backendLocation, routes } from "../config/api.jsx";

export async function checkMail(payLoad) {
  try {
    const response = await axios.post(`${backendLocation}/${routes.checkMail}`, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}
