import { useState, type FormEvent } from 'react';
import { axiosClient } from '../../../../api/axiosClient';
import BotonSubmit from '../../../../components/ui/BotonSubmit';
import { Dropdown } from '../../../../components/ui/Dropdown';
import InputFlotante from '../../../../components/ui/InputFlotante';
import { PencilIcon, UserIcon } from '../../../../components/ui/icons';
import type { AdminUser, AdminUserRole } from '../../../../types/admin-user';

interface UserEditModalProps {
  user: AdminUser;
  isCurrentUser: boolean;
  onClose: () => void;
  onSaved: (user: AdminUser) => void;
}

export function UserEditModal({ user, isCurrentUser, onClose, onSaved }: UserEditModalProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<AdminUserRole>(user.role);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const response = await axiosClient.patch<AdminUser>(`/users/${user.id}`, {
        name: name.trim(),
        email: email.trim(),
        role,
      });
      onSaved(response.data);
    } catch {
      setError('No se pudo actualizar el usuario. Verifica el correo y los datos ingresados.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4" role="presentation" onMouseDown={onClose}>
      <section className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#26080e] p-4 shadow-2xl sm:p-6" role="dialog" aria-modal="true" aria-labelledby="edit-user-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="mb-5 flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-caramelo">Administración</p>
            <h2 id="edit-user-title" className="mt-1 font-serif text-xl font-bold text-white">Editar usuario</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar edición" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xl text-white/55 transition hover:bg-white/10 hover:text-white">×</button>
        </header>
        <form className="grid grid-cols-1 gap-3 sm:grid-cols-2" onSubmit={handleSubmit}>
          <InputFlotante inputSize="sm" label="Nombre completo" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} icon={<UserIcon />} />
          <InputFlotante inputSize="sm" label="Correo electrónico" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={100} />
          <label className="flex flex-col gap-1 text-xs text-white/70">
            Rol
            <Dropdown
              value={role}
              onChange={(value) => setRole(value as AdminUserRole)}
              options={[{ label: 'Vendedor', value: 'VENDEDOR' }, { label: 'Administrador', value: 'ADMIN' }]}
              disabled={isCurrentUser}
              ariaLabel="Seleccionar rol"
              triggerClassName="h-[3.25rem] rounded-xl border border-[#e4d3ca] bg-[#f8efe9] px-3 text-sm text-[#240103] outline-none focus:border-[#D57642] focus:ring-2 focus:ring-[#D57642]/25 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
          {error && <p className="rounded-lg border border-red-400/25 bg-red-950/30 px-3 py-2 text-xs text-red-200 sm:col-span-2" role="alert">{error}</p>}
          <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/5">Cancelar</button>
            <BotonSubmit size="sm" isLoading={isSaving} loadingText="Guardando cambios" icon={<PencilIcon className="h-4 w-4" />}>Guardar cambios</BotonSubmit>
          </div>
        </form>
      </section>
    </div>
  );
}