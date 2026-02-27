/**
 * GeoService v2.0 — Cliente frontend para los endpoints geo del backend.
 * Reemplaza las llamadas directas a Google Maps APIs.
 *
 * Endpoints:
 *   GET /geo/autocomplete?q=texto&countrycodes=ec
 *   GET /geo/geocode?q=direccion&countrycodes=ec
 *   GET /geo/reverse?lat=&lng=
 *   GET /geo/route?origin=lat,lng&destination=lat,lng
 */
import api from './api'; // Reutiliza el cliente axios del proyecto (con JWT automático)

const GeoService = {
    /**
     * Autocompletado de lugares con Photon (OpenStreetMap).
     * @returns {Promise<Array>} Lista de sugerencias { id, description, mainText, secondaryText, latitude, longitude }
     */
    autocomplete: async (query, countrycodes = 'ec', limit = 5) => {
        const response = await api.get('/geo/autocomplete', {
            params: { q: query, countrycodes, limit },
        });
        return response.data.predictions ?? [];
    },

    /**
     * Geocodificación directa con Nominatim.
     * @returns {Promise<{latitude, longitude, address}>}
     */
    geocode: async (query, countrycodes = 'ec') => {
        const response = await api.get('/geo/geocode', {
            params: { q: query, countrycodes },
        });
        if (response.data.status !== 'OK') {
            throw new Error(response.data.error_message || 'No se encontró la dirección');
        }
        return response.data.result;
    },

    /**
     * Geocodificación inversa con Nominatim (lat/lng → dirección legible).
     * @returns {Promise<{latitude, longitude, address}>}
     */
    reverseGeocode: async (latitude, longitude) => {
        const response = await api.get('/geo/reverse', {
            params: { lat: latitude, lng: longitude },
        });
        if (response.data.status !== 'OK') {
            throw new Error(response.data.error_message || 'No se pudo obtener la dirección');
        }
        return response.data.result;
    },

    /**
     * Cálculo de ruta con OSRM.
     * @param {{ latitude, longitude }} origin
     * @param {{ latitude, longitude }} destination
     * @returns {Promise<{ polyline, distance_km, duration_minutes, geometry }>}
     */
    route: async (origin, destination) => {
        const response = await api.get('/geo/route', {
            params: {
                origin: `${origin.latitude},${origin.longitude}`,
                destination: `${destination.latitude},${destination.longitude}`,
            },
        });
        if (response.data.status !== 'OK') {
            throw new Error(response.data.error_message || 'No se pudo calcular la ruta');
        }
        return response.data.route;
    },
};

export default GeoService;
