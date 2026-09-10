// src/api/axiosClient.ts
import axios from 'axios';

// Usamos la variable de entorno configurada previamente en Vite
const API_URL = import.meta.env.VITE_API_URL;

export const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});