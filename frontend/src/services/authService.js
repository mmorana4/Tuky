import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../utils/config';

class AuthService {
  async login(username, password) {
    try {
      console.log('=== AUTH SERVICE LOGIN ===');
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        username,
        password,
      });

      const data = response.data || {};
      if (!data.is_success) {
        return {
          success: false,
          error: data.message || 'Error al iniciar sesión',
        };
      }

      const aData = data.aData || {};
      const access = aData.access;
      const refresh = aData.refresh;
      const user = aData.user;

      if (!access || !user) {
        return {
          success: false,
          error: data.message || 'Respuesta del servidor incompleta',
        };
      }

      await AsyncStorage.setItem('auth_token', access);
      await AsyncStorage.setItem('refresh_token', refresh || '');
      await AsyncStorage.setItem('user_data', JSON.stringify(user));

      return { success: true, user, token: access };
    } catch (error) {
      console.error('Login error:', error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        'Error al iniciar sesión. Comprueba la conexión.';
      return { success: false, error: message };
    }
  }

  async register(userData) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      console.log('Register response:', response.data);

      if (response.data.is_success) {
        return { success: true, message: 'Usuario registrado exitosamente' };
      } else {
        return { success: false, error: response.data.message || 'Error al registrar' };
      }
    } catch (error) {
      console.error('Register error:', error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        (Array.isArray(error.response?.data) ? error.response.data.map(item => (item && (item.message || item)) || '').join(', ') : null) ||
        error.message ||
        'Error al registrar usuario. Comprueba la conexión y que la URL del backend sea correcta.';
      return { success: false, error: message };
    }
  }

  async logout() {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('user_data');
    }
  }

  async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  async isAuthenticated() {
    const token = await AsyncStorage.getItem('auth_token');
    return !!token;
  }
}

export default new AuthService();




