import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthContextType, Role, User } from '../types/auth';

type StoredUser = Partial<User> & { name?: string };

const normalizeRole = (role?: string | null): Role => {
  const normalized = (role ?? '').toString().trim().toUpperCase();

  if (normalized === 'ADMIN') return 'ADMIN';
  if (normalized === 'CLIENTE') return 'CLIENTE';
  return 'VENDEDOR';
};

const normalizeUser = (user: StoredUser | null): User | null => {
  if (!user) return null;

  return {
    id: String(user.id ?? ''),
    email: String(user.email ?? ''),
    fullName: (user.fullName ?? user.name ?? 'Usuario').toString().trim() || 'Usuario',
    role: normalizeRole(user.role),
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as StoredUser;
        return {
          token: storedToken,
          user: normalizeUser(parsedUser),
        };
      } catch (error) {
        console.error('Error al deserializar el usuario guardado:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    return { token: null, user: null };
  });

  const login = (newToken: string, newUser: User) => {
    const normalizedUser = normalizeUser(newUser);
    if (!normalizedUser) return;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setSession({ token: newToken, user: normalizedUser });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setSession({ token: null, user: null });
  };

  return (
    <AuthContext.Provider
      value={{
        user: session.user,
        token: session.token,
        isAuthenticated: !!session.token && !!session.user,
        isLoading: false,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
