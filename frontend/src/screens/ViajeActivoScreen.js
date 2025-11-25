import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, {Marker, Polyline} from 'react-native-maps';
import TransportService from '../services/transportService';

export default function ViajeActivoScreen({route, navigation}) {
  const {viajeId} = route.params;
  const [viaje, setViaje] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarViaje();
  }, []);

  const cargarViaje = async () => {
    const result = await TransportService.obtenerDetalleViaje(viajeId);
    setLoading(false);

    if (result.success) {
      setViaje(result.data.data?.viaje);
    }
  };

  const handleCompletar = async () => {
    Alert.prompt(
      'Completar Viaje',
      'Ingresa el precio final (opcional)',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Completar',
          onPress: async precio => {
            const precioFinal = precio ? parseFloat(precio) : null;
            const result = await TransportService.completarViaje(viajeId, precioFinal);
            if (result.success) {
              Alert.alert('Éxito', 'Viaje completado');
              navigation.goBack();
            }
          },
        },
      ],
      'plain-text',
    );
  };

  if (loading || !viaje) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: viaje.origen.lat,
          longitude: viaje.origen.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}>
        <Marker coordinate={viaje.origen} title="Origen" pinColor="green" />
        <Marker coordinate={viaje.destino} title="Destino" pinColor="red" />
        <Polyline
          coordinates={[viaje.origen, viaje.destino]}
          strokeColor="#FF6B35"
          strokeWidth={3}
        />
      </MapView>

      <View style={styles.info}>
        <Text style={styles.label}>Estado: {viaje.estado}</Text>
        <Text style={styles.label}>Precio: ${viaje.precio_solicitado}</Text>
        <Text style={styles.label}>Origen: {viaje.origen.direccion}</Text>
        <Text style={styles.label}>Destino: {viaje.destino.direccion}</Text>

        {viaje.estado === 'en_viaje' && (
          <TouchableOpacity style={styles.button} onPress={handleCompletar}>
            <Text style={styles.buttonText}>Completar Viaje</Text>
          </TouchableOpacity>
        )}
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
  info: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#FF6B35',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


