import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { label: 'Inicio', to: '/home' },
  { label: 'Órdenes', to: '/ordenes' },
  { label: 'Clientes', to: '/clientes' },
  { label: 'Productos', to: '/productos' },
  { label: 'Usuarios', to: '/usuarios' },
];

export default function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-profundo text-white">
      <header className="border-b border-rojizo/50 bg-guinda/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <nav className="flex flex-wrap gap-4">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'text-white' : 'text-caramelo hover:text-white'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm text-caramelo">{user?.fullName}</span>
            <button type="button" onClick={logout} className="text-sm text-caramelo hover:text-white">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
