import api from './api';
import {API_ENDPOINTS} from '../utils/config';

class ConductorService {
  async registrarConductor(data) {
    try {
      const response = await api.post(
        `${API_ENDPOINTS.TRANSPORT.CONDUCTORES}registrar/`,
        data,
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrar conductor',
      };
    }
  }

  async obtenerPerfil() {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.TRANSPORT.CONDUCTORES}perfil/`,
      );
      return {success: true, data: response.data};
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
      return {success: true, data: response.data};
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
        {lat, lng},
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar ubicación',
      };
    }
  }

  async cambiarEstado(estado) {
    try {
      const response = await api.post(
        `${API_ENDPOINTS.TRANSPORT.CONDUCTORES}cambiar_estado/`,
        {estado},
      );
      return {success: true, data: response.data};
    } catch (error) {
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
          params: {lat, lng, radio},
        },
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener conductores',
      };
    }
  }
}

export default new ConductorService();




