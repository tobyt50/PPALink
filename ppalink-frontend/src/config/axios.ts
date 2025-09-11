import axios from 'axios';
import { useAuthStore } from '../context/AuthContext'; // 1. Import the store

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Use the interceptor to add the token to every request
apiClient.interceptors.request.use((config) => {
  // 2. Get the token from the Zustand store
  const token = useAuthStore.getState().token;
  
  // 3. If the token exists, add it to the Authorization header
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default apiClient;