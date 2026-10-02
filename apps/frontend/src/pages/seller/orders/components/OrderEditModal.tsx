import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { axiosClient } from '../../../../api/axiosClient';
import { Dropdown } from '../../../../components/ui/Dropdown';
import type { Client } from '../../../../types/client';
import type { Order, ProductOption, UpdateOrderPayload } from '../../../../types/order';
import { formatCurrency } from '../../../../types/order';

interface DraftItem {
  productId: string;
  quantity: number;
}

interface OrderEditModalProps {
  order: Order;
  onClose: () => void;
  onSaved: (order: Order) => void;
}

export function OrderEditModal({ order, onClose, onSaved }: OrderEditModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [clientId, setClientId] = useState(order.client_id);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<DraftItem[]>(() => (order.items ?? []).map((item) => ({ productId: item.product_id, quantity: item.quantity })));
  const [notes, setNotes] = useState(order.notes ?? '');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    const loadOptions = async () => {
      try {
        const [clientsResponse, productsResponse] = await Promise.all([
          axiosClient.get<Client[]>('/clients'),
          axiosClient.get<ProductOption[]>('/products'),
        ]);
        if (!isCurrent) return;
        setClients(clientsResponse.data);
        setProducts(productsResponse.data);
        setProductId(
          productsResponse.data.find((product) => product.is_available || product.is_active)?.id ?? '',
        );
      } catch {
        if (isCurrent) setError('No fue posible cargar clientes y productos para editar la orden.');
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    void loadOptions();
    return () => {
      isCurrent = false;
    };
  }, []);

  const total = useMemo(() => items.reduce((sum, item) => {
    const previousItem = order.items?.find((orderItem) => orderItem.product_id === item.productId);
    const product = products.find((option) => option.id === item.productId);
    const unitPrice = Number(previousItem?.unit_price ?? product?.price) || 0;
    return sum + unitPrice * item.quantity;
  }, 0), [items, order.items, products]);

  const addItem = () => {
    if (!productId || quantity < 1) return;
    setItems((current) => {
      const existing = current.find((item) => item.productId === productId);
      return existing
        ? current.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item)
        : [...current, { productId, quantity }];
    });
    setQuantity(1);
    setError('');
  };

  const updateQuantity = (id: string, nextQuantity: number) => {
    if (nextQuantity < 1) {
      setItems((current) => current.filter((item) => item.productId !== id));
      return;
    }
    setItems((current) => current.map((item) => item.productId === id ? { ...item, quantity: nextQuantity } : item));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!clientId || items.length === 0) {
      setError('Selecciona un cliente y conserva al menos un producto.');
      return;
    }

    const payload: UpdateOrderPayload = {
      client_id: clientId,
      notes: notes.trim() || undefined,
      items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
    };

    setIsSaving(true);
    setError('');
    try {
      const response = await axiosClient.patch<Order>(`/orders/${order.id}`, payload);
      onSaved(response.data);
    } catch {
      setError('No se pudo guardar la orden. Revisa los datos e inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectClass = 'w-full rounded-lg border border-white/10 bg-[#240103] px-3 py-2 text-sm text-white outline-none focus:border-caramelo/70 disabled:opacity-50';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4" role="presentation" onMouseDown={onClose}>
      <section className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#26080e] p-4 shadow-2xl sm:p-6" role="dialog" aria-modal="true" aria-labelledby="edit-order-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="mb-5 flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-caramelo">{order.code}</p>
            <h2 id="edit-order-title" className="mt-1 font-serif text-xl font-bold text-white">Editar orden</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar edición" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl text-white/55 transition hover:bg-white/10 hover:text-white">×</button>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-white/65">
            Cliente
            <Dropdown
              value={clientId}
              onChange={setClientId}
              options={clients.map((client) => ({ value: client.id, label: client.business_name || client.contact_name }))}
              placeholder="Seleccionar cliente"
              disabled={isLoading || clients.length === 0}
              ariaLabel="Seleccionar cliente"
              triggerClassName={selectClass}
            />
          </label>

          <div className="grid grid-cols-[minmax(0,1fr)_5rem_auto] items-end gap-2">
            <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-white/65">
              Producto
              <Dropdown
                value={productId}
                onChange={setProductId}
                options={products.filter((product) => product.is_active || order.items?.some((item) => item.product_id === product.id)).map((product) => ({
                  value: product.id,
                  label: `${product.name} · ${formatCurrency(product.price)}${!product.is_active ? ' · Desactivado' : product.stock_quantity === 0 ? ' · Agotado' : ''}`,
                }))}
                placeholder="Seleccionar"
                disabled={isLoading || products.length === 0}
                ariaLabel="Seleccionar producto"
                triggerClassName={selectClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-white/65">
              Cant.
              <input className={selectClass} type="number" min={1} step={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} aria-label="Cantidad" />
            </label>
            <button type="button" onClick={addItem} disabled={!productId || quantity < 1} aria-label="Agregar producto" className="h-10 rounded-lg border border-caramelo/40 px-3 text-lg font-medium text-caramelo transition hover:bg-caramelo/10 disabled:cursor-not-allowed disabled:opacity-40">+</button>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#240103]/70 p-3">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-white/65">
              <span>Productos de la orden</span>
              <span>{items.length} {items.length === 1 ? 'artículo' : 'artículos'}</span>
            </div>
            {items.length === 0 ? (
              <p className="py-2 text-center text-xs text-white/40">Agrega al menos un producto.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {items.map((item) => {
                  const product = products.find((option) => option.id === item.productId);
                  const previousItem = order.items?.find((orderItem) => orderItem.product_id === item.productId);
                  const unitPrice = Number(previousItem?.unit_price ?? product?.price) || 0;
                  return (
                    <li key={item.productId} className="flex items-center gap-2 py-2 text-xs">
                      <span className="min-w-0 flex-1 truncate text-white">{product?.name ?? 'Producto'}</span>
                      <input className="w-14 rounded-md border border-white/10 bg-[#1a070b] px-2 py-1 text-center text-white outline-none focus:border-caramelo/60" type="number" min={1} step={1} value={item.quantity} onChange={(event) => updateQuantity(item.productId, Number(event.target.value))} aria-label={`Cantidad de ${product?.name ?? 'producto'}`} />
                      <span className="w-20 text-right font-semibold text-caramelo">{formatCurrency(unitPrice * item.quantity)}</span>
                      <button type="button" onClick={() => updateQuantity(item.productId, 0)} aria-label={`Quitar ${product?.name ?? 'producto'}`} className="px-1 text-base text-white/45 hover:text-red-300">×</button>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-sm">
              <span className="font-semibold text-white/70">Total</span>
              <span className="font-bold text-caramelo">{formatCurrency(total)}</span>
            </div>
          </div>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-white/65">
            Observaciones
            <textarea className="min-h-20 resize-y rounded-lg border border-white/10 bg-[#240103] px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-caramelo/70" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Indicaciones para esta orden" rows={3} />
          </label>

          {error && <p className="rounded-lg border border-red-400/25 bg-red-950/30 px-3 py-2 text-xs text-red-200" role="alert">{error}</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/5">Cancelar</button>
            <button type="submit" disabled={isLoading || isSaving || clients.length === 0 || products.length === 0} className="rounded-lg border border-caramelo/30 bg-[#7D2000] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#922a08] disabled:cursor-not-allowed disabled:opacity-50">
              {isSaving ? 'Guardando cambios...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}