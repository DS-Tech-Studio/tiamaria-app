// src/types/api.ts

// Respuesta genérica del backend
export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode?: number;
}

// Estructura de usuario/sesión
export type Role = 'ADMIN' | 'VENDEDOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt?: string;
}

// Estructura de respuesta al autenticarse
export interface AuthResponse {
  accessToken: string;
  user: User;
}