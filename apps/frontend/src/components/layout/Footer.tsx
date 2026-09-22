import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-[#240103] text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-4 md:flex-row">
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <span className="font-serif text-base font-bold tracking-wider text-[#D57642]">
            Tía María Artesanal
          </span>
          <p className="mt-1 text-xs text-gray-400">
            © {new Date().getFullYear()} Todos los derechos reservados.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium md:ml-auto md:justify-end">
          <span className="text-xs text-gray-400">Desarrollado por Daniel Galvis</span>

          <a
            href="https://tu-portfolio-link.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-gray-300 transition-colors hover:text-[#D57642]"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5 transition-transform group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
            <span>Portafolio</span>
          </a>

          <a
            href="https://github.com/DanielEstebangc"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-gray-300 transition-colors hover:text-[#D57642]"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5 transition-transform group-hover:scale-110"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span>GitHub</span>
          </a>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#500824] px-3 py-1 text-xs text-gray-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;