// Utilidades de geolocalización

/**
 * Calcula la distancia entre dos puntos en kilómetros usando la fórmula de Haversine
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

const toRad = (degrees) => {
  return (degrees * Math.PI) / 180;
};

/**
 * Calcula el tiempo estimado en minutos basado en la distancia
 * Asume velocidad promedio de 30 km/h en ciudad
 */
export const calculateEstimatedTime = (distanceKm) => {
  const velocidadPromedio = 30; // km/h
  const tiempoHoras = distanceKm / velocidadPromedio;
  return Math.round(tiempoHoras * 60); // minutos
};

/**
 * Calcula el precio sugerido basado en la distancia
 * Tarifa base: $2.00 + $0.50 por km
 */
export const calculateSuggestedPrice = (distanceKm) => {
  const tarifaBase = 2.0;
  const precioPorKm = 0.5;
  return tarifaBase + distanceKm * precioPorKm;
};


