import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

export { BASE_URL } from './config';

import MainLayout from "./Layouts/MainLayout";
import AdminLayout from "./Layouts/AdminLayout";

import LandingPage from "./Pages/Home/LandingPage";
import Shop from "./Pages/Shop/Shop";
import About from "./Pages/About/About";
import Contact from "./Pages/Contact/Contact";
import NotFound from "./Pages/NotFound/NotFound";
import ProductDetails from "./Pages/ProductDetails/ProductDetails";

import Cart from "./Pages/Cart/Cart";
import Checkout from "./Pages/Checkout/Checkout";
import OrderSuccess from "./Pages/OrderSuccess/OrderSuccess";

import Dashboard from "./Pages/Admin/Dashboard";
import AdminOrders from "./Pages/Admin/AdminOrders";
import AdminProducts from "./Pages/Admin/AdminProducts";
import AdminCategories from "./Pages/Admin/AdminCategories";
import AdminStaff from "./Pages/Admin/AdminStaff";
import AdminReviews from "./Pages/Admin/AdminReviews";
import AdminSettings from "./Pages/Admin/AdminSettings";
import AdminLogin from "./Pages/Admin/AdminLogin";

import AdminProtectedRoute from "./Routes/AdminProtectedRoute";

import { LanguageProvider } from "./Components/Context/LanguageContext";
import { AdminProvider } from "./Components/Context/AdminContext";
import { CartProvider } from "./Components/Context/Cartcontext";

const routers = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "home", element: <LandingPage /> },

      { path: "shop", element: <Shop /> },
      { path: "product/:id", element: <ProductDetails /> },
      { path: "cart", element: <Cart /> },
      { path: "checkout", element: <Checkout /> },
      { path: "contact", element: <Contact /> },
      { path: "about", element: <About /> },
      { path: "order-success", element: <OrderSuccess /> },
    ],
  },

  {
    path: "/admin/login",
    element: <AdminLogin />,
  },

  {
    path: "/admin",
    element: (
      <AdminProtectedRoute>
        <AdminLayout />
      </AdminProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "orders", element: <AdminOrders /> },
      { path: "products", element: <AdminProducts /> },
      { path: "categories", element: <AdminCategories /> },
      { path: "staff", element: <AdminStaff /> },
      { path: "reviews", element: <AdminReviews /> },
      { path: "settings", element: <AdminSettings /> },
    ],
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return (
    <LanguageProvider>
      <AdminProvider>
        <CartProvider>
          <RouterProvider router={routers} />
        </CartProvider>
      </AdminProvider>
    </LanguageProvider>
  );
}

export default App;
