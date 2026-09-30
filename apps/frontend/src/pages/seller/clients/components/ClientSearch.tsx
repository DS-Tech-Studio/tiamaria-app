import { SearchIcon } from '../../../../components/ui/icons';

interface ClientSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function ClientSearch({ searchTerm, setSearchTerm }: ClientSearchProps) {
  return (
    <div className="relative">
      <span className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${searchTerm ? 'scale-110 text-caramelo drop-shadow-[0_0_8px_rgba(213,118,66,0.75)]' : 'text-white/40'}`} aria-hidden="true"><SearchIcon className={searchTerm ? 'h-5 w-5 animate-pulse' : 'h-5 w-5'} /></span>
      <input className={`w-full rounded-xl border bg-[#1a070b]/90 py-3 pl-10 pr-20 text-sm text-white outline-none transition placeholder:text-white/35 ${searchTerm ? 'border-caramelo ring-1 ring-caramelo/30' : 'border-white/10 focus:border-caramelo/60'}`} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar por nombre, negocio, teléfono o dirección..." aria-label="Buscar clientes" />
      {searchTerm && <button className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/50 hover:text-white" type="button" onClick={() => setSearchTerm('')}>Limpiar</button>}
    </div>
  );
}