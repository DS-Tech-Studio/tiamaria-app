import { axiosClient } from '../api/axiosClient';
import type { AuthResponse } from '../types/api';

export const loginRequest = async (credentials: { email: string; password: string }) => {
  const response = await axiosClient.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};