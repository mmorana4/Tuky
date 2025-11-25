import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import ConductorService from '../../services/conductorService';
import TransportService from '../../services/transportService';

export default function ModoConductorScreen({navigation}) {
  const [location, setLocation] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [estado, setEstado] = useState('no_disponible');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    obtenerUbicacion();
    cargarEstado();
    cargarSolicitudes();
  }, []);

  const obtenerUbicacion = () => {
    Geolocation.getCurrentPosition(
      position => {
        const loc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(loc);
        // Actualizar ubicación en el servidor
        ConductorService.actualizarUbicacion(loc.latitude, loc.longitude);
      },
      error => {
        Alert.alert('Error', 'No se pudo obtener la ubicación');
      },
    );
  };

  const cargarEstado = async () => {
    const result = await ConductorService.obtenerPerfil();
    if (result.success && result.data.data?.conductor) {
      setEstado(result.data.data.conductor.estado);
    }
  };

  const cargarSolicitudes = async () => {
    if (!location) return;
    setLoading(true);
    const result = await TransportService.listarSolicitudesDisponibles(
      location.latitude,
      location.longitude,
    );
    setLoading(false);

    if (result.success) {
      setSolicitudes(result.data.data?.solicitudes || []);
    }
  };

  const cambiarEstado = async nuevoEstado => {
    const result = await ConductorService.cambiarEstado(nuevoEstado);
    if (result.success) {
      setEstado(nuevoEstado);
      Alert.alert('Éxito', `Estado cambiado a ${nuevoEstado}`);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const aceptarSolicitud = async solicitudId => {
    Alert.alert(
      'Aceptar Solicitud',
      '¿Deseas aceptar esta solicitud de viaje?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Aceptar',
          onPress: async () => {
            const result = await TransportService.aceptarSolicitud(solicitudId);
            if (result.success) {
              Alert.alert('Éxito', 'Solicitud aceptada', [
                {
                  text: 'OK',
                  onPress: () =>
                    navigation.navigate('ViajeActivo', {
                      viajeId: result.data.data.viaje_id,
                    }),
                },
              ]);
            } else {
              Alert.alert('Error', result.error);
            }
          },
        },
      ],
    );
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
            title={`$${solicitud.precio_solicitado}`}
            description={solicitud.origen_direccion}
          />
        ))}
      </MapView>

      <View style={styles.overlay}>
        <View style={styles.estadoContainer}>
          <Text style={styles.estadoLabel}>Estado: {estado}</Text>
          <View style={styles.botonesEstado}>
            <TouchableOpacity
              style={[
                styles.botonEstado,
                estado === 'disponible' && styles.botonEstadoActivo,
              ]}
              onPress={() => cambiarEstado('disponible')}>
              <Text style={styles.botonEstadoText}>Disponible</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.botonEstado,
                estado === 'no_disponible' && styles.botonEstadoActivo,
              ]}
              onPress={() => cambiarEstado('no_disponible')}>
              <Text style={styles.botonEstadoText}>No Disponible</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.solicitudesList}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={cargarSolicitudes} />
          }>
          <Text style={styles.solicitudesTitle}>Solicitudes Disponibles</Text>
          {solicitudes.map(solicitud => (
            <TouchableOpacity
              key={solicitud.id}
              style={styles.solicitudCard}
              onPress={() => aceptarSolicitud(solicitud.id)}>
              <Text style={styles.solicitudPrecio}>
                ${solicitud.precio_solicitado}
              </Text>
              <Text style={styles.solicitudOrigen}>
                {solicitud.origen_direccion}
              </Text>
              <Text style={styles.solicitudDestino}>
                → {solicitud.destino_direccion}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },
  estadoContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  estadoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  botonesEstado: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  botonEstado: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  botonEstadoActivo: {
    backgroundColor: '#FF6B35',
  },
  botonEstadoText: {
    color: '#000',
    fontWeight: 'bold',
  },
  solicitudesList: {
    maxHeight: 300,
  },
  solicitudesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 15,
  },
  solicitudCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  solicitudPrecio: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  solicitudOrigen: {
    fontSize: 14,
    marginBottom: 3,
  },
  solicitudDestino: {
    fontSize: 14,
    color: '#666',
  },
});


