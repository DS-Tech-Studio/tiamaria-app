import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthContextType, User } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        return {
          token: storedToken,
          user: JSON.parse(storedUser) as User,
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
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setSession({ token: newToken, user: newUser });
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
