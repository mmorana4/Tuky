import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../utils/config';

class AuthService {
  async login(username, password) {
    try {
      console.log('=== AUTH SERVICE LOGIN ===');
      console.log('Logging in user:', username);

      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        username,
        password,
      });

      console.log('Backend response:', JSON.stringify(response.data, null, 2));

      // Backend returns: {is_success, message, aData: {access, refresh, user}}
      if (!response.data.is_success) {
        console.log('Login failed:', response.data.message);
        return {
          success: false,
          error: response.data.message || 'Error al iniciar sesión',
        };
      }

      const { access, refresh, user } = response.data.aData;

      console.log('Extracted - access:', access ? 'Present' : 'MISSING');
      console.log('Extracted - refresh:', refresh ? 'Present' : 'MISSING');
      console.log('Extracted - user:', JSON.stringify(user, null, 2));

      // Guardar tokens y datos del usuario
      await AsyncStorage.setItem('auth_token', access);
      await AsyncStorage.setItem('refresh_token', refresh);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));

      console.log('Data saved to AsyncStorage');
      console.log('Returning success with user');

      return { success: true, user, token: access };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al iniciar sesión',
      };
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




