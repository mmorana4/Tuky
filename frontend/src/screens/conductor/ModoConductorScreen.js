import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import ConductorService from '../../services/conductorService';
import TransportService from '../../services/transportService';
import SolicitudEmergenteModal from '../../components/SolicitudEmergenteModal';

export default function ModoConductorScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: -2.170998,
    longitude: -79.922359,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [solicitudes, setSolicitudes] = useState([]);
  const [estado, setEstado] = useState('no_disponible');
  const [loading, setLoading] = useState(false);
  const [solicitudEmergente, setSolicitudEmergente] = useState(null);
  const mostradosRef = useRef(new Set());
  const estadoRef = useRef(estado);
  const emergenteRef = useRef(null);
  estadoRef.current = estado;
  emergenteRef.current = solicitudEmergente?.id ?? null;

  useEffect(() => {
    obtenerUbicacion();
    cargarEstado();
  }, []);

  useEffect(() => {
    // Cargar solicitudes cuando cambia la ubicación
    if (location) {
      cargarSolicitudes();
    }
  }, [location]);

  // Actualizar región del mapa cuando cambia la ubicación
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

  useEffect(() => {
    // Polling automático cada 10 segundos
    const interval = setInterval(() => {
      if (location) {
        cargarSolicitudes();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [location]);

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
    console.log('🔄 ModoConductor: Cargando perfil...');
    const result = await ConductorService.obtenerPerfil();
    console.log('👤 ModoConductor: Perfil result:', result);
    if (result.success && result.data.data?.conductor) {
      setEstado(result.data.data.conductor.estado);
    }
  };

  const cargarSolicitudes = async () => {
    setLoading(true);
    console.log('📡 ModoConductor: Buscando solicitudes...');
    console.log('📍 ModoConductor: Ubicación:', location);
    
    const result = await TransportService.listarSolicitudesDisponibles(
      location?.latitude || null,
      location?.longitude || null,
      10, // radio de 10km para pruebas
    );
    setLoading(false);

    console.log('📦 ModoConductor: Solicitudes result:', result.success);
    console.log('📦 ModoConductor: Full response:', JSON.stringify(result.data, null, 2));
    console.log('📦 ModoConductor: aData:', result.data?.aData);
    console.log('📦 ModoConductor: Solicitudes count:', result.data?.aData?.solicitudes?.length);

    if (result.success) {
      const solicitudesData = result.data?.aData?.solicitudes || result.data?.solicitudes || [];
      setSolicitudes(solicitudesData);

      // Mostrar emergente si hay una solicitud nueva y estamos disponibles
      if (estadoRef.current === 'disponible' && solicitudesData.length > 0 && !emergenteRef.current) {
        const nueva = solicitudesData.find((s) => !mostradosRef.current.has(s.id));
        if (nueva) {
          setSolicitudEmergente(nueva);
        }
      }
    } else {
      console.log('❌ ModoConductor: Error al cargar solicitudes:', result.error);
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
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          onPress: async () => {
            const result = await TransportService.aceptarSolicitud(solicitudId);
            if (result.success) {
              const viajeId = result.data?.aData?.viaje_id || result.data?.viaje_id;
              if (viajeId) {
                navigation.navigate('ViajeActivo', { viajeId });
              } else {
                Alert.alert('Error', 'No se pudo obtener el ID del viaje');
              }
            } else {
              Alert.alert('Error', result.error || 'No se pudo aceptar la solicitud');
            }
          },
        },
      ],
    );
  };

  const cerrarEmergente = (id) => {
    if (id) mostradosRef.current.add(id);
    setSolicitudEmergente(null);
  };

  const handleEmergenteAccept = async (solicitud) => {
    const id = solicitud?.id;
    cerrarEmergente(id);
    const result = await TransportService.aceptarSolicitud(id);
    if (result.success) {
      const viajeId = result.data?.aData?.viaje_id || result.data?.viaje_id;
      if (viajeId) navigation.navigate('ViajeActivo', { viajeId });
      else Alert.alert('Error', 'No se pudo obtener el ID del viaje');
    } else {
      Alert.alert('Error', result.error || 'No se pudo aceptar');
    }
  };

  const handleEmergenteReject = () => {
    if (solicitudEmergente?.id) mostradosRef.current.add(solicitudEmergente.id);
    setSolicitudEmergente(null);
  };

  return (
    <View style={styles.container}>
      <SolicitudEmergenteModal
        visible={!!solicitudEmergente}
        solicitud={solicitudEmergente}
        onAccept={handleEmergenteAccept}
        onReject={handleEmergenteReject}
        onClose={() => cerrarEmergente(solicitudEmergente?.id)}
      />
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        onRegionChangeComplete={setRegion}>
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
          <TouchableOpacity
            style={styles.verSolicitudesButton}
            onPress={() => navigation.navigate('SolicitudesDisponibles')}>
            <Text style={styles.verSolicitudesText}>📋 Ver Solicitudes</Text>
          </TouchableOpacity>
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
    maxHeight: '60%',
    paddingBottom: 60, // Add padding for tab bar
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
    backgroundColor: '#2196F3',
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
  verSolicitudesButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  verSolicitudesText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});





