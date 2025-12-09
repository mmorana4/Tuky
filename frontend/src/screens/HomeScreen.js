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
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';

export default function HomeScreen({ navigation }) {
  const [location, setLocation] = useState({
    latitude: -2.170998,
    longitude: -79.922359,
  });
  const [region, setRegion] = useState({
    latitude: -2.170998,
    longitude: -79.922359,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [solicitudes, setSolicitudes] = useState([]);
  const [conductores, setConductores] = useState([]);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    // Poll conductors/requests every 10s
    const interval = setInterval(() => {
      cargarDatosMapa();
    }, 5000);
    return () => clearInterval(interval);
  }, [location, user]);

  const cargarDatosMapa = async () => {
    await cargarSolicitudes();
    if (!user?.profile?.is_conductor) {
      await cargarConductores();
    }
  };

  const cargarConductores = async () => {
    if (!location) return;
    const result = await TransportService.listarConductoresDisponibles(
      location.latitude,
      location.longitude
    );
    if (result.success && result.data?.conductores) {
      setConductores(result.data.conductores);
    }
  };

  // Auto-center map when location changes
  useEffect(() => {
    if (location) {
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [location]);

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

  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}>
        {solicitudes.map(solicitud => (
          <Marker
            key={solicitud.id}
            coordinate={{
              latitude: parseFloat(solicitud.origen_lat),
              longitude: parseFloat(solicitud.origen_lng),
            }}
            title={`Solicitud: $${solicitud.precio_solicitado}`}
          >
            <View style={{ backgroundColor: 'white', padding: 5, borderRadius: 20, borderWidth: 2, borderColor: '#4CAF50' }}>
              <Icon name="person" size={20} color="#4CAF50" />
            </View>
          </Marker>
        ))}

        {conductores.map(conductor => (
          <Marker
            key={`cond-${conductor.id}`}
            coordinate={{
              latitude: parseFloat(conductor.ubicacion_actual_lat),
              longitude: parseFloat(conductor.ubicacion_actual_lng),
            }}
            title={`Conductor: ${conductor.user__first_name}`}
            pinColor="blue"
          >
            <View style={{ backgroundColor: 'white', padding: 5, borderRadius: 20, borderWidth: 2, borderColor: '#2196F3' }}>
              <Icon name="bicycle" size={20} color="#2196F3" />
            </View>
          </Marker>
        ))}
      </MapView>

      {!user?.profile?.is_conductor && (
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('SolicitarViaje')}>
            <Text style={styles.buttonText}>Solicitar Viaje</Text>
          </TouchableOpacity>
        </View>
      )}
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
    backgroundColor: '#2196F3',
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

