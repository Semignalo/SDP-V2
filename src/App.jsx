import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import RootLayout from './layouts/RootLayout';
import AdminLayout from './layouts/AdminLayout';
import PageLoader from './components/PageLoader';

// Lazy load all pages
const Home = lazy(() => import('./pages/Home'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Catalog = lazy(() => import('./pages/Catalog'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Invoice = lazy(() => import('./pages/Invoice'));
const TrackOrders = lazy(() => import('./pages/TrackOrders'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const CenterShop = lazy(() => import('./pages/CenterShop'));
const JoinStarcenter = lazy(() => import('./pages/JoinStarcenter'));

// Lazy load admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminAppearance = lazy(() => import('./pages/admin/Appearance'));
const AdminPaymentSettings = lazy(() => import('./pages/admin/PaymentSettings'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminCommissions = lazy(() => import('./pages/admin/Commissions'));
const AdminTiers = lazy(() => import('./pages/admin/Tiers'));

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
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
          <Route path="/join-starcenter" element={<JoinStarcenter />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="settings" element={<AdminAppearance />} />
          <Route path="payment-settings" element={<AdminPaymentSettings />} />

          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="commissions" element={<AdminCommissions />} />
          <Route path="tiers" element={<AdminTiers />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
