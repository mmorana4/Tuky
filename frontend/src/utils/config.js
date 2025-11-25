// Configuración de la API
export const API_BASE_URL = __DEV__
  ? 'http://localhost:8000/api/v1_0_0'
  : 'https://api.tukymotos.com/api/v1_0_0';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/sign-in',
    REGISTER: '/auth/register/',
    LOGOUT: '/auth/sign-out',
  },
  TRANSPORT: {
    SOLICITUDES: '/transport/solicitudes/',
    VIAJES: '/transport/viajes/',
    CONDUCTORES: '/transport/conductores/',
    MOTOS: '/transport/motos/',
    CALIFICACIONES: '/transport/calificaciones/',
  },
};

