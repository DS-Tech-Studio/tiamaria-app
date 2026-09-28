import { useEffect, useMemo, useState } from 'react';
import { axiosClient } from '../../../api/axiosClient';
import BotonSubmit from '../../../components/ui/BotonSubmit';
import FormTitle from '../../../components/ui/FormTitle';
import InputFlotante from '../../../components/ui/InputFlotante';
import { SearchIcon, UsersIcon } from '../../../components/ui/icons';
import { formatCurrency } from '../../../types/order';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  is_available: boolean;
}

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
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<ProductFormState>(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await axiosClient.get<Product[]>('/products');
        setProducts(response.data);
      } catch {
        setError('No fue posible cargar el catálogo de productos.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadProducts();
  }, []);

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

      setProducts((current) => [response.data, ...current]);
      setFormData(initialForm);
    } catch {
      setError('No se pudo guardar el producto. Revisa los datos e inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8 pb-10 lg:h-full lg:min-h-0 lg:overflow-hidden">
      <header className="border-b border-white/10 pb-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-caramelo">Inventario</p>
        <h1 className="font-serif text-3xl font-bold text-white md:text-4xl">Productos</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/60">Gestiona precios, disponibilidad y catálogo del negocio.</p>
      </header>

      <div className="grid items-start gap-8 lg:min-h-0 lg:flex-1 lg:grid-cols-12">
        <section className="rounded-2xl border border-white/10 bg-[#1a070b]/90 p-5 shadow-xl lg:col-span-5">
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

        <section className="flex min-h-0 flex-col gap-5 lg:col-span-7 lg:overflow-hidden">
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
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${product.is_available ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'}`}>
                          {product.is_available ? 'Disponible' : 'Sin stock'}
                        </span>
                        <span className="text-lg font-bold text-caramelo">{formatCurrency(product.price)}</span>
                      </div>
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
