import { NavLink } from 'react-router-dom';
import logoTiamari from '../../assets/logo.png';

interface HeaderProps {
  userName?: string;
  showUsersLink: boolean;
  onLogout: () => void;
}

const navigation = [
  { label: 'Órdenes', to: '/ordenes' },
  { label: 'Clientes', to: '/clientes' },
  { label: 'Productos', to: '/productos' },
];

const linkStyles = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-full px-1.5 py-1 text-[11px] font-medium select-none transition-all duration-200 active:scale-95 sm:px-3 sm:py-1.5 sm:text-sm ${
    isActive
      ? 'bg-borgoña text-white shadow-inner'
      : 'text-caramelo hover:bg-borgoña hover:text-white'
  }`;

export default function Header({ userName, showUsersLink, onLogout }: HeaderProps) {
  return (
    <>
      <header className="fixed left-1/2 top-14 z-50 w-fit max-w-[calc(100%-1rem)] -translate-x-1/2 sm:top-3 sm:max-w-5xl">
        <nav className="flex items-center justify-center gap-0 rounded-full border border-rojizo/50 bg-profundo/95 px-1 py-0.5 shadow-2xl backdrop-blur-md sm:gap-1.5 sm:px-2 sm:py-1">
          <NavLink to="/ordenes" className={linkStyles}>
            Órdenes
          </NavLink>

          {showUsersLink && (
            <NavLink to="/usuarios" className={linkStyles}>
              Usuarios
            </NavLink>
          )}

          <NavLink
            to="/home"
            end
            aria-label="Ir al inicio"
            className="group flex shrink-0 items-center justify-center rounded-full p-1 transition-transform duration-300 active:scale-90"
          >
            <img
              src={logoTiamari}
              alt="Tiamari"
              className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-105 sm:h-12 sm:w-12"
            />
          </NavLink>

          {navigation.slice(1, 3).map((item) => (
            <NavLink key={item.to} to={item.to} className={linkStyles}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="fixed left-2 top-2 z-50 flex max-w-[calc(100vw-1rem)] items-center gap-1.5 rounded-full border border-rojizo/40 bg-guinda/90 px-2 py-1 text-[11px] shadow-lg backdrop-blur-md sm:left-3 sm:top-3 sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm">
        <span className="max-w-32 truncate text-caramelo sm:max-w-40">{userName}</span>
        <button
          type="button"
          onClick={onLogout}
          className="whitespace-nowrap text-caramelo transition-colors hover:text-white active:scale-95"
        >
          Salir
        </button>
      </div>
    </>
  );
}