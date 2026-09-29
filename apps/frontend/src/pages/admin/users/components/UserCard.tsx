import type { AdminUser } from '../../../../types/admin-user';
import { PencilIcon, TrashIcon } from '../../../../components/ui/icons';

interface UserCardProps {
  user: AdminUser;
  isCurrentUser: boolean;
  isBusy: boolean;
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function UserCard({ user, isCurrentUser, isBusy, onToggleStatus, onEdit, onDelete }: UserCardProps) {
  return (
    <article className="flex min-w-0 flex-col gap-4 rounded-xl border border-white/10 bg-[#1a070b]/90 p-4 transition hover:border-caramelo/25 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-bold text-white">{user.name}</h3>
          {isCurrentUser && <span className="rounded-md border border-caramelo/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-caramelo">Tu cuenta</span>}
        </div>
        <p className="mt-1 truncate text-sm text-white/55">{user.email}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-md border border-white/10 px-2 py-1 text-white/70">{user.role === 'ADMIN' ? 'Administrador' : 'Vendedor'}</span>
          <span className={`rounded-md border px-2 py-1 ${user.is_active ? 'border-emerald-400/20 text-emerald-300' : 'border-white/10 text-white/45'}`}>{user.is_active ? 'Activo' : 'Inactivo'}</span>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <button type="button" onClick={onToggleStatus} disabled={isBusy || isCurrentUser} title={isCurrentUser ? 'No puedes cambiar el estado de tu propia cuenta' : user.is_active ? 'Desactivar usuario' : 'Activar usuario'} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 transition hover:border-caramelo/40 hover:text-caramelo disabled:cursor-not-allowed disabled:opacity-40">{user.is_active ? 'Desactivar' : 'Activar'}</button>
        <button type="button" onClick={onEdit} disabled={isBusy} aria-label={`Editar usuario ${user.name}`} title="Editar usuario" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-caramelo/30 bg-caramelo/5 text-caramelo transition hover:border-caramelo hover:bg-caramelo/10 disabled:opacity-50"><PencilIcon /></button>
        <button type="button" onClick={onDelete} disabled={isBusy || isCurrentUser} aria-label={`Eliminar usuario ${user.name}`} title={isCurrentUser ? 'No puedes eliminar tu propia cuenta' : 'Eliminar usuario'} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-300/20 bg-red-400/5 text-red-200/75 transition hover:border-red-300/50 hover:bg-red-400/10 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-40"><TrashIcon /></button>
      </div>
    </article>
  );
}