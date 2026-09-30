import { useEffect, useMemo, useState } from 'react';
import { axiosClient } from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import type { AdminUser } from '../../types/admin-user';
import { UserCard } from './users/components/UserCard';
import { UserControls } from './users/components/UserControls';
import { UserEditModal } from './users/components/UserEditModal';
import { UserForm } from './users/components/UserForm';

const getApiError = (error: unknown, fallback: string) => {
  const response = (error as { response?: { data?: { message?: string | string[] } } }).response;
  const message = response?.data?.message;
  return Array.isArray(message) ? message.join(' ') : message || fallback;
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await axiosClient.get<AdminUser[]>('/users');
        setUsers(response.data);
      } catch {
        setError('No fue posible cargar los usuarios registrados.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return users.filter((candidate) => {
      const matchesSearch = !normalizedSearch || [candidate.name, candidate.email].some((value) => value.toLowerCase().includes(normalizedSearch));
      const matchesStatus = !status || candidate.is_active === (status === 'active');
      return matchesSearch && matchesStatus;
    });
  }, [users, search, status]);

  const handleUserAdded = (newUser: AdminUser) => {
    setUsers((current) => [newUser, ...current]);
    setError('');
  };

  const handleUserUpdated = (updatedUser: AdminUser) => {
    setUsers((current) => current.map((candidate) => candidate.id === updatedUser.id ? updatedUser : candidate));
    setEditingUser(null);
    setError('');
  };

  const handleToggleStatus = async (candidate: AdminUser) => {
    setBusyUserId(candidate.id);
    setError('');
    try {
      const response = await axiosClient.patch<AdminUser>(`/users/${candidate.id}/toggle-status`);
      setUsers((current) => current.map((item) => item.id === candidate.id ? response.data : item));
    } catch (requestError) {
      setError(getApiError(requestError, `No fue posible cambiar el estado de ${candidate.name}.`));
    } finally {
      setBusyUserId(null);
    }
  };

  const handleDelete = async (candidate: AdminUser) => {
    if (!window.confirm(`¿Eliminar a ${candidate.name}? Esta acción no se puede deshacer.`)) return;

    setBusyUserId(candidate.id);
    setError('');
    try {
      await axiosClient.delete(`/users/${candidate.id}`);
      setUsers((current) => current.filter((item) => item.id !== candidate.id));
    } catch (requestError) {
      setError(getApiError(requestError, `No fue posible eliminar a ${candidate.name}. Si tiene órdenes registradas, desactiva su cuenta en su lugar.`));
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8 pb-10 lg:h-full lg:min-h-0 lg:overflow-hidden">
      <header className="border-b border-white/10 pb-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-caramelo">Administración</p>
        <h1 className="font-serif text-3xl font-bold text-white md:text-4xl">Usuarios</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/60">Administra las cuentas y permisos del equipo.</p>
      </header>

      <div className="grid items-start gap-8 lg:min-h-0 lg:flex-1 lg:grid-cols-12">
        <section className="rounded-2xl border border-white/10 bg-[#1a070b]/90 p-5 shadow-xl lg:col-span-5">
          <UserForm onUserAdded={handleUserAdded} />
        </section>

        <section className="flex min-h-0 flex-col gap-5 lg:col-span-7 lg:overflow-hidden">
          <UserControls search={search} status={status} onSearchChange={setSearch} onStatusChange={setStatus} />
          {error && <p className="rounded-xl border border-red-400/30 bg-red-950/30 p-4 text-sm text-red-200" role="alert">{error}</p>}
          <div className="min-h-0 flex-1 overflow-y-auto pb-4 scrollbar-hidden">
            {isLoading && <p className="py-10 text-center text-sm text-white/50">Cargando usuarios...</p>}
            {!isLoading && filteredUsers.length > 0 && <div className="grid gap-4">{filteredUsers.map((candidate) => (
              <UserCard
                key={candidate.id}
                user={candidate}
                isCurrentUser={candidate.id === currentUser?.id}
                isBusy={busyUserId === candidate.id}
                onToggleStatus={() => void handleToggleStatus(candidate)}
                onEdit={() => setEditingUser(candidate)}
                onDelete={() => void handleDelete(candidate)}
              />
            ))}</div>}
            {!isLoading && !error && filteredUsers.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/15 bg-[#1a070b]/50 p-10 text-center text-sm text-white/50">
                {users.length > 0 ? 'No hay usuarios que coincidan con los filtros.' : 'Todavía no hay usuarios registrados.'}
              </div>
            )}
          </div>
        </section>
      </div>

      {editingUser && <UserEditModal user={editingUser} isCurrentUser={editingUser.id === currentUser?.id} onClose={() => setEditingUser(null)} onSaved={handleUserUpdated} />}
    </div>
  );
}
