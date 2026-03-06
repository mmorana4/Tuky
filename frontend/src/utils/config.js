// Configuración de la API
// Emulador: USAR_DISPOSITIVO_FISICO = false (usa 10.0.2.2 = localhost del PC)
// Celular físico: USAR_DISPOSITIVO_FISICO = true y pon abajo la IP de tu PC (ipconfig)
import { Platform } from 'react-native';

// Cambia a true solo cuando pruebes en celular físico en la misma WiFi que el PC
const USAR_DISPOSITIVO_FISICO = false;
const IP_PC_EN_WIFI = '192.168.41.148';

const PRODUCTION_URL = 'https://tuky-production.up.railway.app/api/security/v1.0.0';

function getDevBaseUrl() {
  if (Platform.OS === 'ios') return 'http://localhost:8000/api/security/v1.0.0';
  const host = USAR_DISPOSITIVO_FISICO ? IP_PC_EN_WIFI : '10.0.2.2';
  return `http://${host}:8000/api/security/v1.0.0`;
}

export function getApiBaseUrlAsync() {
  const url = typeof __DEV__ !== 'undefined' && !__DEV__ ? PRODUCTION_URL : getDevBaseUrl();
  return Promise.resolve(url);
}

export const API_BASE_URL = typeof __DEV__ !== 'undefined' && !__DEV__
  ? PRODUCTION_URL
  : getDevBaseUrl();

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

