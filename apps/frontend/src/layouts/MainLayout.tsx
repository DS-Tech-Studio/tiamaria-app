import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';

export default function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="bg-app min-h-screen text-white">
      <Header
        userName={user?.fullName}
        showUsersLink={user?.role === 'ADMIN'}
        onLogout={logout}
      />
      <main className="mx-auto max-w-7xl px-6 pb-8 pt-28">
        <Outlet />
      </main>
    </div>
  );
}
