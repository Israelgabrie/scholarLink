// services/otpApi.jsx
import axios from "axios";
import { backendLocation, routes } from "../config/api.jsx";

/**
 * Send OTP to user
 * @param {Object} payLoad - { email }
 */
export async function sendOtp(payLoad) {
  try {
    const response = await axios.post(`${backendLocation}/${routes.resendOtp}`, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}

/**
 * Validate OTP for user
 * @param {Object} payLoad - { email, otpCode }
 */
export async function validateOtp(payLoad) {
  try {
    const response = await axios.post(`${backendLocation}/${routes.checkOtp}`, payLoad);
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
}
