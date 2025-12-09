import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/config';
import EventBus from '../utils/eventBus';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('auth_token');
    // console.log('🔑 API Request - Token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      console.log('❌ API: 401 Unauthorized detected. Triggering logout.');
      // Token expirado o inválido - limpiar datos de autenticación
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('user_data');

      // Notificar al AuthContext para que actualice el estado
      EventBus.emit('auth:logout');
    }
    return Promise.reject(error);
  },
);

export default api;




