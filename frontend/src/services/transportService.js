import api from './api';
import {API_ENDPOINTS} from '../utils/config';

class TransportService {
  // Solicitudes de viaje
  async crearSolicitud(data) {
    try {
      const response = await api.post(
        `${API_ENDPOINTS.TRANSPORT.SOLICITUDES}crear/`,
        data,
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear solicitud',
      };
    }
  }

  async listarSolicitudesDisponibles(lat, lng, radio = 5) {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.TRANSPORT.SOLICITUDES}disponibles/`,
        {
          params: {lat, lng, radio},
        },
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener solicitudes',
      };
    }
  }

  async aceptarSolicitud(solicitudId, motoId = null) {
    try {
      const response = await api.post(
        `${API_ENDPOINTS.TRANSPORT.SOLICITUDES}aceptar/`,
        {
          solicitud_id: solicitudId,
          moto_id: motoId,
        },
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al aceptar solicitud',
      };
    }
  }

  async cancelarSolicitud(solicitudId) {
    try {
      const response = await api.post(
        `${API_ENDPOINTS.TRANSPORT.SOLICITUDES}cancelar/`,
        {
          solicitud_id: solicitudId,
        },
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cancelar solicitud',
      };
    }
  }

  // Viajes
  async obtenerMisViajes() {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.TRANSPORT.VIAJES}mis_viajes/`,
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener viajes',
      };
    }
  }

  async obtenerDetalleViaje(viajeId) {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.TRANSPORT.VIAJES}${viajeId}/detalle/`,
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener viaje',
      };
    }
  }

  async iniciarViaje(viajeId) {
    try {
      const response = await api.post(
        `${API_ENDPOINTS.TRANSPORT.VIAJES}${viajeId}/iniciar/`,
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al iniciar viaje',
      };
    }
  }

  async completarViaje(viajeId, precioFinal = null) {
    try {
      const response = await api.post(
        `${API_ENDPOINTS.TRANSPORT.VIAJES}${viajeId}/completar/`,
        {
          precio_final: precioFinal,
        },
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al completar viaje',
      };
    }
  }

  async cancelarViaje(viajeId) {
    try {
      const response = await api.post(
        `${API_ENDPOINTS.TRANSPORT.VIAJES}${viajeId}/cancelar/`,
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cancelar viaje',
      };
    }
  }
}

export default new TransportService();




