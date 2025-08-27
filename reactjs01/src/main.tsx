import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/global.css";


import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";


import LoginPage from "./pages/login.tsx";
import RegisterPage from "./pages/register.tsx";
import UserPage from "./pages/user.tsx";
import HomePage from "./pages/home.tsx";
import App from "./App";
import { AuthWrapper } from "./components/context/auth.context";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // App layout with Header & Outlet
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "user", element: <UserPage /> },
    ],
  },
]);

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <AuthWrapper>
        <RouterProvider router={router} />
      </AuthWrapper>
    </React.StrictMode>
  );
// ...existing code...
}