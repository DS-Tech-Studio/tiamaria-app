import type { Role } from '../../../../types/auth';
import type { Order, OrderStatus } from '../../../../types/order';
import { formatCurrency } from '../../../../types/order';
import { TablaItemPedidos, TotalLabel } from './OrderTableAndTotal';
import { OrderStatusSelector } from './OrderStatusSelector';

interface OrderCardProps {
  order: Order;
  userRole: Role;
  isUpdating: boolean;
  onUpdateStatus: (order: Order, status: OrderStatus) => void;
  onOpenNotes: (notes: string) => void;
}

export function OrderCard({ order, userRole, isUpdating, onUpdateStatus, onOpenNotes }: OrderCardProps) {
  const clientName = order.client?.business_name || order.client?.contact_name || 'Cliente';
  const createdAt = new Date(order.created_at);

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#1a070b]/90 p-4 transition hover:border-caramelo/25 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 pb-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-caramelo">{order.code}</p>
          <h3 className="mt-1 truncate text-sm font-bold text-white">{clientName}</h3>
          <p className="mt-1 text-xs text-white/45">
            {Number.isNaN(createdAt.getTime()) ? '' : createdAt.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
        <OrderStatusSelector
          status={order.status}
          userRole={userRole}
          disabled={isUpdating}
          onChange={(status) => onUpdateStatus(order, status)}
        />
      </header>

      <TablaItemPedidos items={order.items ?? []} />

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3">
        {order.notes ? (
          <button type="button" onClick={() => onOpenNotes(order.notes ?? '')} className="text-xs font-medium text-caramelo underline decoration-caramelo/40 underline-offset-4 hover:text-white">
            Ver observaciones
          </button>
        ) : <span className="text-xs text-white/35">Sin observaciones</span>}
        <div className="ml-auto min-w-36">
          <TotalLabel total={order.total_amount || formatCurrency(0)} />
        </div>
      </footer>
    </article>
  );
}