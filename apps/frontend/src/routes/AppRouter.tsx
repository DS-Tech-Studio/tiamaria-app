import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { RoleGuard } from '../components/RoleGuard';
import MainLayout from '../layouts/MainLayout';
import UsersPage from '../pages/admin/UsersPage';
import LoginPage from '../pages/auth/LoginPage';
import ClientsPage from '../pages/seller/clients/ClientsPage';
import HomePage from '../pages/seller/home/HomePage';
import OrdersPage from '../pages/seller/orders/OrdersPage';
import ProductsPage from '../pages/seller/products/ProductsPage';

export const AppRouter = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<MainLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/ordenes" element={<OrdersPage />} />
        <Route path="/clientes" element={<ClientsPage />} />
        <Route path="/productos" element={<ProductsPage />} />

        <Route element={<RoleGuard allowedRoles={['ADMIN']}><Outlet /></RoleGuard>}>
          <Route path="/usuarios" element={<UsersPage />} />
        </Route>
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/home" replace />} />
  </Routes>
);
