import type { Client } from '../../../../types/client';
import { MapPinIcon, NoteIcon, PencilIcon } from '../../../../components/ui/icons';

interface ClientCardProps {
  client: Client;
  onOpenMap: (address: string) => void;
  onOpenNotes: (notes?: string) => void;
  onEdit: () => void;
}

export function ClientCard({ client, onOpenMap, onOpenNotes, onEdit }: ClientCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#1a070b]/90 p-5 transition hover:border-caramelo/40 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0"><h3 className="truncate text-lg font-bold text-white">{client.contact_name}</h3>{client.business_name && <p className="mt-0.5 text-sm text-caramelo">{client.business_name}</p>}<p className="mt-2 text-sm text-white/55">{client.phone} <span className="px-1 text-white/25">•</span> {client.address}</p></div>
      <div className="flex shrink-0 gap-2"><button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/65 transition hover:border-caramelo/50 hover:bg-caramelo/10 hover:text-caramelo" type="button" onClick={() => onOpenMap(client.address)} title="Ver ubicación en Google Maps" aria-label="Ver ubicación en Google Maps"><MapPinIcon className="h-5 w-5" /></button><button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/65 transition hover:border-caramelo/50 hover:bg-caramelo/10 hover:text-caramelo" type="button" onClick={() => onOpenNotes(client.notes)} title="Ver notas" aria-label="Ver notas"><NoteIcon className="h-5 w-5" /></button><button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-caramelo/30 bg-caramelo/5 text-caramelo transition hover:border-caramelo hover:bg-caramelo/10" type="button" onClick={onEdit} title="Editar cliente" aria-label={`Editar cliente ${client.contact_name}`}><PencilIcon className="h-5 w-5" /></button></div>
    </article>
  );
}