import { useEffect, useMemo, useState } from 'react';
import { axiosClient } from '../../../api/axiosClient';
import { NotesModal } from '../../../components/ui/NotesModal';
import { ClientCard } from './components/ClientCard';
import { ClientForm } from './components/ClientForm';
import type { Client } from '../../../types/client';
import { ClientSearch } from './components/ClientSearch';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotes, setSelectedNotes] = useState<string | null>(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await axiosClient.get<Client[]>('/clients');
        setClients(response.data);
      } catch {
        setError('No fue posible cargar el directorio de clientes.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadClients();
  }, []);

  const filteredClients = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    if (!normalizedTerm) return clients;

    return clients.filter((client) =>
      [client.contact_name, client.business_name, client.phone, client.address]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(normalizedTerm)),
    );
  }, [clients, searchTerm]);

  const handleOpenMap = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenNotes = (notes?: string) => {
    setSelectedNotes(notes ?? '');
    setIsNotesOpen(true);
  };

  return (
    <div className="flex w-full flex-col gap-8 pb-10 lg:h-full lg:min-h-0 lg:overflow-hidden">
      <header className="border-b border-white/10 pb-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-caramelo">Directorio</p>
        <h1 className="font-serif text-3xl font-bold text-white md:text-4xl">Clientes</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/60">
          Gestiona contactos, ubicaciones y notas desde un solo lugar.
        </p>
      </header>

      <div className="grid items-start gap-8 lg:min-h-0 lg:flex-1 lg:grid-cols-12">
        <section className="rounded-2xl border border-white/10 bg-[#1a070b]/90 p-5 shadow-xl lg:col-span-5">
          <ClientForm
            onClientAdded={(newClient) => {
              setClients((currentClients) => [newClient, ...currentClients]);
              setError('');
            }}
          />
        </section>

        <section className="flex min-h-0 flex-col gap-5 lg:col-span-7 lg:overflow-hidden">
          <ClientSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hidden lg:h-[calc(100vh-25rem)] lg:flex-none">
            {isLoading && <p className="py-10 text-center text-sm text-white/50">Cargando clientes...</p>}
            {!isLoading && error && <p className="rounded-xl border border-red-400/30 bg-red-950/30 p-5 text-sm text-red-200">{error}</p>}
            {!isLoading && !error && filteredClients.length > 0 && (
              <div className="grid gap-4">
              {filteredClients.map((client) => (
                <ClientCard key={client.id} client={client} onOpenMap={handleOpenMap} onOpenNotes={handleOpenNotes} />
              ))}
              </div>
            )}
            {!isLoading && !error && filteredClients.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/15 bg-[#1a070b]/50 p-10 text-center text-sm text-white/50">
                {searchTerm ? 'No se encontraron clientes que coincidan con la búsqueda.' : 'Todavía no hay clientes registrados.'}
              </div>
            )}
          </div>
        </section>
      </div>

      <NotesModal
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        title="Notas del cliente"
        notes={selectedNotes}
      />
    </div>
  );
}
