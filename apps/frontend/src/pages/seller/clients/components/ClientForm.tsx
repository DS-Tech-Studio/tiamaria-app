import { useState, type FormEvent } from 'react';
import { axiosClient } from '../../../../api/axiosClient';
import type { Client } from '../../../../types/client';
import BotonSubmit from '../../../../components/ui/BotonSubmit';
import FormTitle from '../../../../components/ui/FormTitle';
import InputFlotante from '../../../../components/ui/InputFlotante';
import { MapPinIcon, PhoneIcon, UserIcon, UsersIcon } from '../../../../components/ui/icons';

interface ClientFormProps {
  onClientAdded: (client: Client) => void;
}

interface ClientFormData {
  contact_name: string;
  business_name: string;
  phone: string;
  address: string;
  notes: string;
}

const initialForm: ClientFormData = { contact_name: '', business_name: '', phone: '', address: '', notes: '' };

export function ClientForm({ onClientAdded }: ClientFormProps) {
  const [formData, setFormData] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field: keyof ClientFormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const response = await axiosClient.post<Client>('/clients', {
        ...formData,
        business_name: formData.business_name || undefined,
        notes: formData.notes || undefined,
      });
      onClientAdded(response.data);
      setFormData(initialForm);
    } catch {
      setError('No se pudo guardar el cliente. Revisa los datos e inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="flex flex-col gap-2.5" onSubmit={handleSubmit}>
      <FormTitle title="Registrar cliente" subtitle="Añade un nuevo contacto al directorio." icon={<UsersIcon className="h-5 w-5 text-caramelo" />} />
      <InputFlotante inputSize="sm" label="Nombre de contacto" value={formData.contact_name} onChange={(event) => updateField('contact_name', event.target.value)} required maxLength={100} icon={<UserIcon />} />
      <InputFlotante inputSize="sm" label="Negocio" value={formData.business_name} onChange={(event) => updateField('business_name', event.target.value)} maxLength={100} icon={<UsersIcon />} />
      <InputFlotante inputSize="sm" label="Teléfono" value={formData.phone} onChange={(event) => updateField('phone', event.target.value)} required maxLength={20} icon={<PhoneIcon />} />
      <InputFlotante inputSize="sm" label="Dirección" value={formData.address} onChange={(event) => updateField('address', event.target.value)} required icon={<MapPinIcon />} />
      <label className="flex flex-col gap-1 text-xs text-white/70">Notas<textarea className="min-h-16 resize-y rounded-xl border border-[#e4d3ca] bg-[#f8efe9] px-3 py-2 text-sm text-[#240103] outline-none transition focus:border-[#D57642] focus:ring-2 focus:ring-[#D57642]/25" value={formData.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="Notas adicionales" rows={2} /></label>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <BotonSubmit size="sm" isLoading={isSaving} loadingText="Guardando cliente" icon={<UsersIcon className="h-4 w-4" />}>Guardar cliente</BotonSubmit>
    </form>
  );
}