import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const pathname = useLocation().pathname;
  const isProductsPage = pathname === '/productos';
  const isInventoryPage = pathname === '/inventario';
  const isOrdersPage = pathname === '/ordenes';

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden text-white">
      <Header
        userName={user?.fullName ?? user?.email ?? 'Usuario'}
        showUsersLink={user?.role === 'ADMIN'}
        onLogout={logout}
      />

      <main className={`flex min-h-0 flex-1 min-w-0 overflow-x-hidden overflow-y-auto pt-32 pb-4 sm:pt-24 ${isInventoryPage || isOrdersPage ? 'lg:overflow-y-auto' : 'lg:overflow-hidden'} ${isProductsPage ? 'scrollbar-hidden' : ''}`}>
        <div className={`mx-auto flex min-h-full min-w-0 w-full ${isOrdersPage ? 'max-w-[96rem]' : 'max-w-7xl'} flex-col px-6 ${isInventoryPage || isOrdersPage ? 'lg:h-auto' : 'lg:h-full'}`}>
          <Outlet />
        </div>
      </main>

      {!isOrdersPage && <Footer />}
    </div>
  );
}