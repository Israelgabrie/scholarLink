import AdminLayout from "../layouts/adminLayout";
import AllTransactions from "../pages/admin/allTransactions/allTransactions";
import CoursesPage from "../pages/admin/course/course";
import AdminPaymentPage from "../pages/admin/payment/payment";
import SettingsPage from "../pages/admin/settings/settings";
import Transaction from "../pages/admin/transactions/transaction";
import ResetPassword from "../pages/changePassword/changePassword";
import ForgotPassword from "../pages/forgotPassword/forgotPassword";
import Otp from "../pages/otp/otp";
import SignIn from "../pages/signIn/signIn";
import SignUp from "../pages/signUp/signUp";

export const appRoutes = [
  { path: "/sign-in", element: <SignIn /> },
  { path: "/sign-up", element: <SignUp /> },
  { path: "/otp", element: <Otp /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { 
    path: "/admin", 
    element: <AdminLayout />, 
    children: [
      { path: "payment", element: <AdminPaymentPage /> },
      { path: "transaction", element: <Transaction /> },
      { path: "all-transactions", element: <AllTransactions /> },
      { path: "course", element: <CoursesPage /> },
      { path: "settings", element: <SettingsPage /> } 
    ] 
  },
  { path: "/reset-password", element: <ResetPassword /> }
];
