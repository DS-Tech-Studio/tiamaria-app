import { useEffect, useMemo, useState } from 'react';
import { axiosClient } from '../../../../api/axiosClient';
import type { Client } from '../../../../types/client';
import type { CreateOrderPayload, Order, PaymentMethod, ProductOption } from '../../../../types/order';
import { formatCurrency, ORDER_DISCOUNT_PERCENTAGES } from '../../../../types/order';
import { Dropdown } from '../../../../components/ui/Dropdown';
import { getCachedClients, getCachedOrderProducts } from '../../../../services/offlineData.service';
import { useOffline } from '../../../../hooks/useOffline';
import { TituloFormulario } from './OrderControls';

interface DraftItem {
  productId: string;
  quantity: number;
}

interface OrderFormProps {
  onOrderCreated: (order: Order) => void;
}

export function OrderForm({ onOrderCreated }: OrderFormProps) {
  const isOffline = useOffline();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [clientId, setClientId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<DraftItem[]>([]);
  const [notes, setNotes] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFECTIVO');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [clientsResponse, productsResponse] = await Promise.all([
          getCachedClients(isOffline),
          getCachedOrderProducts(true, isOffline),
        ]);
        setClients(clientsResponse);
        setProducts(productsResponse);
        setProductId(
          productsResponse.find((product) => product.is_available)?.id
            ?? productsResponse[0]?.id
            ?? '',
        );
      } catch {
        setError('No fue posible cargar clientes y productos para crear la orden.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadOptions();
  }, [isOffline]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => {
      const product = products.find((option) => option.id === item.productId);
      return sum + (Number(product?.price) || 0) * item.quantity;
    }, 0),
    [items, products],
  );
  const discountAmount = Math.round(subtotal * discountPercent) / 100;
  const total = subtotal - discountAmount;

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
    if (paymentMethod === 'TRANSFERENCIA' && !receiptFile) {
      setError('Adjunta la imagen del comprobante para continuar.');
      return;
    }
    if (receiptFile && (!['image/jpeg', 'image/png', 'image/webp'].includes(receiptFile.type) || receiptFile.size > 5 * 1024 * 1024)) {
      setError('El comprobante debe ser JPG, PNG o WEBP y pesar máximo 5 MB.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      let receiptImageUrl: string | undefined;
      if (paymentMethod === 'TRANSFERENCIA' && receiptFile) {
        const formData = new FormData();
        formData.append('file', receiptFile);
        const uploadResponse = await axiosClient.post<{ receipt_image_url: string }>(
          '/orders/receipts',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        receiptImageUrl = uploadResponse.data.receipt_image_url;
      }

      const payload: CreateOrderPayload = {
        client_id: clientId,
        notes: notes.trim() || undefined,
        payment_method: paymentMethod,
        receipt_image_url: receiptImageUrl,
        discount_percent: discountPercent,
        items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
      };
      const response = await axiosClient.post<Order>('/orders', payload);
      onOrderCreated(response.data);
      setItems([]);
      setNotes('');
      setDiscountPercent(0);
      setPaymentMethod('EFECTIVO');
      setReceiptFile(null);
    } catch {
      setError('No fue posible registrar la orden. Revisa los datos e inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectClass = 'w-full rounded-lg border border-white/10 bg-[#240103] px-3 py-2 text-sm text-white outline-none focus:border-caramelo/70 disabled:opacity-50';

  return (
    <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-2">
      <TituloFormulario text="Registrar orden" />

      <label className="flex flex-col gap-1 text-xs font-medium text-white/65">
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

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_4rem_2.5rem] items-end gap-2">
        <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-white/65">
          Producto
          <Dropdown
            value={productId}
            onChange={setProductId}
            options={products.map((product) => ({
              value: product.id,
              label: `${product.name} · ${formatCurrency(product.price)}${product.stock_quantity === 0 ? ' · Agotado' : ''}`,
            }))}
            placeholder="Seleccionar"
            disabled={isLoading || products.length === 0}
            ariaLabel="Seleccionar producto"
            triggerClassName={selectClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-white/65">
          Cant.
          <input className={selectClass} type="number" min={1} step={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} aria-label="Cantidad" />
        </label>
        <button type="button" onClick={addItem} disabled={!productId || quantity < 1} aria-label="Agregar producto" title="Agregar producto" className="h-10 w-10 rounded-lg border border-caramelo/40 text-lg font-medium text-caramelo transition hover:bg-caramelo/10 disabled:cursor-not-allowed disabled:opacity-40">
          +
        </button>
      </div>

      <fieldset className="flex flex-col gap-1 text-xs font-medium text-white/65">
        <legend>Forma de pago</legend>
        <div className="grid grid-cols-2 gap-2">
          {(['EFECTIVO', 'TRANSFERENCIA'] as const).map((method) => (
            <label key={method} className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[#240103]/70 px-3 py-2 text-sm text-white">
              <input
                type="radio"
                name="payment-method"
                value={method}
                checked={paymentMethod === method}
                onChange={() => setPaymentMethod(method)}
                className="accent-caramelo"
              />
              {method === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}
            </label>
          ))}
        </div>
      </fieldset>

      {paymentMethod === 'TRANSFERENCIA' && (
        <label className="flex flex-col gap-1 text-xs font-medium text-white/65">
          Comprobante de transferencia
          <input
            key={receiptFile?.name ?? 'empty'}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setReceiptFile(event.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-white/10 bg-[#240103] px-3 py-2 text-sm text-white file:mr-3 file:rounded-md file:border-0 file:bg-caramelo/15 file:px-2 file:py-1 file:text-caramelo"
            aria-required="true"
          />
          {receiptFile && <span className="truncate text-white/50">{receiptFile.name}</span>}
        </label>
      )}

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
        <div className="mt-2 space-y-1 border-t border-white/10 pt-2 text-xs">
          <div className="flex items-center justify-between text-white/60">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-2 text-white/60">
            <label htmlFor="order-discount">Descuento</label>
            <select
              id="order-discount"
              value={discountPercent}
              onChange={(event) => setDiscountPercent(Number(event.target.value))}
              className="rounded-md border border-white/10 bg-[#240103] px-2 py-1 text-white outline-none focus:border-caramelo/70"
            >
              <option value={0}>Sin descuento</option>
              {ORDER_DISCOUNT_PERCENTAGES.map((percent) => (
                <option key={percent} value={percent}>{percent}%</option>
              ))}
            </select>
          </div>
          {discountPercent > 0 && (
            <div className="flex items-center justify-between text-emerald-300">
              <span>Ahorras ({discountPercent}%)</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-1 text-sm">
            <span className="font-semibold text-white/70">Total a pagar</span>
            <span className="text-lg font-bold text-caramelo">{formatCurrency(total)}</span>
          </div>
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