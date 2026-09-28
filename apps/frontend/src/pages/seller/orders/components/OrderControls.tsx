import { SearchIcon } from '../../../../components/ui/icons';
import { ORDER_STATUS_OPTIONS, type OrderStatus } from '../../../../types/order';

export function TituloFormulario({ text }: { text: string }) {
  return (
    <h2 className="mb-2 border-b border-white/10 pb-2 font-serif text-xl font-bold text-white">
      {text}
    </h2>
  );
}

interface OrderControlsProps {
  search: string;
  status: OrderStatus | '';
  onSearchChange: (value: string) => void;
  onStatusChange: (value: OrderStatus | '') => void;
}

export function OrderControls({ search, status, onSearchChange, onStatusChange }: OrderControlsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
      <label className="relative block">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por código de orden..."
          aria-label="Buscar por código de orden"
          className="w-full rounded-xl border border-white/10 bg-[#1a070b]/90 py-3 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-caramelo/60"
        />
      </label>
      <label className="sr-only" htmlFor="order-status-filter">Filtrar por estado</label>
      <select
        id="order-status-filter"
        value={status}
        onChange={(event) => onStatusChange(event.target.value as OrderStatus | '')}
        className="w-full rounded-xl border border-white/10 bg-[#1a070b] px-3 py-3 text-sm text-white outline-none focus:border-caramelo/60"
      >
        {ORDER_STATUS_OPTIONS.map((option) => (
          <option key={option.value || 'all'} value={option.value} className="bg-[#1a070b]">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}