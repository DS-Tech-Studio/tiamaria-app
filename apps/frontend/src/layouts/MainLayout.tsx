import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export default function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="bg-app flex min-h-screen flex-col text-white">
      <Header
        userName={user?.fullName}
        showUsersLink={user?.role === 'ADMIN'}
        onLogout={logout}
      />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 pb-8 pt-28">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
