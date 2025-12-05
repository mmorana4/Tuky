import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import TransportService from '../services/transportService';

export default function HomeScreen({ navigation }) {
  const [location, setLocation] = useState({
    latitude: -2.170998,
    longitude: -79.922359,
  });
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de Ubicación',
            message: 'Tuky Motos necesita acceso a tu ubicación',
            buttonNeutral: 'Preguntar Luego',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          obtenerUbicacion();
        } else {
          console.log('Permiso de ubicación denegado');
          // Usar ubicación por defecto
          setLocation({
            latitude: -2.170998,
            longitude: -79.922359,
          });
        }
      } else {
        obtenerUbicacion();
      }
    } catch (err) {
      console.warn('Error al solicitar permiso:', err);
      setLocation({
        latitude: -2.170998,
        longitude: -79.922359,
      });
    }
  };

  const obtenerUbicacion = () => {
    Geolocation.getCurrentPosition(
      position => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        console.log('Error obteniendo ubicación:', error);
        // Usar ubicación por defecto en lugar de mostrar alerta
        setLocation({
          latitude: -2.170998,
          longitude: -79.922359,
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  const cargarSolicitudes = async () => {
    try {
      const result = await TransportService.listarSolicitudesDisponibles(
        location.latitude,
        location.longitude,
      );

      if (result.success) {
        setSolicitudes(result.data.data?.solicitudes || []);
      }
    } catch (error) {
      console.log('Error cargando solicitudes:', error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}>
        {solicitudes.map(solicitud => (
          <Marker
            key={solicitud.id}
            coordinate={{
              latitude: parseFloat(solicitud.origen_lat),
              longitude: parseFloat(solicitud.origen_lng),
            }}
            title={`Precio: $${solicitud.precio_solicitado}`}
          />
        ))}
      </MapView>

      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SolicitarViaje')}>
          <Text style={styles.buttonText}>Solicitar Viaje</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  button: {
    backgroundColor: '#FF6B35',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

