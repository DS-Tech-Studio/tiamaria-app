import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { axiosClient } from '../../api/axiosClient';
import BotonSubmit from '../../components/ui/BotonSubmit';
import { ArrowDownIcon, ArrowLeftIcon, ArrowUpIcon, BoxesIcon, HistoryIcon, SearchIcon } from '../../components/ui/icons';
import { getCachedProducts } from '../../services/offlineData.service';
import type { Product as CatalogProduct } from '../../types/product';
import { useOffline } from '../../hooks/useOffline';

type MovementType = 'ENTRADA' | 'SALIDA';
type MovementReason =
  | 'COMPRA'
  | 'PRODUCCION'
  | 'DEVOLUCION'
  | 'REGALO_MUESTRA'
  | 'CADUCO_VENCIDO'
  | 'DANADO_PERDIDO'
  | 'AJUSTE_MANUAL'
  | 'INVENTARIO_INICIAL'
  | 'VENTA'
  | 'CANCELACION_PEDIDO'
  | 'AJUSTE_PEDIDO';

type Product = Pick<CatalogProduct, 'id' | 'name' | 'stock_quantity' | 'min_stock_alert' | 'is_active'>;

interface InventoryMovement {
  id: string;
  product_id: string;
  type: MovementType;
  reason: MovementReason;
  quantity: number;
  stock_previous: number;
  stock_resulting: number;
  notes?: string | null;
  created_at: string;
  product?: { name: string };
  user?: { name: string; role: string };
  order?: { code: string } | null;
}

interface HistoryFilters {
  product_id: string;
  reason: string;
  from: string;
  to: string;
}

const entryReasons: Array<{ value: MovementReason; label: string }> = [
  { value: 'COMPRA', label: 'Compra' },
  { value: 'PRODUCCION', label: 'Producción' },
  { value: 'DEVOLUCION', label: 'Devolución' },
  { value: 'INVENTARIO_INICIAL', label: 'Inventario inicial' },
  { value: 'AJUSTE_MANUAL', label: 'Ajuste manual' },
];

const exitReasons: Array<{ value: MovementReason; label: string }> = [
  { value: 'REGALO_MUESTRA', label: 'Regalo o muestra' },
  { value: 'CADUCO_VENCIDO', label: 'Caducado o vencido' },
  { value: 'DANADO_PERDIDO', label: 'Dañado o perdido' },
  { value: 'AJUSTE_MANUAL', label: 'Ajuste manual' },
];

const reasonLabels: Record<MovementReason, string> = {
  COMPRA: 'Compra',
  PRODUCCION: 'Producción',
  DEVOLUCION: 'Devolución',
  REGALO_MUESTRA: 'Regalo o muestra',
  CADUCO_VENCIDO: 'Caducado o vencido',
  DANADO_PERDIDO: 'Dañado o perdido',
  AJUSTE_MANUAL: 'Ajuste manual',
  INVENTARIO_INICIAL: 'Inventario inicial',
  VENTA: 'Venta',
  CANCELACION_PEDIDO: 'Cancelación de pedido',
  AJUSTE_PEDIDO: 'Ajuste de pedido',
};

const initialFilters: HistoryFilters = {
  product_id: '',
  reason: '',
  from: '',
  to: '',
};

const fieldClassName = 'min-h-11 w-full rounded-lg border border-white/15 bg-[#240103] px-3 text-sm text-white outline-none focus:border-caramelo/70';

function getErrorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: { data?: { message?: string | string[] } } }).response;
  const message = response?.data?.message;
  return Array.isArray(message) ? message.join(' ') : message || fallback;
}

function getStockState(product: Product): { label: string; color: string } {
  if (!product.is_active) return { label: 'Desactivado', color: 'bg-white/10 text-white/60' };
  if (product.stock_quantity <= 0) return { label: 'Agotado', color: 'bg-red-500/20 text-red-200' };
  if (product.stock_quantity <= product.min_stock_alert) return { label: 'Stock bajo', color: 'bg-amber-500/20 text-amber-200' };
  return { label: 'Disponible', color: 'bg-emerald-500/20 text-emerald-200' };
}

function formatMovementDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Fecha no disponible'
    : date.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function InventoryPage() {
  const isOffline = useOffline();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [activeTab, setActiveTab] = useState<'stock' | 'history'>('stock');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [movementType, setMovementType] = useState<MovementType>('ENTRADA');
  const [reason, setReason] = useState<MovementReason>('PRODUCCION');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [filters, setFilters] = useState<HistoryFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState('');
  const [formMessage, setFormMessage] = useState('');

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const productsResponse = await getCachedProducts(isOffline);
        setProducts(productsResponse);
        setSelectedProductId((current) => current || productsResponse[0]?.id || '');
      } catch (requestError) {
        setError(getErrorMessage(requestError, 'No fue posible cargar el inventario.'));
      }

      try {
        const movementsResponse = await axiosClient.get<InventoryMovement[]>('/inventory/movements', { params: { limit: 50 } });
        setMovements(movementsResponse.data);
      } catch (requestError) {
        setError(getErrorMessage(requestError, 'No fue posible cargar el inventario.'));
      } finally {
        setIsLoading(false);
      }
    };

    void loadInventory();
  }, [isOffline]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = productSearch.trim().toLocaleLowerCase('es-MX');
    return products.filter((product) => product.name.toLocaleLowerCase('es-MX').includes(normalizedSearch));
  }, [products, productSearch]);

  const stockSummary = useMemo(() => ({
    total: products.length,
    low: products.filter((product) => product.stock_quantity > 0 && product.stock_quantity <= product.min_stock_alert).length,
    out: products.filter((product) => product.stock_quantity <= 0).length,
  }), [products]);

  const availableReasons = movementType === 'ENTRADA' ? entryReasons : exitReasons;

  const refreshInventory = async () => {
    const [productsResponse, movementsResponse] = await Promise.all([
      getCachedProducts(isOffline),
      axiosClient.get<InventoryMovement[]>('/inventory/movements', { params: { limit: 50 } }),
    ]);
    setProducts(productsResponse);
    setMovements(movementsResponse.data);
  };

  const handleMovementTypeChange = (nextType: MovementType) => {
    setMovementType(nextType);
    setReason(nextType === 'ENTRADA' ? 'PRODUCCION' : 'REGALO_MUESTRA');
  };

  const handleSubmitMovement = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setFormMessage('');
    const amount = Number(quantity);
    if (!selectedProductId || !Number.isInteger(amount) || amount < 1) {
      setError('Selecciona un producto e indica una cantidad entera mayor que cero.');
      return;
    }

    setIsSaving(true);
    try {
      await axiosClient.post('/inventory/movements', {
        product_id: selectedProductId,
        type: movementType,
        reason,
        quantity: amount,
        notes: notes.trim() || undefined,
      });
      setQuantity('1');
      setNotes('');
      setFormMessage('Movimiento registrado.');
      try {
        await refreshInventory();
      } catch {
        setError('El movimiento se registró, pero no se pudo actualizar la vista. Recarga la página.');
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No fue posible registrar el movimiento.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleHistoryFilter = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsFiltering(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value.trim()),
      );
      if (filters.to) {
        params.to = `${filters.to}T23:59:59.999Z`;
      }
      const response = await axiosClient.get<InventoryMovement[]>('/inventory/movements', {
        params: { ...params, limit: 100 },
      });
      setMovements(response.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No fue posible filtrar los movimientos.'));
    } finally {
      setIsFiltering(false);
    }
  };

  const chooseQuickMovement = (product: Product, type: MovementType) => {
    setSelectedProductId(product.id);
    handleMovementTypeChange(type);
    setActiveTab('stock');
    setFormMessage('');
  };

  return (
    <div className="flex w-full flex-col gap-5 pb-8 lg:min-h-full">
      <header className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link to="/productos" className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-caramelo transition hover:text-white">
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Productos
          </Link>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-caramelo">Administración</p>
          <h1 className="font-serif text-3xl font-bold text-white">Inventario</h1>
        </div>
        <p className="max-w-md text-sm text-white/55">Existencias actuales, entradas, retiros y movimientos auditados.</p>
      </header>

      <section aria-label="Resumen de existencias" className="grid grid-cols-3 divide-x divide-white/10 border-y border-white/10 py-3">
        <div className="px-3 first:pl-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45 sm:text-xs">Productos</p>
          <p className="mt-1 text-xl font-bold text-white">{stockSummary.total}</p>
        </div>
        <div className="px-3 sm:px-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-200/70 sm:text-xs">Stock bajo</p>
          <p className="mt-1 text-xl font-bold text-amber-200">{stockSummary.low}</p>
        </div>
        <div className="px-3 sm:px-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-red-200/70 sm:text-xs">Agotados</p>
          <p className="mt-1 text-xl font-bold text-red-200">{stockSummary.out}</p>
        </div>
      </section>

      <div className="flex border-b border-white/10" role="tablist" aria-label="Vistas de inventario">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'stock'}
          onClick={() => setActiveTab('stock')}
          className={`min-h-11 border-b-2 px-4 text-sm font-semibold transition ${activeTab === 'stock' ? 'border-caramelo text-caramelo' : 'border-transparent text-white/50 hover:text-white'}`}
        >
          Existencias
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
          className={`inline-flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm font-semibold transition ${activeTab === 'history' ? 'border-caramelo text-caramelo' : 'border-transparent text-white/50 hover:text-white'}`}
        >
          <HistoryIcon className="h-4 w-4" />
          Kardex
        </button>
      </div>

      {error && <p className="rounded-lg border border-red-400/30 bg-red-950/40 p-3 text-sm text-red-200" role="alert">{error}</p>}

      {activeTab === 'stock' ? (
        <div className="grid items-start gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-12">
          <section
            aria-label="Formulario de movimientos de inventario"
            className="rounded-xl border border-white/10 bg-[#1a070b]/85 p-4 sm:p-5 lg:col-span-4"
          >
            <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-caramelo/10 text-caramelo">
                <BoxesIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-serif text-lg font-bold text-white">Registrar movimiento</h2>
                <p className="text-xs text-white/50">El saldo y el kardex se actualizan juntos.</p>
              </div>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmitMovement}>
              <div>
                <label htmlFor="movement-product" className="mb-1.5 block text-xs font-semibold text-white/65">Producto</label>
                <select id="movement-product" value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)} className={fieldClassName} required disabled={products.length === 0}>
                  <option value="">Selecciona un producto</option>
                  {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                </select>
              </div>

              <fieldset>
                <legend className="mb-1.5 text-xs font-semibold text-white/65">Tipo de movimiento</legend>
                <div className="grid grid-cols-2 rounded-lg border border-white/10 bg-black/20 p-1">
                  <button type="button" aria-pressed={movementType === 'ENTRADA'} onClick={() => handleMovementTypeChange('ENTRADA')} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold transition ${movementType === 'ENTRADA' ? 'bg-emerald-500/15 text-emerald-200' : 'text-white/50 hover:text-white'}`}>
                    <ArrowDownIcon className="h-4 w-4" /> Entrada
                  </button>
                  <button type="button" aria-pressed={movementType === 'SALIDA'} onClick={() => handleMovementTypeChange('SALIDA')} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold transition ${movementType === 'SALIDA' ? 'bg-red-500/15 text-red-200' : 'text-white/50 hover:text-white'}`}>
                    <ArrowUpIcon className="h-4 w-4" /> Salida
                  </button>
                </div>
              </fieldset>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="movement-reason" className="mb-1.5 block text-xs font-semibold text-white/65">Motivo</label>
                  <select id="movement-reason" value={reason} onChange={(event) => setReason(event.target.value as MovementReason)} className={fieldClassName}>
                    {availableReasons.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="movement-quantity" className="mb-1.5 block text-xs font-semibold text-white/65">Unidades</label>
                  <input id="movement-quantity" type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} className={fieldClassName} required />
                </div>
              </div>

              <div>
                <label htmlFor="movement-notes" className="mb-1.5 block text-xs font-semibold text-white/65">Nota <span className="font-normal text-white/35">(opcional)</span></label>
                <textarea id="movement-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={2000} rows={2} placeholder="Detalle del movimiento" className={`${fieldClassName} resize-y py-2.5`} />
              </div>

              {formMessage && <p className="text-sm text-emerald-200" role="status">{formMessage}</p>}
              <BotonSubmit size="sm" isLoading={isSaving} loadingText="Guardando movimiento" disabled={products.length === 0} icon={<BoxesIcon className="h-4 w-4" />}>
                Registrar movimiento
              </BotonSubmit>
            </form>
          </section>

          <section className="min-w-0 lg:col-span-8 lg:min-h-0 lg:overflow-hidden">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-white">Stock actual</h2>
                <p className="mt-1 text-xs text-white/45">Umbral de alerta por producto</p>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-caramelo" />
                <input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} aria-label="Buscar producto" placeholder="Buscar producto..." className={`${fieldClassName} pl-9`} />
              </div>
            </div>

            <div className="divide-y divide-white/10 border-y border-white/10 scrollbar-hidden lg:max-h-[calc(100vh-22rem)] lg:overflow-y-auto">
              {isLoading && <p className="py-10 text-center text-sm text-white/50">Cargando existencias...</p>}
              {!isLoading && filteredProducts.map((product) => {
                const stockState = getStockState(product);
                return (
                  <article key={product.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${product.stock_quantity <= product.min_stock_alert ? 'bg-amber-500/10 text-amber-200' : 'bg-caramelo/10 text-caramelo'}`}>
                        <BoxesIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-white">{product.name}</h3>
                        <p className="mt-0.5 text-xs text-white/45">Alerta mínimo: {product.min_stock_alert}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <div className="text-left sm:min-w-20 sm:text-right">
                        <p className="text-xl font-bold leading-none text-white">{product.stock_quantity}</p>
                        <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${stockState.color}`}>{stockState.label}</span>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => chooseQuickMovement(product, 'ENTRADA')} aria-label={`Registrar entrada para ${product.name}`} title="Registrar entrada" className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-emerald-400/25 px-2.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/10">
                          <ArrowDownIcon className="h-3.5 w-3.5" /> Entrada
                        </button>
                        <button type="button" onClick={() => chooseQuickMovement(product, 'SALIDA')} aria-label={`Registrar salida para ${product.name}`} title="Registrar salida" className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-red-400/25 px-2.5 text-xs font-semibold text-red-200 transition hover:bg-red-400/10">
                          <ArrowUpIcon className="h-3.5 w-3.5" /> Salida
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
              {!isLoading && filteredProducts.length === 0 && (
                <p className="py-10 text-center text-sm text-white/50">{products.length ? 'No hay productos que coincidan con la búsqueda.' : 'Todavía no hay productos registrados.'}</p>
              )}
            </div>
          </section>
        </div>
      ) : (
        <section className="flex min-h-0 flex-col gap-4 lg:flex-1">
          <form onSubmit={handleHistoryFilter} className="grid gap-3 border-b border-white/10 pb-4 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-xs font-semibold text-white/65">
              Producto
              <select value={filters.product_id} onChange={(event) => setFilters((current) => ({ ...current, product_id: event.target.value }))} className={`${fieldClassName} mt-1.5`}>
                <option value="">Todos</option>
                {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-white/65">
              Motivo
              <select value={filters.reason} onChange={(event) => setFilters((current) => ({ ...current, reason: event.target.value }))} className={`${fieldClassName} mt-1.5`}>
                <option value="">Todos</option>
                {Object.entries(reasonLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-white/65">
              Desde
              <input type="date" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))} className={`${fieldClassName} mt-1.5`} />
            </label>
            <label className="text-xs font-semibold text-white/65">
              Hasta
              <input type="date" value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))} className={`${fieldClassName} mt-1.5`} />
            </label>
            <button type="submit" disabled={isFiltering} className="min-h-11 self-end rounded-lg border border-caramelo/40 bg-caramelo/10 px-4 text-sm font-semibold text-caramelo transition hover:bg-caramelo/20 disabled:opacity-50">
              {isFiltering ? 'Filtrando...' : 'Aplicar filtros'}
            </button>
          </form>

          <div className="min-h-0 divide-y divide-white/10 overflow-y-auto border-y border-white/10">
            {isLoading && <p className="py-10 text-center text-sm text-white/50">Cargando movimientos...</p>}
            {!isLoading && movements.map((movement) => (
              <article key={movement.id} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-white">{movement.product?.name ?? 'Producto'}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${movement.type === 'ENTRADA' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-red-500/15 text-red-200'}`}>
                      {movement.type === 'ENTRADA' ? 'Entrada' : 'Salida'} · {reasonLabels[movement.reason]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-white/45">{formatMovementDate(movement.created_at)} · {movement.user?.name ?? 'Usuario'}</p>
                  {(movement.notes || movement.order?.code) && (
                    <p className="mt-1 truncate text-xs text-white/60">{movement.order?.code ? `${movement.order.code} · ` : ''}{movement.notes}</p>
                  )}
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <span className={`text-lg font-bold ${movement.type === 'ENTRADA' ? 'text-emerald-200' : 'text-red-200'}`}>
                    {movement.type === 'ENTRADA' ? '+' : '-'}{movement.quantity}
                  </span>
                  <p className="min-w-28 text-right text-xs text-white/55">Saldo {movement.stock_previous} <span className="text-white/30">→</span> <strong className="text-white">{movement.stock_resulting}</strong></p>
                </div>
              </article>
            ))}
            {!isLoading && movements.length === 0 && <p className="py-10 text-center text-sm text-white/50">No hay movimientos para esos filtros.</p>}
          </div>
        </section>
      )}
    </div>
  );
}