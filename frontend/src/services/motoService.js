import api from './api';
import {API_ENDPOINTS} from '../utils/config';

class MotoService {
  async registrarMoto(data) {
    try {
      const response = await api.post(
        `${API_ENDPOINTS.TRANSPORT.MOTOS}crear/`,
        data,
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrar moto',
      };
    }
  }

  async listarMotos() {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.TRANSPORT.MOTOS}listar/`,
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener motos',
      };
    }
  }

  async obtenerDetalleMoto(motoId) {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.TRANSPORT.MOTOS}${motoId}/detalle/`,
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener moto',
      };
    }
  }

  async actualizarMoto(motoId, data) {
    try {
      const response = await api.put(
        `${API_ENDPOINTS.TRANSPORT.MOTOS}${motoId}/actualizar/`,
        data,
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar moto',
      };
    }
  }

  async eliminarMoto(motoId) {
    try {
      const response = await api.delete(
        `${API_ENDPOINTS.TRANSPORT.MOTOS}${motoId}/eliminar/`,
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar moto',
      };
    }
  }

  async activarMoto(motoId) {
    try {
      const response = await api.post(
        `${API_ENDPOINTS.TRANSPORT.MOTOS}${motoId}/activar/`,
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al activar moto',
      };
    }
  }

  async subirFotoMoto(motoId, foto) {
    try {
      const formData = new FormData();
      formData.append('foto', {
        uri: foto.uri,
        type: 'image/jpeg',
        name: 'foto.jpg',
      });

      const response = await api.post(
        `${API_ENDPOINTS.TRANSPORT.MOTOS}${motoId}/subir_foto/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al subir foto',
      };
    }
  }
}

export default new MotoService();




