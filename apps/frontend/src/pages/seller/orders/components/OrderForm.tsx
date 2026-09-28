import { useEffect, useMemo, useState } from 'react';
import { axiosClient } from '../../../../api/axiosClient';
import type { Client } from '../../../../types/client';
import type { CreateOrderPayload, Order, ProductOption } from '../../../../types/order';
import { formatCurrency } from '../../../../types/order';
import { TituloFormulario } from './OrderControls';

interface DraftItem {
  productId: string;
  quantity: number;
}

interface OrderFormProps {
  onOrderCreated: (order: Order) => void;
}

export function OrderForm({ onOrderCreated }: OrderFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [clientId, setClientId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<DraftItem[]>([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [clientsResponse, productsResponse] = await Promise.all([
          axiosClient.get<Client[]>('/clients'),
          axiosClient.get<ProductOption[]>('/products', { params: { available: true } }),
        ]);
        setClients(clientsResponse.data);
        setProducts(productsResponse.data);
        setClientId(clientsResponse.data[0]?.id ?? '');
        setProductId(productsResponse.data[0]?.id ?? '');
      } catch {
        setError('No fue posible cargar clientes y productos para crear la orden.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadOptions();
  }, []);

  const total = useMemo(
    () => items.reduce((sum, item) => {
      const product = products.find((option) => option.id === item.productId);
      return sum + (Number(product?.price) || 0) * item.quantity;
    }, 0),
    [items, products],
  );

  const addItem = () => {
    if (!productId || quantity < 1) return;
    setItems((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) => item.productId === productId
          ? { ...item, quantity: item.quantity + quantity }
          : item);
      }
      return [...current, { productId, quantity }];
    });
    setQuantity(1);
    setError('');
  };

  const updateQuantity = (id: string, nextQuantity: number) => {
    if (nextQuantity < 1) {
      setItems((current) => current.filter((item) => item.productId !== id));
      return;
    }
    setItems((current) => current.map((item) => item.productId === id
      ? { ...item, quantity: nextQuantity }
      : item));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!clientId || items.length === 0) {
      setError('Selecciona un cliente y agrega al menos un producto.');
      return;
    }

    const payload: CreateOrderPayload = {
      client_id: clientId,
      notes: notes.trim() || undefined,
      items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
    };

    setIsSubmitting(true);
    setError('');
    try {
      const response = await axiosClient.post<Order>('/orders', payload);
      onOrderCreated(response.data);
      setItems([]);
      setNotes('');
    } catch {
      setError('No fue posible registrar la orden. Revisa los datos e inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectClass = 'w-full rounded-lg border border-white/10 bg-[#240103] px-3 py-2 text-sm text-white outline-none focus:border-caramelo/70 disabled:opacity-50';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <TituloFormulario text="Registrar orden" />

      <label className="flex flex-col gap-1 text-xs font-medium text-white/65">
        Cliente
        <select className={selectClass} value={clientId} onChange={(event) => setClientId(event.target.value)} disabled={isLoading || clients.length === 0}>
          <option value="">Seleccionar cliente</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id} className="bg-[#1a070b]">
              {client.business_name || client.contact_name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-[minmax(0,1fr)_5rem_auto] items-end gap-2">
        <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-white/65">
          Producto
          <select className={selectClass} value={productId} onChange={(event) => setProductId(event.target.value)} disabled={isLoading || products.length === 0}>
            <option value="">Seleccionar</option>
            {products.map((product) => (
              <option key={product.id} value={product.id} className="bg-[#1a070b]">
                {product.name} · {formatCurrency(product.price)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-white/65">
          Cant.
          <input className={selectClass} type="number" min={1} step={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} aria-label="Cantidad" />
        </label>
        <button type="button" onClick={addItem} disabled={!productId || quantity < 1} aria-label="Agregar producto" title="Agregar producto" className="h-10 rounded-lg border border-caramelo/40 px-3 text-lg font-medium text-caramelo transition hover:bg-caramelo/10 disabled:cursor-not-allowed disabled:opacity-40">
          +
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#240103]/70 p-2">
        <div className="mb-1 flex items-center justify-between text-xs font-semibold text-white/65">
          <span>Productos de la orden</span>
          <span>{items.length} {items.length === 1 ? 'artículo' : 'artículos'}</span>
        </div>
        {items.length === 0 ? (
          <p className="py-1 text-center text-xs text-white/40">Aún no agregas productos.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {items.map((item) => {
              const product = products.find((option) => option.id === item.productId);
              const subtotal = (Number(product?.price) || 0) * item.quantity;
              return (
                <li key={item.productId} className="flex items-center gap-2 py-2 text-xs">
                  <span className="min-w-0 flex-1 truncate text-white">{product?.name}</span>
                  <input className="w-14 rounded-md border border-white/10 bg-[#1a070b] px-2 py-1 text-center text-white outline-none focus:border-caramelo/60" type="number" min={1} step={1} value={item.quantity} onChange={(event) => updateQuantity(item.productId, Number(event.target.value))} aria-label={`Cantidad de ${product?.name}`} />
                  <span className="w-20 text-right font-semibold text-caramelo">{formatCurrency(subtotal)}</span>
                  <button type="button" onClick={() => updateQuantity(item.productId, 0)} aria-label={`Quitar ${product?.name}`} title="Quitar producto" className="px-1 text-base text-white/45 hover:text-red-300">×</button>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
          <span className="font-semibold text-white/70">Total</span>
          <span className="text-lg font-bold text-caramelo">{formatCurrency(total)}</span>
        </div>
      </div>

      <label className="flex flex-col gap-1 text-xs font-medium text-white/65">
        Observaciones
        <textarea className="min-h-12 resize-y rounded-lg border border-white/10 bg-[#240103] px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-caramelo/70" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Indicaciones para esta orden" rows={2} />
      </label>

      {error && <p className="rounded-lg border border-red-400/25 bg-red-950/30 px-3 py-2 text-xs text-red-200" role="alert">{error}</p>}
      <button type="submit" disabled={isLoading || isSubmitting || clients.length === 0 || products.length === 0} className="w-full rounded-lg border border-caramelo/30 bg-[#7D2000] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#922a08] disabled:cursor-not-allowed disabled:opacity-50">
        {isLoading ? 'Cargando datos...' : isSubmitting ? 'Registrando...' : 'Registrar orden'}
      </button>
    </form>
  );
}