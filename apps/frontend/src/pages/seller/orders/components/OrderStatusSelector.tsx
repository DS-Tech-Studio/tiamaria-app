import type { Role } from '../../../../types/auth';
import { Dropdown } from '../../../../components/ui/Dropdown';
import { ORDER_STATUS_OPTIONS, type OrderStatus } from '../../../../types/order';

interface OrderStatusSelectorProps {
  status: OrderStatus;
  userRole: Role;
  onChange: (status: OrderStatus) => void;
  disabled?: boolean;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDIENTE: 'border-amber-300/25 bg-amber-400/10 text-amber-100',
  EN_PREPARACION: 'border-sky-300/25 bg-sky-400/10 text-sky-100',
  ENTREGADO: 'border-emerald-300/25 bg-emerald-400/10 text-emerald-100',
  CANCELADO: 'border-red-300/25 bg-red-400/10 text-red-100',
};

export function OrderStatusSelector({ status, userRole, onChange, disabled = false }: OrderStatusSelectorProps) {
  const statusLabel = ORDER_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;

  if (userRole !== 'ADMIN') {
    return (
      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold ${STATUS_STYLES[status]}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
        {statusLabel}
      </span>
    );
  }

  return (
    <div className={`inline-flex min-w-0 items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold ${STATUS_STYLES[status]}`}>
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
      <Dropdown
        value={status}
        onChange={(value) => onChange(value as OrderStatus)}
        options={ORDER_STATUS_OPTIONS.filter((option): option is { label: string; value: OrderStatus } => option.value !== '')}
        disabled={disabled}
        ariaLabel="Estado de la orden"
        triggerClassName="min-w-0 bg-transparent text-[11px] font-bold outline-none"
        menuClassName="min-w-40"
      />
    </div>
  );
}
