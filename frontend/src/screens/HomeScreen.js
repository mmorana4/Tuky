import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import TransportService from '../services/transportService';

export default function HomeScreen({navigation}) {
  const [location, setLocation] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    obtenerUbicacion();
    cargarSolicitudes();
  }, []);

  const obtenerUbicacion = () => {
    Geolocation.getCurrentPosition(
      position => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        Alert.alert('Error', 'No se pudo obtener la ubicación');
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const cargarSolicitudes = async () => {
    if (!location) return;

    const result = await TransportService.listarSolicitudesDisponibles(
      location.latitude,
      location.longitude,
    );

    if (result.success) {
      setSolicitudes(result.data.data?.solicitudes || []);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || -2.170998,
          longitude: location?.longitude || -79.922359,
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

