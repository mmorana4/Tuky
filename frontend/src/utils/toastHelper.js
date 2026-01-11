// Helper para mostrar notificaciones con mejor estilo
// Reemplaza Alert.alert() con notificaciones más atractivas

import { Alert } from 'react-native';

// Esta función se puede usar como reemplazo directo de Alert.alert
// pero requiere que el componente tenga acceso a useToast
// Para facilitar la migración, también exportamos una versión que usa Alert como fallback

export const showToast = (toast, message, type = 'info') => {
  if (toast) {
    switch (type) {
      case 'success':
        toast.showSuccess(message);
        break;
      case 'error':
        toast.showError(message);
        break;
      case 'warning':
        toast.showWarning(message);
        break;
      case 'info':
      default:
        toast.showInfo(message);
        break;
    }
  } else {
    // Fallback a Alert si toast no está disponible
    Alert.alert(type === 'error' ? 'Error' : type === 'success' ? 'Éxito' : 'Información', message);
  }
};

// Helper para mostrar diálogos de confirmación (mantener Alert para estos casos)
export const showConfirm = (title, message, onConfirm, onCancel) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancelar',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'Confirmar',
        onPress: onConfirm,
        style: 'default',
      },
    ],
    { cancelable: true }
  );
};
