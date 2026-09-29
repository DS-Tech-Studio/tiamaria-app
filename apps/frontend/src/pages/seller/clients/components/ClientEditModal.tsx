import { useState, type FormEvent } from 'react';
import { axiosClient } from '../../../../api/axiosClient';
import BotonSubmit from '../../../../components/ui/BotonSubmit';
import { MapPinIcon, PencilIcon, PhoneIcon, UserIcon, UsersIcon } from '../../../../components/ui/icons';
import InputFlotante from '../../../../components/ui/InputFlotante';
import type { Client } from '../../../../types/client';

interface ClientEditModalProps {
  client: Client;
  onClose: () => void;
  onSaved: (client: Client) => void;
}

export function ClientEditModal({ client, onClose, onSaved }: ClientEditModalProps) {
  const [contactName, setContactName] = useState(client.contact_name);
  const [businessName, setBusinessName] = useState(client.business_name ?? '');
  const [phone, setPhone] = useState(client.phone);
  const [address, setAddress] = useState(client.address);
  const [notes, setNotes] = useState(client.notes ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const response = await axiosClient.patch<Client>(`/clients/${client.id}`, {
        contact_name: contactName.trim(),
        business_name: businessName.trim() || undefined,
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim() || undefined,
      });
      onSaved(response.data);
    } catch {
      setError('No se pudo actualizar el cliente. Revisa los datos e inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4" role="presentation" onMouseDown={onClose}>
      <section className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#26080e] p-4 shadow-2xl sm:p-6" role="dialog" aria-modal="true" aria-labelledby="edit-client-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="mb-5 flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-caramelo">Directorio</p>
            <h2 id="edit-client-title" className="mt-1 font-serif text-xl font-bold text-white">Editar cliente</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar edición" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl text-white/55 transition hover:bg-white/10 hover:text-white">×</button>
        </header>

        <form className="grid grid-cols-1 gap-3 sm:grid-cols-2" onSubmit={handleSubmit}>
          <InputFlotante inputSize="sm" label="Nombre de contacto" value={contactName} onChange={(event) => setContactName(event.target.value)} required maxLength={100} icon={<UserIcon />} />
          <InputFlotante inputSize="sm" label="Negocio" value={businessName} onChange={(event) => setBusinessName(event.target.value)} maxLength={100} icon={<UsersIcon />} />
          <InputFlotante inputSize="sm" label="Teléfono" value={phone} onChange={(event) => setPhone(event.target.value)} required maxLength={20} icon={<PhoneIcon />} />
          <InputFlotante inputSize="sm" label="Dirección" value={address} onChange={(event) => setAddress(event.target.value)} required icon={<MapPinIcon />} />
          <label className="flex flex-col gap-1 text-xs text-white/70 sm:col-span-2">
            Notas
            <textarea className="min-h-20 resize-y rounded-xl border border-[#e4d3ca] bg-[#f8efe9] px-3 py-2 text-sm text-[#240103] outline-none transition focus:border-[#D57642] focus:ring-2 focus:ring-[#D57642]/25" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notas adicionales" rows={3} />
          </label>
          {error && <p className="rounded-lg border border-red-400/25 bg-red-950/30 px-3 py-2 text-xs text-red-200 sm:col-span-2" role="alert">{error}</p>}
          <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/5">Cancelar</button>
            <BotonSubmit size="sm" isLoading={isSaving} loadingText="Guardando cliente" icon={<PencilIcon className="h-4 w-4" />}>Guardar cambios</BotonSubmit>
          </div>
        </form>
      </section>
    </div>
  );
}