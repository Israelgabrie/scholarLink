import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { Toaster } from "react-hot-toast";
import { appRoutes } from "./config/routes.jsx";
import { toastConfig } from "./config/toastConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "./contexts/userContext.jsx";

const router = createBrowserRouter(appRoutes);
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Toaster
          position="top-left"
          reverseOrder={false}
          toastOptions={toastConfig}
        />
        <RouterProvider router={router} />
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;