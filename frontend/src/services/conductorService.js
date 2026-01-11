import api from './api';
import { API_ENDPOINTS } from '../utils/config';

class ConductorService {
  async registrarConductor(data) {
    try {
      const response = await api.post(
        `${API_ENDPOINTS.TRANSPORT.CONDUCTORES}registrar/`,
        data,
      );
      return { success: true, data: response.data };
    } catch (error) {
      // Mejorar el manejo de errores
      let errorMessage = 'Error al registrar conductor';
      
      if (error.response?.data) {
        const data = error.response.data;
        if (data.message) {
          errorMessage = data.message;
          // Si el mensaje es un array, convertirlo a string
          if (Array.isArray(errorMessage)) {
            errorMessage = errorMessage.join(', ');
          }
          // Limpiar formato de array si viene como string
          if (typeof errorMessage === 'string' && errorMessage.includes('[')) {
            errorMessage = errorMessage.replace(/[\[\]']/g, '');
          }
        } else if (data.error) {
          errorMessage = data.error;
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async obtenerPerfil() {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.TRANSPORT.CONDUCTORES}perfil/`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener perfil',
      };
    }
  }

  async actualizarPerfil(data) {
    try {
      const response = await api.put(
        `${API_ENDPOINTS.TRANSPORT.CONDUCTORES}actualizar/`,
        data,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar perfil',
      };
    }
  }

  async actualizarUbicacion(lat, lng) {
    try {
      const response = await api.post(
        `${API_ENDPOINTS.TRANSPORT.CONDUCTORES}actualizar_ubicacion/`,
        { lat, lng },
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar ubicación',
      };
    }
  }

  async cambiarEstado(estado) {
    console.log('🔄 ConductorService: Cabiando estado a:', estado);
    try {
      const response = await api.post(
        `${API_ENDPOINTS.TRANSPORT.CONDUCTORES}cambiar_estado/`,
        { estado },
      );
      console.log('✅ ConductorService: Respuesta:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ ConductorService: Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cambiar estado',
      };
    }
  }

  async listarDisponibles(lat, lng, radio = 5) {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.TRANSPORT.CONDUCTORES}disponibles/`,
        {
          params: { lat, lng, radio },
        },
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener conductores',
      };
    }
  }
}

export default new ConductorService();




