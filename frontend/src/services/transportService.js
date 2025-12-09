import api from './api';
import { API_ENDPOINTS } from '../utils/config';

class TransportService {
  // Solicitudes de viaje
  async crearSolicitud(data) {
    try {
      const response = await api.post(
        `${API_ENDPOINTS.TRANSPORT.SOLICITUDES}crear/`,
        data,
      );
      return { success: true, data: response.data };
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
          params: { lat, lng, radio },
        },
      );
      return { success: true, data: response.data };
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
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al aceptar solicitud',
      };
    }
  }

  async obtenerEstadoSolicitud(solicitudId) {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.TRANSPORT.SOLICITUDES}${solicitudId}/estado/`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener estado',
      };
    }
  }

  async cancelarSolicitud(solicitudId) {
    try {
      const response = await api.post(
        `${API_ENDPOINTS.TRANSPORT.SOLICITUDES}cancelar/`,
        { solicitud_id: solicitudId },
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cancelar solicitud',
      };
    }
  }

  async listarConductoresDisponibles(lat, lng, radio = 5) {
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

  // Viajes
  async obtenerMisViajes() {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.TRANSPORT.VIAJES}mis_viajes/`,
      );
      return { success: true, data: response.data };
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
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener viaje',
      };
    }
  }

  async enCaminoOrigen(viajeId) {
    try {
      const response = await api.post(
        `${API_ENDPOINTS.TRANSPORT.VIAJES}${viajeId}/en_camino_origen/`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar estado',
      };
    }
  }

  async llegarOrigen(viajeId) {
    try {
      const response = await api.post(
        `${API_ENDPOINTS.TRANSPORT.VIAJES}${viajeId}/llegar_origen/`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar estado',
      };
    }
  }

  async iniciarViaje(viajeId) {
    try {
      const response = await api.post(
        `${API_ENDPOINTS.TRANSPORT.VIAJES}${viajeId}/iniciar/`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al iniciar viaje',
      };
    }
  }

  async completarViaje(viajeId, precioFinal = null) {
    try {
      console.log('📡 Completar viaje - Request:', { viajeId, precioFinal, tipo: typeof precioFinal });
      
      const payload = {};
      if (precioFinal !== null && precioFinal !== undefined && precioFinal !== '') {
        const precioNum = typeof precioFinal === 'string' ? parseFloat(precioFinal) : precioFinal;
        if (!isNaN(precioNum) && precioNum > 0) {
          payload.precio_final = precioNum;
        }
      }
      
      console.log('📡 Payload enviado:', payload);
      
      const response = await api.post(
        `${API_ENDPOINTS.TRANSPORT.VIAJES}${viajeId}/completar/`,
        payload,
      );
      
      console.log('📡 Completar viaje - Response:', response.data);
      
      // Verificar el formato de respuesta del backend
      const responseData = response.data;
      const isSuccess = responseData?.is_success !== false && 
                       (responseData?.is_success === true || 
                        responseData?.message || 
                        response.status === 200);
      
      return { 
        success: isSuccess, 
        data: responseData,
        message: responseData?.message || 'Viaje completado',
        error: isSuccess ? null : (responseData?.message || 'Error desconocido'),
      };
    } catch (error) {
      console.error('❌ Error en completarViaje:', error);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error response status:', error.response?.status);
      
      let errorMessage = 'Error al completar viaje';
      if (error.response?.data) {
        errorMessage = error.response.data.message || 
                      error.response.data.error || 
                      error.response.data.detail ||
                      errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      };
    }
  }

  async cancelarViaje(viajeId) {
    try {
      const response = await api.post(
        `${API_ENDPOINTS.TRANSPORT.VIAJES}${viajeId}/cancelar/`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cancelar viaje',
      };
    }
  }
}

export default new TransportService();




