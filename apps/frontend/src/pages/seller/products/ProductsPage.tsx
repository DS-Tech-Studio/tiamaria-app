import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { axiosClient } from '../../../api/axiosClient';
import { useAuth } from '../../../context/AuthContext';
import BotonSubmit from '../../../components/ui/BotonSubmit';
import FormTitle from '../../../components/ui/FormTitle';
import InputFlotante from '../../../components/ui/InputFlotante';
import { BoxesIcon, SearchIcon, UsersIcon } from '../../../components/ui/icons';
import { formatCurrency } from '../../../types/order';
import type { Product } from '../../../types/product';
import { cacheProducts, getCachedProducts } from '../../../services/offlineData.service';
import { useOffline } from '../../../hooks/useOffline';

interface ProductFormState {
  name: string;
  description: string;
  price: string;
}

const initialForm: ProductFormState = {
  name: '',
  description: '',
  price: '',
};

export default function ProductsPage() {
  const { user } = useAuth();
  const isOffline = useOffline();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<ProductFormState>(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [statusError, setStatusError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProducts(await getCachedProducts(isOffline));
      } catch {
        setError('No fue posible cargar el catálogo de productos.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadProducts();
  }, [isOffline]);

  const updateProducts = (update: (current: Product[]) => Product[]) => {
    setProducts((current) => {
      const updatedProducts = update(current);
      cacheProducts(updatedProducts);
      return updatedProducts;
    });
  };

  const filteredProducts = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    if (!normalized) return products;

    return products.filter((product) => {
      const hayCoincidencia = [product.name, product.description ?? '']
        .some((value) => value.toLowerCase().includes(normalized));
      return hayCoincidencia;
    });
  }, [products, searchTerm]);

  const updateField = (field: keyof ProductFormState, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleToggleStatus = async (product: Product) => {
    setBusyProductId(product.id);
    setStatusError('');
    try {
      const response = await axiosClient.patch<Product>(`/products/${product.id}/toggle-status`);
      updateProducts((current) => current.map((item) => item.id === product.id ? response.data : item));
    } catch (requestError) {
      const message = (requestError as { response?: { data?: { message?: string | string[] } } }).response?.data?.message;
      setStatusError(Array.isArray(message) ? message.join(' ') : message || `No fue posible cambiar el estado de ${product.name}.`);
    } finally {
      setBusyProductId(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    const priceValue = Number(formData.price);
    if (!formData.name.trim() || Number.isNaN(priceValue) || priceValue <= 0) {
      setError('Completa el nombre y un precio válido.');
      setIsSaving(false);
      return;
    }

    try {
      const response = await axiosClient.post<Product>('/products', {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: priceValue,
        is_available: true,
      });

      updateProducts((current) => [response.data, ...current]);
      setFormData(initialForm);
    } catch {
      setError('No se pudo guardar el producto. Revisa los datos e inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-w-0 w-full flex-col gap-8 pb-10 lg:h-full lg:min-h-0 lg:overflow-hidden">
      <header className="border-b border-white/10 pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-caramelo">Catálogo</p>
            <h1 className="font-serif text-3xl font-bold text-white md:text-4xl">Productos</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">Gestiona precios, disponibilidad y catálogo del negocio.</p>
          </div>
          {user?.role === 'ADMIN' && (
            <Link
              to="/inventario"
              className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg border border-caramelo/40 bg-caramelo/10 px-4 text-sm font-semibold text-caramelo transition hover:border-caramelo hover:bg-caramelo/20 sm:self-auto"
            >
              <BoxesIcon className="h-4 w-4" />
              Control de inventario
            </Link>
          )}
        </div>
      </header>

      <div className="grid min-w-0 items-start gap-8 lg:min-h-0 lg:flex-1 lg:grid-cols-12">
        {user?.role === 'ADMIN' && (
          <section className="min-w-0 rounded-2xl border border-white/10 bg-[#1a070b]/90 p-5 shadow-xl lg:col-span-5">
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <FormTitle title="Registrar producto" subtitle="Añade un nuevo artículo al catálogo." icon={<UsersIcon className="h-5 w-5 text-caramelo" />} />

              <InputFlotante inputSize="sm" label="Nombre del producto" value={formData.name} onChange={(event) => updateField('name', event.target.value)} required />
              <InputFlotante inputSize="sm" label="Descripción" value={formData.description} onChange={(event) => updateField('description', event.target.value)} />
              <InputFlotante inputSize="sm" label="Precio" type="number" min="0" step="0.01" value={formData.price} onChange={(event) => updateField('price', event.target.value)} required />

              {error && <p className="text-sm text-red-300">{error}</p>}

              <BotonSubmit size="sm" isLoading={isSaving} loadingText="Guardando producto" icon={<UsersIcon className="h-4 w-4" />}>
                Guardar producto
              </BotonSubmit>
            </form>
          </section>
        )}

        <section className={`flex min-h-0 min-w-0 flex-col gap-5 ${user?.role === 'ADMIN' ? 'lg:col-span-7' : 'lg:col-span-12'} lg:overflow-hidden`}>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-caramelo" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nombre o descripción..."
              aria-label="Buscar productos"
              className="w-full rounded-xl border border-white/10 bg-[#240103] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-caramelo/70"
            />
          </div>

          <div className="min-h-0 flex-1 overflow-visible scrollbar-hidden lg:overflow-y-auto lg:h-[calc(100vh-25rem)] lg:flex-none">
            {statusError && <p className="mb-4 rounded-xl border border-red-400/30 bg-red-950/30 p-4 text-sm text-red-200" role="alert">{statusError}</p>}
            {isLoading && <p className="py-10 text-center text-sm text-white/50">Cargando productos...</p>}

            {!isLoading && !error && filteredProducts.length > 0 && (
              <div className="grid gap-4">
                {filteredProducts.map((product) => (
                  <article key={product.id} className="rounded-2xl border border-white/10 bg-[#1a070b]/90 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-white">{product.name}</h3>
                        <p className="mt-1 text-sm text-white/60">{product.description || 'Sin descripción'}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${!product.is_active ? 'bg-white/10 text-white/60' : product.stock_quantity === 0 ? 'bg-red-500/20 text-red-200' : product.stock_quantity <= product.min_stock_alert ? 'bg-amber-500/20 text-amber-200' : 'bg-emerald-500/20 text-emerald-200'}`}>
                          {!product.is_active ? 'Desactivado' : product.stock_quantity === 0 ? 'Agotado' : product.stock_quantity <= product.min_stock_alert ? 'Stock bajo' : 'Disponible'}
                        </span>
                        <span className="text-lg font-bold text-caramelo">{formatCurrency(product.price)}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3">
                      <p className="text-xs text-white/55">
                        Existencias <span className="font-semibold text-white">{product.stock_quantity}</span>
                        <span className="px-2 text-white/25">/</span>
                        mínimo <span className="font-semibold text-white">{product.min_stock_alert}</span>
                      </p>
                      {user?.role === 'ADMIN' && (
                        <button
                          type="button"
                          onClick={() => void handleToggleStatus(product)}
                          disabled={busyProductId === product.id}
                          title={product.is_active ? 'Desactivar producto' : 'Activar producto'}
                          className="min-h-9 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 transition hover:border-caramelo/40 hover:text-caramelo disabled:cursor-wait disabled:opacity-45"
                        >
                          {busyProductId === product.id ? 'Guardando...' : product.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            {!isLoading && !error && filteredProducts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/15 bg-[#1a070b]/50 p-10 text-center text-sm text-white/50">
                {searchTerm ? 'No se encontraron productos que coincidan con la búsqueda.' : 'Todavía no hay productos registrados.'}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
