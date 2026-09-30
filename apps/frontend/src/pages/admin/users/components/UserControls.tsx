import { Dropdown } from '../../../../components/ui/Dropdown';
import { SearchIcon } from '../../../../components/ui/icons';

interface UserControlsProps {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function UserControls({ search, status, onSearchChange, onStatusChange }: UserControlsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
      <label className="relative block">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
        <input type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Buscar por nombre o correo..." aria-label="Buscar usuario por nombre o correo" className="w-full rounded-xl border border-white/10 bg-[#1a070b]/90 py-3 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-caramelo/60" />
      </label>
      <Dropdown value={status} onChange={onStatusChange} options={[{ label: 'Todos los estados', value: '' }, { label: 'Activos', value: 'active' }, { label: 'Inactivos', value: 'inactive' }]} ariaLabel="Filtrar usuarios por estado" triggerClassName="rounded-xl border border-white/10 bg-[#1a070b] px-3 py-3 text-sm text-white outline-none focus:border-caramelo/60" />
    </div>
  );
}