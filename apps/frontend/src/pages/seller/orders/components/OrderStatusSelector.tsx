import type { Role } from '../../../../types/auth';
import { ORDER_STATUS_OPTIONS, type OrderStatus } from '../../../../types/order';

interface OrderStatusSelectorProps {
  status: OrderStatus;
  userRole: Role;
  onChange: (status: OrderStatus) => void;
  disabled?: boolean;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDIENTE: 'border-amber-400/25 bg-amber-500/10 text-amber-200',
  EN_PREPARACION: 'border-sky-400/25 bg-sky-500/10 text-sky-200',
  ENTREGADO: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200',
  CANCELADO: 'border-red-400/25 bg-red-500/10 text-red-200',
};

export function OrderStatusSelector({ status, userRole, onChange, disabled = false }: OrderStatusSelectorProps) {
  if (userRole !== 'ADMIN') {
    return (
      <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold ${STATUS_STYLES[status]}`}>
        {ORDER_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status}
      </span>
    );
  }

  return (
    <label className="sr-only">
      Estado de la orden
      <select
        value={status}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as OrderStatus)}
        className={`not-sr-only rounded-lg border bg-[#240103] px-2.5 py-1.5 text-xs font-semibold outline-none transition focus:border-caramelo disabled:cursor-wait disabled:opacity-50 ${STATUS_STYLES[status]}`}
      >
        {ORDER_STATUS_OPTIONS.filter((option): option is { label: string; value: OrderStatus } => option.value !== '').map((option) => (
          <option key={option.value} value={option.value} className="bg-[#1a070b] text-white">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}