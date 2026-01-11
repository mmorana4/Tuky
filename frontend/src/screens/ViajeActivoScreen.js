import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Icon from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TransportService from '../services/transportService';
import ConductorService from '../services/conductorService';


const GOOGLE_MAPS_APIKEY = 'AIzaSyCUK0r2jPEqxWSMRj3GWmZRzo2hICdcq6o';


export default function ViajeActivoScreen({ route, navigation }) {
  const toast = useToast();
  const { viajeId } = route.params;
  const [viaje, setViaje] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrecioModal, setShowPrecioModal] = useState(false);
  const [precioFinal, setPrecioFinal] = useState('');
  const [completando, setCompletando] = useState(false);
  const [conductorLocation, setConductorLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: -2.170998,
    longitude: -79.922359,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const { user } = useAuth();

  useEffect(() => {
    cargarViaje();
    obtenerUbicacionUsuario();

    // Polling para actualizar estado cada 3 segundos
    const interval = setInterval(() => {
      cargarViaje();
      obtenerUbicacionUsuario(); // Actualizar ubicación del usuario
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Actualizar ubicación del conductor en el servidor si es conductor
  useEffect(() => {
    if (userLocation && viaje) {
      const esConductorLocal = viaje.conductor?.id === user?.id || user?.profile?.is_conductor;
      if (esConductorLocal) {
        // Actualizar ubicación en el servidor cada 5 segundos
        ConductorService.actualizarUbicacion(userLocation.latitude, userLocation.longitude);
      }
    }
  }, [userLocation, viaje, user]);

  const obtenerUbicacionUsuario = () => {
    Geolocation.getCurrentPosition(
      position => {
        const loc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(loc);
      },
      error => {
        console.log('Error obteniendo ubicación:', error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  const cargarViaje = async () => {
    try {
      const result = await TransportService.obtenerDetalleViaje(viajeId);
      setLoading(false);

      if (result.success) {
        const viajeData = result.data.aData?.viaje || result.data?.viaje;
        console.log('📦 Viaje cargado:', JSON.stringify(viajeData, null, 2));
        console.log('🔍 Estado del viaje:', viajeData?.estado);
        console.log('🔍 Tipo de estado:', typeof viajeData?.estado);
        setViaje(viajeData);
      } else {
        console.error('❌ Error al cargar viaje:', result.error);
        toast.showError('No se pudo cargar la información del viaje');
      }
    } catch (error) {
      console.error('❌ Error en cargarViaje:', error);
      setLoading(false);
      toast.showError('Error al cargar el viaje');
    }
  };

  const actualizarEstado = async (endpoint, mensaje, notificarUsuario = false) => {
    try {
      const response = await TransportService[endpoint](viajeId);
      if (response.success) {
        toast.showSuccess(mensaje);
        cargarViaje(); // Recargar para actualizar estado

        // Si se debe notificar al usuario (cuando llega al origen)
        if (notificarUsuario) {
          // El backend debería notificar automáticamente, pero aquí podemos hacer polling adicional
          console.log('✅ Estado actualizado, el usuario será notificado');
        }
      } else {
        toast.showError(response.error || 'No se pudo actualizar el estado');
      }
    } catch (error) {
      console.error(error);
      toast.showError('No se pudo actualizar el estado');
    }
  };

  const handleCompletar = () => {
    Alert.alert(
      'Finalizar Viaje',
      '¿Estás seguro que deseas finalizar el viaje?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Finalizar',
          onPress: finalizarViaje,
        },
      ],
    );
  };

  const finalizarViaje = async () => {
    try {
      setCompletando(true);
      console.log('🔄 Completando viaje direct:', { viajeId });

      // No enviamos precio, el backend usará el precio acordado
      const result = await TransportService.completarViaje(viajeId);
      console.log('📦 Resultado completar viaje:', JSON.stringify(result, null, 2));

      setCompletando(false);

      if (result.success) {
        toast.showSuccess('Viaje completado correctamente');
        cargarViaje();
        setTimeout(() => {
          navigation.navigate('Home'); // Volver al home al terminar
        }, 1500);
      } else {
        const errorMsg = result.error || result.message || 'No se pudo completar el viaje';
        toast.showError(errorMsg);
      }
    } catch (error) {
      console.error('❌ Error al completar viaje:', error);
      setCompletando(false);
      toast.showError('Ocurrió un error al completar el viaje');
    }
  };

  const handleCancelar = () => {
    Alert.alert(
      'Cancelar Viaje',
      '¿Estás seguro que deseas cancelar el viaje? Esta acción no se puede deshacer.',
      [
        {
          text: 'No, regresar',
          style: 'cancel',
        },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: cancelarViaje,
        },
      ],
    );
  };

  const cancelarViaje = async () => {
    try {
      setCompletando(true);
      const result = await TransportService.cancelarViaje(viajeId);
      setCompletando(false);

      if (result.success) {
        toast.showSuccess('El viaje ha sido cancelado exitosamente');
        setTimeout(() => {
          navigation.navigate('Home');
        }, 1500);
      } else {
        toast.showError(result.error || 'No se pudo cancelar el viaje');
      }
    } catch (error) {
      console.error('Error al cancelar:', error);
      setCompletando(false);
      toast.showError('Ocurrió un error al cancelar');
    }
  };

  // Determinar si el usuario actual es conductor o pasajero
  const esConductor = viaje?.conductor?.id === user?.id || user?.profile?.is_conductor;

  // ... (Keep existing code) ...

  // Definir qué mostrar en el mapa según el estado
  const mostrarOrigen = true; // Siempre mostrar origen
  const mostrarDestino = true; // Siempre mostrar destino

  // ... (Keep route logic) ...

  return (
    <View style={styles.container}>
      {/* ... MapView ... */}
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={esConductor}>
        {/* ... Markers and Directions ... */}
        {/* (Keep existing Markers code) */}
        {ubicacionConductor && (mostrarRutaConductorAOrigen || viaje.estado === 'en_viaje') && (
          <Marker
            key="conductor-marker"
            coordinate={ubicacionConductor}
            title={esConductor ? "Tu ubicación" : "Conductor"}
            tracksViewChanges={false}
            pinColor="blue">
            <View style={styles.markerContainer}>
              <Icon name="bicycle" size={30} color="#2196F3" />
            </View>
          </Marker>
        )}

        {/* Marcador del origen */}
        {mostrarOrigen && origenLatParsed && origenLngParsed && (
          <Marker
            key="origen-marker"
            coordinate={{
              latitude: origenLatParsed,
              longitude: origenLngParsed,
            }}
            title="Origen (Recoger Pasajero)"
            tracksViewChanges={false}
            pinColor="green">
            <View style={styles.markerContainer}>
              <Icon name="location" size={30} color="#4CAF50" />
            </View>
          </Marker>
        )}

        {/* Marcador del destino */}
        {mostrarDestino && destinoLatParsed && destinoLngParsed && (
          <Marker
            key="destino-marker"
            coordinate={{
              latitude: destinoLatParsed,
              longitude: destinoLngParsed,
            }}
            title="Destino"
            tracksViewChanges={false}
            pinColor="red">
            <View style={styles.markerContainer}>
              <Icon name="flag" size={30} color="#F44336" />
            </View>
          </Marker>
        )}

        {/* Ruta del conductor al origen (cuando va a recoger) */}
        {mostrarRutaConductorAOrigen && ubicacionConductor && origenLatParsed && origenLngParsed && (
          <MapViewDirections
            origin={{
              latitude: ubicacionConductor.latitude || ubicacionConductor.lat,
              longitude: ubicacionConductor.longitude || ubicacionConductor.lng,
            }}
            destination={{
              latitude: origenLatParsed,
              longitude: origenLngParsed,
            }}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={4}
            strokeColor="#FF9800"
            mode="DRIVING"
          />
        )}

        {/* Ruta del origen al destino (cuando están en viaje) */}
        {mostrarRutaOrigenADestino && origenLatParsed && origenLngParsed && destinoLatParsed && destinoLngParsed && (
          <MapViewDirections
            origin={{
              latitude: origenLatParsed,
              longitude: origenLngParsed,
            }}
            destination={{
              latitude: destinoLatParsed,
              longitude: destinoLngParsed,
            }}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={4}
            strokeColor="#2196F3"
            mode="DRIVING"
          />
        )}
      </MapView>

      <View style={styles.info}>
        <ScrollView>
          {/* Tarjeta de Estado */}
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Estado del Viaje</Text>
            <Text style={styles.statusValue}>
              {viaje?.estado?.toUpperCase().replace(/_/g, ' ')}
            </Text>
            {viaje?.estado === 'en_viaje' && (
              <Text style={styles.debugText}>
                Rumbo al destino
              </Text>
            )}
          </View>

          {/* Información de Direcciones */}
          <View style={styles.direccionCard}>
            <View style={styles.direccionItem}>
              <View style={styles.direccionHeader}>
                <Icon name="location" size={20} color="#4CAF50" />
                <Text style={styles.direccionTitulo}>Origen</Text>
              </View>
              <Text style={styles.direccionTexto}>
                {viaje?.origen?.direccion || 'Ubicación de recogida'}
              </Text>
            </View>

            <View style={styles.direccionItem}>
              <View style={styles.direccionHeader}>
                <Icon name="flag" size={20} color="#F44336" />
                <Text style={styles.direccionTitulo}>Destino</Text>
              </View>
              <Text style={styles.direccionTexto}>
                {viaje?.destino?.direccion || 'Ubicación de destino'}
              </Text>
            </View>
          </View>

          {/* Acciones principales (Conductor) */}
          {esConductor && (
            <View style={styles.actionsCard}>
              {viaje?.estado === 'aceptado' && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => actualizarEstado('enCaminoOrigen', 'Notificando al pasajero que vas en camino')}>
                  <Icon name="bicycle" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Voy en Camino</Text>
                </TouchableOpacity>
              )}

              {viaje?.estado === 'en_camino_origen' && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => actualizarEstado('llegarOrigen', 'Notificando llegada', true)}>
                  <Icon name="location" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Ya Llegué</Text>
                </TouchableOpacity>
              )}

              {viaje?.estado === 'llegado_origen' && (
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#4CAF50' }]}
                  onPress={() => actualizarEstado('iniciarViaje', 'Viaje iniciado')}>
                  <Icon name="play" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Iniciar Viaje</Text>
                </TouchableOpacity>
              )}

              {viaje?.estado === 'en_viaje' && (
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#F44336' }]}
                  onPress={handleCompletar}>
                  <Icon name="checkbox" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Finalizar Viaje</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Información del Pasajero/Conductor */}
          <View style={styles.pasajeroInfo}>
            <Text style={styles.statusLabel}>
              {esConductor ? 'Pasajero' : 'Tu Conductor'}
            </Text>
            <Text style={styles.pasajeroText}>
              {esConductor
                ? (viaje?.pasajero?.first_name || viaje?.pasajero?.username)
                : (viaje?.conductor?.first_name || viaje?.conductor?.username)}
            </Text>
            <TouchableOpacity
              style={{ marginTop: 10 }}
              onPress={() => Alert.alert('Contacto', `Llamar a ${esConductor ? viaje?.pasajero?.phone : viaje?.conductor?.phone || 'N/A'}`)}>
              <Icon name="call" size={24} color="#2E7D32" />
            </TouchableOpacity>
          </View>

          {/* Botón de Cancelar (Visible para todos si el viaje no ha terminado) */}
          {viaje?.estado !== 'completado' && viaje?.estado !== 'cancelado' && (
            <View style={{ margin: 15 }}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#9E9E9E', marginTop: 10 }]}
                onPress={handleCancelar}
                disabled={completando}>
                <Icon name="close-circle" size={24} color="#fff" />
                <Text style={styles.buttonText}>Cancelar Viaje</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </View>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  info: {
    backgroundColor: '#fff',
    maxHeight: '50%',
  },
  statusCard: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  direccionCard: {
    marginHorizontal: 15,
    marginBottom: 15,
  },
  direccionItem: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  direccionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  direccionTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  direccionTexto: {
    fontSize: 14,
    color: '#666',
    marginLeft: 34,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  actionsCard: {
    padding: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  pasajeroInfo: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  pasajeroText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  markerContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugText: {
    fontSize: 10,
    color: '#999',
    marginTop: 5,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalButtonConfirm: {
    backgroundColor: '#2196F3',
  },
  modalButtonTextCancel: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  modalButtonTextConfirm: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});





