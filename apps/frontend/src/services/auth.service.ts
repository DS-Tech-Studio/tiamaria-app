import { axiosClient } from '../api/axiosClient';
import type { AuthResponse, ApiResponse } from '../types/api';

export const loginRequest = async (credentials: { email: string; password: string }) => {
  const response = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
  return response.data;
};