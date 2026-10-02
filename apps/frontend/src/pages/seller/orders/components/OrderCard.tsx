import { useEffect, useState } from 'react';
import { axiosClient } from '../../../../api/axiosClient';
import type { Role } from '../../../../types/auth';
import type { Order, OrderStatus } from '../../../../types/order';
import { formatCurrency } from '../../../../types/order';
import { PencilIcon } from '../../../../components/ui/icons';
import { TablaItemPedidos, TotalLabel } from './OrderTableAndTotal';
import { OrderStatusSelector } from './OrderStatusSelector';

interface OrderCardProps {
  order: Order;
  userRole: Role;
  isUpdating: boolean;
  onUpdateStatus: (order: Order, status: OrderStatus) => void;
  onOpenNotes: (notes: string) => void;
  onEdit: () => void;
}

export function OrderCard({ order, userRole, isUpdating, onUpdateStatus, onOpenNotes, onEdit }: OrderCardProps) {
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isReceiptLoading, setIsReceiptLoading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState('');
  const clientName = order.client?.business_name || order.client?.contact_name || 'Cliente';
  const createdAt = new Date(order.created_at);
  const canEditOrder = order.status === 'PENDIENTE'
    || (order.status === 'EN_PREPARACION' && userRole === 'ADMIN');

  useEffect(() => () => {
    if (receiptUrl) URL.revokeObjectURL(receiptUrl);
  }, [receiptUrl]);

  const handleViewReceipt = async () => {
    setIsReceiptOpen(true);
    setReceiptError('');
    if (receiptUrl) return;
    if (!order.receipt_image_url) {
      setReceiptError('Este pedido no tiene un comprobante disponible.');
      return;
    }

    setIsReceiptLoading(true);
    try {
      const response = await axiosClient.get<Blob>(order.receipt_image_url, {
        responseType: 'blob',
      });
      setReceiptUrl(URL.createObjectURL(response.data));
    } catch {
      setReceiptError('No fue posible cargar el comprobante.');
    } finally {
      setIsReceiptLoading(false);
    }
  };

  return (
    <article className="flex min-w-0 flex-col gap-3 rounded-xl border border-white/10 bg-[#1a070b]/90 p-4 transition hover:border-caramelo/25 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 pb-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-caramelo">{order.code}</p>
          <h3 className="mt-1 truncate text-sm font-bold text-white">{clientName}</h3>
          <p className="mt-1 text-xs text-white/45">
            {Number.isNaN(createdAt.getTime()) ? '' : createdAt.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
          <p className="mt-1 text-xs text-white/55">
            {order.payment_method === 'TRANSFERENCIA' ? 'Transferencia' : 'Efectivo'}
            {order.discount_percent > 0 && ` · Descuento ${order.discount_percent}% (${formatCurrency(order.discount_amount)})`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <OrderStatusSelector
            status={order.status}
            userRole={userRole}
            disabled={isUpdating}
            onChange={(status) => onUpdateStatus(order, status)}
          />
          {canEditOrder && (
            <button
              type="button"
              onClick={onEdit}
              disabled={isUpdating}
              aria-label={`Editar orden ${order.code}`}
              title="Editar orden"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-caramelo/30 bg-caramelo/5 text-caramelo transition hover:border-caramelo hover:bg-caramelo/10 disabled:cursor-wait disabled:opacity-50"
            >
              <PencilIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </header>

      <TablaItemPedidos items={order.items ?? []} />

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3">
        {order.notes ? (
          <button type="button" onClick={() => onOpenNotes(order.notes ?? '')} className="text-xs font-medium text-caramelo underline decoration-caramelo/40 underline-offset-4 hover:text-white">
            Ver observaciones
          </button>
        ) : <span className="text-xs text-white/35">Sin observaciones</span>}
        {order.payment_method === 'TRANSFERENCIA' && (
          <button
            type="button"
            onClick={() => void handleViewReceipt()}
            className="text-xs font-medium text-caramelo underline decoration-caramelo/40 underline-offset-4 hover:text-white"
          >
            Ver comprobante
          </button>
        )}
        <div className="ml-auto min-w-36">
          <TotalLabel total={order.total_amount || formatCurrency(0)} />
        </div>
      </footer>

      {isReceiptOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          role="presentation"
          onMouseDown={() => setIsReceiptOpen(false)}
        >
          <section
            className="w-full max-w-3xl rounded-xl border border-white/10 bg-[#26080e] p-4 shadow-2xl sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`receipt-title-${order.id}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="mb-4 flex items-center justify-between gap-4 border-b border-white/10 pb-3">
              <h2 id={`receipt-title-${order.id}`} className="font-serif text-lg font-bold text-white">
                Comprobante · {order.code}
              </h2>
              <button
                type="button"
                onClick={() => setIsReceiptOpen(false)}
                aria-label="Cerrar comprobante"
                className="flex h-8 w-8 items-center justify-center rounded-md text-xl text-white/60 hover:bg-white/10 hover:text-white"
              >
                ×
              </button>
            </header>
            {isReceiptLoading && <p className="py-12 text-center text-sm text-white/60">Cargando comprobante...</p>}
            {receiptError && <p className="py-12 text-center text-sm text-red-200" role="alert">{receiptError}</p>}
            {receiptUrl && !isReceiptLoading && (
              <img
                src={receiptUrl}
                alt={`Comprobante de transferencia del pedido ${order.code}`}
                className="mx-auto max-h-[75vh] max-w-full rounded-md object-contain"
              />
            )}
          </section>
        </div>
      )}
    </article>
  );
}