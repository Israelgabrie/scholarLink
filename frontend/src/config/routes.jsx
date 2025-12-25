import AdminLayout from "../layouts/adminLayout";
import ResetPassword from "../pages/changePassword/changePassword";
import ForgotPassword from "../pages/forgotPassword/forgotPassword";
import Otp from "../pages/otp/otp";
import SignIn from "../pages/signIn/signIn";
import SignUp from "../pages/signUp/signUp";

export const appRoutes = [
  {path:"/sign-in",element:<SignIn/>},
  {path:"/sign-up",element:<SignUp/>},
  {path:"/otp",element:<Otp/>},
  {path:"/forgot-password",element:<ForgotPassword/>},
  {path:"/admin",element:<AdminLayout/>},
  {path:"/reset-password",element:<ResetPassword/>}
];


