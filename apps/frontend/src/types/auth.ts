export type Role = 'ADMIN' | 'VENDEDOR' | 'CLIENTE';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
}
