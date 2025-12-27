import axios from "axios";

export const backendLocation = "http://localhost:5000";

export const routes = {
  signUp: "auth/sign-up",
  signIn: "auth/sign-in",
  checkOtp: "auth/check-otp",
  resendOtp: "auth/resend-otp",
  checkMail: "auth/check-mail",
  resetPassword: "auth/reset-password",
  fetchEnum: "enum/fetch-enum",

  startPayment: "paystack/pay",
  getTransaction: "paystack/transaction",
  getUserTransaction: "paystack/user-transaction",

  addCourse: "course/create-course",
  getCourse: "course/get-courses",
  deleteCourse: "course/delete-course",
  editCourse: "course/edit-course",
};

// ✅ Axios instance
export const axiosInstance = axios.create({
  baseURL: backendLocation,
  withCredentials: true, // always send cookies
});
