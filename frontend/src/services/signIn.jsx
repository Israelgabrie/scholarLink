import axios from "axios";
import { backendLocation, routes } from "../config/api.jsx";

export async function signInUser(payLoad) {
  try {
    const response = await axios.post(
      `${backendLocation}/${routes.signIn}`,
      payLoad,
      {
        withCredentials: true, 
      }
    );

    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}
