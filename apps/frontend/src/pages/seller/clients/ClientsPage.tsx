import { useEffect, useMemo, useState } from 'react';
import { NotesModal } from '../../../components/ui/NotesModal';
import { ClientCard } from './components/ClientCard';
import { ClientForm } from './components/ClientForm';
import { ClientEditModal } from './components/ClientEditModal';
import type { Client } from '../../../types/client';
import { ClientSearch } from './components/ClientSearch';
import { cacheClients, getCachedClients } from '../../../services/offlineData.service';
import { useOffline } from '../../../hooks/useOffline';

export default function ClientsPage() {
  const isOffline = useOffline();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotes, setSelectedNotes] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadClients = async () => {
      try {
        setClients(await getCachedClients(isOffline));
      } catch {
        setError('No fue posible cargar el directorio de clientes.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadClients();
  }, [isOffline]);

  const updateClients = (update: (current: Client[]) => Client[]) => {
    setClients((current) => {
      const updatedClients = update(current);
      cacheClients(updatedClients);
      return updatedClients;
    });
  };

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

  const handleClientUpdated = (updatedClient: Client) => {
    updateClients((current) => current.map((client) => client.id === updatedClient.id ? updatedClient : client));
    setEditingClient(null);
    setError('');
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
              updateClients((currentClients) => [newClient, ...currentClients]);
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
                <ClientCard key={client.id} client={client} onOpenMap={handleOpenMap} onOpenNotes={handleOpenNotes} onEdit={() => setEditingClient(client)} />
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
      {editingClient && <ClientEditModal client={editingClient} onClose={() => setEditingClient(null)} onSaved={handleClientUpdated} />}
    </div>
  );
}
