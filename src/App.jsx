import { Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import AdminAppearance from './pages/admin/Appearance';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Invoice from './pages/Invoice';
import TrackOrders from './pages/TrackOrders';

import Catalog from './pages/Catalog';
import AdminOrders from './pages/admin/Orders';
import AdminPaymentSettings from './pages/admin/PaymentSettings';
import AdminUsers from './pages/admin/Users';
import Login from './pages/Login';
import Profile from './pages/Profile';
import CenterShop from './pages/CenterShop';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/products" element={<Catalog />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/invoice/:id" element={<Invoice />} />
        <Route path="/orders" element={<TrackOrders />} />
        <Route path="/about" element={<div className="p-20 text-center">About Page Coming Soon</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/center" element={<CenterShop />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="settings" element={<AdminAppearance />} />
        <Route path="payment-settings" element={<AdminPaymentSettings />} />

        <Route path="orders" element={<AdminOrders />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>
    </Routes>
  );
}

export default App;
