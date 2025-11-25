import api from './api';
import {API_ENDPOINTS} from '../utils/config';

class CalificacionService {
  async calificar(viajeId, calificadoId, puntuacion, comentario = '') {
    try {
      const response = await api.post(
        `${API_ENDPOINTS.TRANSPORT.CALIFICACIONES}calificar/`,
        {
          viaje: viajeId,
          calificado: calificadoId,
          puntuacion,
          comentario,
        },
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al calificar',
      };
    }
  }

  async obtenerMisCalificaciones() {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.TRANSPORT.CALIFICACIONES}mis_calificaciones/`,
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener calificaciones',
      };
    }
  }

  async obtenerCalificacionesRecibidas() {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.TRANSPORT.CALIFICACIONES}recibidas/`,
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener calificaciones',
      };
    }
  }
}

export default new CalificacionService();


