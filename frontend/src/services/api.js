import AsyncStorage from '@react-native-async-storage/async-storage';
import * as config from '../utils/config';
import EventBus from '../utils/eventBus';

function getBaseUrl() {
  const fn = config.getApiBaseUrlAsync;
  if (typeof fn === 'function') return fn();
  return Promise.resolve(config.API_BASE_URL || 'http://10.0.2.2:8000/api/security/v1.0.0');
}

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};
const REQUEST_TIMEOUT_MS = 30000;

/**
 * Cliente HTTP con fetch (compatible con React Native, sin axios/crypto).
 * Expone la misma interfaz que axios: api.get(), api.post(), etc. con response.data, response.status.
 */
async function request(method, url, data = undefined, config = {}) {
  const token = await AsyncStorage.getItem('auth_token');
  const headers = {
    ...DEFAULT_HEADERS,
    ...config.headers,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const baseUrl = await getBaseUrl();
  let fullUrl = url.startsWith('http') ? url : `${baseUrl.replace(/\/$/, '')}${url.startsWith('/') ? url : '/' + url}`;
  if (config.params && typeof config.params === 'object') {
    const clean = Object.fromEntries(
      Object.entries(config.params).filter(([, v]) => v !== undefined && v !== null)
    );
    const search = new URLSearchParams(clean).toString();
    if (search) fullUrl += (fullUrl.includes('?') ? '&' : '?') + search;
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout ?? REQUEST_TIMEOUT_MS);

  const options = {
    method,
    headers,
    signal: controller.signal,
    ...config,
  };
  if (data !== undefined && data !== null && method !== 'GET') {
    options.body = typeof data === 'string' ? data : JSON.stringify(data);
  }

  let response;
  try {
    response = await fetch(fullUrl, options);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutErr = new Error(
        'La solicitud tardó demasiado. Revisa: 1) Backend encendido (docker compose up). 2) En celular: misma WiFi que el PC y en config.js USAR_DISPOSITIVO_FISICO = true con la IP correcta (ipconfig).'
      );
      timeoutErr.name = 'AbortError';
      throw timeoutErr;
    }
    throw err;
  }
  clearTimeout(timeoutId);
  const contentType = response.headers.get('content-type');
  let dataResp = null;
  const text = await response.text();
  if (text) {
    if (contentType && contentType.includes('application/json')) {
      try {
        dataResp = JSON.parse(text);
      } catch {
        dataResp = text;
      }
    } else {
      dataResp = text;
    }
  }

  const responseObj = {
    data: dataResp,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    config: { url, method },
  };

  // Interceptor de respuesta: 401 → logout
  if (response.status === 401) {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('user_data');
    EventBus.emit('auth:logout');
  }

  // Igual que axios: lanzar en 4xx/5xx para que catch use error.response
  if (!response.ok) {
    const err = new Error(response.statusText || `HTTP ${response.status}`);
    err.response = responseObj;
    err.request = { url: fullUrl, method };
    throw err;
  }

  return responseObj;
}

const api = {
  get: (url, config = {}) => request('GET', url, undefined, config),
  post: (url, data, config = {}) => request('POST', url, data, config),
  put: (url, data, config = {}) => request('PUT', url, data, config),
  patch: (url, data, config = {}) => request('PATCH', url, data, config),
  delete: (url, config = {}) => request('DELETE', url, undefined, config),
  request,
};

// Interceptores por compatibilidad (no-op; la lógica ya está en request())
api.interceptors = {
  request: { use: () => {} },
  response: { use: () => {} },
};

export default api;
