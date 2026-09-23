import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export default function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen w-full flex-col justify-between overflow-hidden text-white">
      <Header
        userName={user?.fullName}
        showUsersLink={user?.role === 'ADMIN'}
        onLogout={logout}
      />
      
      {/* El main toma el espacio exacto entre Header y Footer sin empujar la pantalla */}
      <main className="flex-1 overflow-y-auto pt-24 pb-4">
        <div className="mx-auto h-full w-full max-w-7xl px-6 flex flex-col">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}