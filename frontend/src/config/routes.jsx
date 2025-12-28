import AdminLayout from "../layouts/adminLayout";
import AllTransactions from "../pages/admin/allTransactions/allTransactions";
import CoursesPage from "../pages/admin/course/course";
import InvitesPage from "../pages/admin/invites/invites";
import InviteUsersPage from "../pages/admin/inviteUsers/inviteUsers";
import AdminPaymentPage from "../pages/admin/payment/payment";
import SettingsPage from "../pages/admin/settings/settings";
import Transaction from "../pages/admin/transactions/transaction";
import ResetPassword from "../pages/changePassword/changePassword";
import CreateAccount from "../pages/createAccount/createAccount";
import ForgotPassword from "../pages/forgotPassword/forgotPassword";
import Otp from "../pages/otp/otp";
import SignIn from "../pages/signIn/signIn";
import SignUp from "../pages/signUp/signUp";
import AdminLogs from './../pages/admin/adminLogs/adminLogs';
import TeacherLayout from './../layouts/teacherLayout';

export const appRoutes = [
  { path: "/sign-in", element: <SignIn /> },
  { path: "/sign-up", element: <SignUp /> },
  { path: "/otp", element: <Otp /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/create-account", element: <CreateAccount /> },
  { 
    path: "/admin", 
    element: <AdminLayout />, 
    children: [
      { path: "payment", element: <AdminPaymentPage /> },
      { path: "transaction", element: <Transaction /> },
      { path: "all-transactions", element: <AllTransactions /> },
      { path: "course", element: <CoursesPage /> },
      { path: "settings", element: <SettingsPage /> } ,
      { path: "invite-users", element: <InviteUsersPage/> },
      { path: "invites", element: <InvitesPage/> } ,
      { path: "logs", element: <AdminLogs/> } 

    ] 
  },
  { path: "/reset-password", element: <ResetPassword /> },
  {
    path:"teacher",element:<TeacherLayout/>
  }
];
