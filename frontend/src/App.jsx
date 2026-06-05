import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <h1 className="text-2xl text-[#2C2C2C] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              Something went wrong
            </h1>
            <p className="text-sm text-[#2C2C2C]/60 mb-6">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.href = '/admin'}
              className="px-6 py-2 bg-[#8B5E3C] text-white rounded-lg hover:bg-[#8B5E3C]/90 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
    <ErrorBoundary>
      <LanguageProvider>
        <AdminProvider>
          <CartProvider>
            <RouterProvider router={routers} />
          </CartProvider>
        </AdminProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
