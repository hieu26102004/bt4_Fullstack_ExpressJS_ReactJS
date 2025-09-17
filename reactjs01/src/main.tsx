import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/global.css";


import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";


import LoginPage from "./pages/login.tsx";
import RegisterPage from "./pages/register.tsx";
import UserPage from "./pages/user.tsx";
import HomePage from "./pages/home.tsx";
import CategoryPage from "./pages/category.tsx";
import SearchPage from "./pages/search.tsx";
import FavoritesPage from "./pages/favorites.tsx";
import ViewedProductsPage from "./pages/viewed-products.tsx";
import ProductDetailPage from "./pages/product-detail.tsx";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
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
  { path: "search", element: <SearchPage /> },
  { path: "products", element: <Navigate to="/search" replace /> },
  { path: "products/:productId", element: <ProductDetailPage /> },
  { path: "favorites", element: <FavoritesPage /> },
  { path: "viewed-products", element: <ViewedProductsPage /> },
  { path: "category/:categorySlug", element: <CategoryPage /> },
  { path: "forgot-password", element: <ForgotPassword /> },
  { path: "reset-password", element: <ResetPassword /> },
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