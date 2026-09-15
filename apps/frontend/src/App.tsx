import logoImg from './assets/logo.png'; // Asegúrate de colocar la imagen del logo en src/assets/

export default function App() {
  return (
    <div className="min-h-screen bg-profundo text-white font-sans relative overflow-hidden flex flex-col items-center">
      {/* Fondo con resplandor suave al centro */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-guinda/30 via-profundo to-profundo pointer-events-none" />

      {/* Header / Navbar superior */}
      <header className="w-full max-w-6xl mx-auto p-6 flex justify-between items-center z-10">
        <div className="w-10" /> {/* Espaciador para centrar la barra */}

        {/* Cápsula de navegación flotante */}
        <nav className="flex items-center gap-6 px-6 py-2 rounded-full border border-rojizo/50 bg-profundo/80 backdrop-blur-md shadow-lg">
          <a href="#ordenes" className="text-caramelo hover:text-white transition-colors text-sm font-medium">
            Órdenes
          </a>
          <a href="#usuarios" className="text-caramelo hover:text-white transition-colors text-sm font-medium">
            Usuarios
          </a>

          {/* Logo central */}
          <a href="#" className="flex items-center justify-center">
            <img src={logoImg} alt="Tía Mari Logo" className="w-10 h-10 rounded-full object-cover border border-rojizo" />
          </a>

          <a href="#clientes" className="text-caramelo hover:text-white transition-colors text-sm font-medium">
            Clientes
          </a>
          <a href="#productos" className="text-caramelo hover:text-white transition-colors text-sm font-medium">
            Productos
          </a>
        </nav>

        {/* Botón de notificación con badge */}
        <button className="relative p-2 rounded-full border border-rojizo/40 bg-profundo hover:bg-guinda/30 transition-colors">
          <svg className="w-5 h-5 text-caramelo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-rojo rounded-full" />
        </button>
      </header>

      {/* Hero Central */}
      <main className="flex-1 flex flex-col items-center justify-center z-10 text-center px-4 -mt-12">
        <h1 className="font-serif text-7xl md:text-8xl font-bold tracking-tight text-white mb-2 drop-shadow-md">
          Tía Mari
        </h1>
        <p className="font-serif italic text-2xl md:text-3xl text-caramelo tracking-wide">
          Artesanal
        </p>
      </main>

      {/* Botón flotante de ayuda / ? */}
      <div className="absolute bottom-6 right-6 z-10">
        <button className="w-8 h-8 rounded-full border border-rojizo/50 text-xs text-gray-400 flex items-center justify-center hover:text-white transition-colors">
          ?
        </button>
      </div>
    </div>
  );
}