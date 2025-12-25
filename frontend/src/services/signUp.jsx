import axios from "axios";
import { backendLocation, routes } from "../config/api.jsx";

export async function signUpUser(payLoad) {
  try {
    const response = await axios.post(`${backendLocation}/${routes.signUp}`, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}
