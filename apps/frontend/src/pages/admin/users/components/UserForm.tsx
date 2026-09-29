import { useState, type FormEvent } from 'react';
import { axiosClient } from '../../../../api/axiosClient';
import BotonSubmit from '../../../../components/ui/BotonSubmit';
import FormTitle from '../../../../components/ui/FormTitle';
import InputFlotante from '../../../../components/ui/InputFlotante';
import { UserIcon, UsersIcon } from '../../../../components/ui/icons';
import type { AdminUser, AdminUserRole } from '../../../../types/admin-user';

interface UserFormProps {
  onUserAdded: (user: AdminUser) => void;
}

const initialForm = { name: '', email: '', password: '', role: 'VENDEDOR' as AdminUserRole };

export function UserForm({ onUserAdded }: UserFormProps) {
  const [formData, setFormData] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const response = await axiosClient.post<AdminUser>('/users', {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
      });
      onUserAdded(response.data);
      setFormData(initialForm);
    } catch {
      setError('No se pudo registrar el usuario. Verifica que el correo no esté registrado.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="grid grid-cols-1 gap-3 sm:grid-cols-2" onSubmit={handleSubmit}>
      <div className="sm:col-span-2">
        <FormTitle title="Nuevo usuario" subtitle="Crea una cuenta para el equipo." icon={<UsersIcon className="h-5 w-5 text-caramelo" />} />
      </div>
      <InputFlotante inputSize="sm" label="Nombre completo" value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} required maxLength={100} autoComplete="name" icon={<UserIcon />} />
      <InputFlotante inputSize="sm" label="Correo electrónico" type="email" value={formData.email} onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))} required maxLength={100} autoComplete="email" />
      <InputFlotante inputSize="sm" label="Contraseña" type="password" value={formData.password} onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))} required minLength={6} autoComplete="new-password" />
      <label className="flex flex-col gap-1 text-xs text-white/70">
        Rol
        <select value={formData.role} onChange={(event) => setFormData((current) => ({ ...current, role: event.target.value as AdminUserRole }))} className="h-[3.25rem] rounded-xl border border-[#e4d3ca] bg-[#f8efe9] px-3 text-sm text-[#240103] outline-none focus:border-[#D57642] focus:ring-2 focus:ring-[#D57642]/25">
          <option value="VENDEDOR">Vendedor</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </label>
      {error && <p className="text-sm text-red-300 sm:col-span-2" role="alert">{error}</p>}
      <div className="sm:col-span-2">
        <BotonSubmit size="sm" isLoading={isSaving} loadingText="Guardando usuario" icon={<UsersIcon className="h-4 w-4" />}>Agregar usuario</BotonSubmit>
      </div>
    </form>
  );
}