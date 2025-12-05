// Configuración de la API
// Para emulador Android usar: 10.0.2.2 (alias de localhost del host)
// Para dispositivo físico usar: IP local de tu máquina (ej: 192.168.1.x)
// Para iOS simulador usar: localhost
import {Platform} from 'react-native';

const getApiUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Para dispositivo físico: usar la IP WiFi de tu máquina
      // IMPORTANTE: Asegúrate de que tu celular y PC estén en la misma red WiFi
      // Si usas emulador, cambia a: 'http://10.0.2.2:8000/api/security/v1.0.0'
      return 'http://192.168.1.101:8000/api/security/v1.0.0';
    } else {
      // Para iOS simulador o desarrollo web
      return 'http://localhost:8000/api/security/v1.0.0';
    }
  }
  return 'https://api.tukymotos.com/api/security/v1.0.0';
};

export const API_BASE_URL = getApiUrl();

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

