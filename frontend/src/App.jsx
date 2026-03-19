import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from './Layouts/MainLayout';
import AdminLayout from './Layouts/AdminLayout';
import LandingPage from './Pages/Home/LandingPage';
import Shop from './Pages/Shop/Shop';
import About from './Pages/About/About';
import Contact from './Pages/Contact/Contact';
import Cart from './Pages/Cart/Cart';
import ProductDetails from './Pages/ProductDetails/ProductDetails';
import Checkout from './Pages/Checkout/Checkout';
import OrderSuccess from './Pages/OrderSuccess/OrderSuccess';
import NotFound from './Pages/NotFound/NotFound';
import AdminLogin from './Pages/Admin/AdminLogin';

// Admin pages
import Dashboard from './Pages/Admin/Dashboard';
import AdminOrders from './Pages/Admin/AdminOrders';
import AdminProducts from './Pages/Admin/AdminProducts';
import AdminCategories from './Pages/Admin/AdminCategories';
import AdminStaff from './Pages/Admin/AdminStaff';
import AdminReviews from './Pages/Admin/AdminReviews';
import AdminSettings from './Pages/Admin/AdminSettings';

import { LanguageProvider } from './Components/Context/LanguageContext';
import { AdminProvider } from './Components/Context/AdminContext';
import { CartProvider } from './Components/Context/Cartcontext';
import AdminProtectedRoute from './Routes/AdminProtectedRoute';

// Injected at build time via VITE_API_URL build arg in docker-compose.yml
export const BASE_URL = import.meta.env.VITE_API_URL || 'https://marvel-steel-backend.onrender.com';

const routers = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'shop', element: <Shop /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
      { path: 'cart', element: <Cart /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'order-success', element: <OrderSuccess /> },
      { path: 'product/:id', element: <ProductDetails /> },
    ],
  },
  {
    path: '/admin-login',
    element: <AdminLogin />,
  },
  {
    path: '/admin',
    element: (
      <AdminProtectedRoute>
        <AdminLayout />
      </AdminProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'orders', element: <AdminOrders /> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'staff', element: <AdminStaff /> },
      { path: 'reviews', element: <AdminReviews /> },
      { path: 'settings', element: <AdminSettings /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

function App() {
  return (
    <LanguageProvider>
      <AdminProvider>
        {/* CartProvider wraps the entire router so all pages share cart state */}
        <CartProvider>
          <RouterProvider router={routers} />
        </CartProvider>
      </AdminProvider>
    </LanguageProvider>
  );
}

export default App;