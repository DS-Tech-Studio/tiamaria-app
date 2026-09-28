import { useEffect, useMemo, useState } from 'react';
import { axiosClient } from '../../../api/axiosClient';
import { NotesModal } from '../../../components/ui/NotesModal';
import { useAuth } from '../../../context/AuthContext';
import type { Order, OrderStatus } from '../../../types/order';
import { OrderCard } from './components/OrderCard';
import { OrderControls } from './components/OrderControls';
import { OrderForm } from './components/OrderForm';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [selectedNotes, setSelectedNotes] = useState<string | null>(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await axiosClient.get<Order[]>('/orders');
        setOrders(response.data);
      } catch {
        setError('No fue posible cargar las órdenes registradas.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesCode = !normalizedSearch || order.code.toLowerCase().includes(normalizedSearch);
      const matchesStatus = !statusFilter || order.status === statusFilter;
      return matchesCode && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const handleOrderCreated = (order: Order) => {
    setOrders((current) => [order, ...current]);
    setError('');
  };

  const handleUpdateStatus = async (order: Order, status: OrderStatus) => {
    setUpdatingOrderId(order.id);
    setError('');
    try {
      const response = await axiosClient.patch<Order>(`/orders/${order.id}/status`, { status });
      setOrders((current) => current.map((currentOrder) => currentOrder.id === order.id ? response.data : currentOrder));
    } catch {
      setError(`No fue posible actualizar el estado de ${order.code}.`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-8 pb-2 lg:min-h-0 lg:overflow-hidden">
      <header className="border-b border-white/10 pb-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-caramelo">Gestión de ventas</p>
        <h1 className="font-serif text-3xl font-bold text-white md:text-4xl">Órdenes</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/60">Registra pedidos y consulta su avance.</p>
      </header>

      <div className="grid min-h-0 flex-1 items-stretch gap-8 lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)]">
        <section className="min-h-0 rounded-xl border border-white/10 bg-[#1a070b]/90 p-3 shadow-xl lg:col-span-5 lg:overflow-y-auto lg:scrollbar-hidden">
          <OrderForm onOrderCreated={handleOrderCreated} />
        </section>

        <section className="flex min-h-0 flex-col gap-5 lg:col-span-7 lg:h-full lg:overflow-hidden">
          <OrderControls search={search} status={statusFilter} onSearchChange={setSearch} onStatusChange={setStatusFilter} />

          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hidden">
            <div className="space-y-4">
              {error && <p className="rounded-xl border border-red-400/30 bg-red-950/30 p-4 text-sm text-red-200" role="alert">{error}</p>}
              {isLoading && <p className="py-10 text-center text-sm text-white/50">Cargando órdenes...</p>}
              {!isLoading && filteredOrders.length > 0 && filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  userRole={user?.role ?? 'VENDEDOR'}
                  isUpdating={updatingOrderId === order.id}
                  onUpdateStatus={handleUpdateStatus}
                  onOpenNotes={(notes) => {
                    setSelectedNotes(notes);
                    setIsNotesOpen(true);
                  }}
                />
              ))}
              {!isLoading && !error && filteredOrders.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/15 bg-[#1a070b]/50 p-10 text-center text-sm text-white/50">
                  {orders.length > 0 ? 'No hay órdenes que coincidan con los filtros.' : 'Todavía no hay órdenes registradas.'}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <NotesModal isOpen={isNotesOpen} onClose={() => setIsNotesOpen(false)} title="Observaciones de la orden" notes={selectedNotes} />
    </div>
  );
}
