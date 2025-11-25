// Utilidades para formatear datos

export const formatPrice = (price) => {
  if (!price) return '$0.00';
  return `$${parseFloat(price).toFixed(2)}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDistance = (km) => {
  if (!km) return '0 km';
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(2)} km`;
};

export const formatTime = (minutes) => {
  if (!minutes) return '0 min';
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
};

export const formatEstado = (estado) => {
  const estados = {
    solicitado: 'Solicitado',
    aceptado: 'Aceptado',
    en_camino_origen: 'En camino al origen',
    llegado_origen: 'Llegado al origen',
    en_viaje: 'En viaje',
    completado: 'Completado',
    cancelado: 'Cancelado',
  };
  return estados[estado] || estado;
};


