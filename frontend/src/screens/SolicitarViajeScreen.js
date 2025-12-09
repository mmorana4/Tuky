import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import TransportService from '../services/transportService';

export default function SolicitarViajeScreen({ navigation }) {
  const [origen, setOrigen] = useState(null);
  const [destino, setDestino] = useState(null);
  const [precio, setPrecio] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [destinoAddress, setDestinoAddress] = useState('');
  const [distancia, setDistancia] = useState(0);
  const [precioSugerido, setPrecioSugerido] = useState('0.00');
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState({
    latitude: -2.170998,
    longitude: -79.922359,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    obtenerUbicacionActual();
  }, []);

  const obtenerUbicacionActual = () => {
    Geolocation.getCurrentPosition(
      position => {
        const loc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setOrigen(loc);
        setRegion({
          ...region,
          latitude: loc.latitude,
          longitude: loc.longitude,
        });
      },
      error => {
        Alert.alert('Error', 'No se pudo obtener la ubicación');
      },
    );
  };

  // Calculate distance using Haversine formula  
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calculate suggested price based on distance
  const calculateSuggestedPrice = (distance) => {
    const baseRate = 0.80; // Reduced from 1.00
    const perKmRate = 0.25; // Reduced from 0.30  
    const calculated = baseRate + (distance * perKmRate);
    return Math.max(0.80, calculated).toFixed(2); // Minimum $0.80
  };

  const handleMapPress = e => {
    if (!origen) {
      setOrigen(e.nativeEvent.coordinate);
    } else if (!destino) {
      const newDestino = e.nativeEvent.coordinate;
      setDestino(newDestino);

      // Calculate distance and suggested price
      const dist = calculateDistance(
        origen.latitude,
        origen.longitude,
        newDestino.latitude,
        newDestino.longitude
      );
      setDistancia(dist);
      const suggested = calculateSuggestedPrice(dist);
      setPrecioSugerido(suggested);
      setPrecio(suggested); // Auto-fill with suggested price
    }
  };

  const handleSolicitar = async () => {
    if (!origen || !destino || !precio) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    setLoading(true);
    const data = {
      origen_lat: parseFloat(origen.latitude.toFixed(6)),
      origen_lng: parseFloat(origen.longitude.toFixed(6)),
      origen_direccion: destinoAddress || 'Origen seleccionado',
      destino_lat: parseFloat(destino.latitude.toFixed(6)),
      destino_lng: parseFloat(destino.longitude.toFixed(6)),
      destino_direccion: destinoAddress || 'Destino seleccionado',
      precio_solicitado: parseFloat(precio),
      metodo_pago: metodoPago,
      fecha_expiracion: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };

    console.log('Enviando solicitud:', JSON.stringify(data, null, 2));
    const result = await TransportService.crearSolicitud(data);
    setLoading(false);
    console.log('Respuesta:', JSON.stringify(result, null, 2));

    if (result.success) {
      const solicitudId = result.data.aData.id;
      // Navigate to waiting screen
      navigation.navigate('SolicitudEspera', { solicitudId });
      // Reset form
      resetMarkers();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const resetMarkers = () => {
    setOrigen(null);
    setDestino(null);
    setDistancia(0);
    setPrecioSugerido('0.00');
    setPrecio('');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Solicitar Viaje</Text>

      <MapView
        style={styles.map}
        region={region}
        onPress={handleMapPress}
        showsUserLocation={true}>
        {origen && (
          <Marker coordinate={origen} title="Origen" pinColor="green" />
        )}
        {destino && (
          <Marker coordinate={destino} title="Destino" pinColor="red" />
        )}
      </MapView>

      {/* Reset Button */}
      {(origen || destino) && (
        <TouchableOpacity style={styles.resetButton} onPress={resetMarkers}>
          <Text style={styles.resetButtonText}>↺ Reiniciar</Text>
        </TouchableOpacity>
      )}

      <View style={styles.form}>
        {/* Distance Info */}
        {distancia > 0 && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Distancia: {distancia.toFixed(2)} km
            </Text>
            <Text style={styles.infoText}>
              Precio sugerido: ${precioSugerido}
            </Text>
          </View>
        )}

        {/* Destination Address */}
        <Text style={styles.label}>Dirección de destino (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Av. 9 de Octubre y Malecón"
          placeholderTextColor="#999"
          value={destinoAddress}
          onChangeText={setDestinoAddress}
        />

        {/* Payment Method */}
        <Text style={styles.label}>Método de pago</Text>
        <View style={styles.paymentButtons}>
          <TouchableOpacity
            style={[
              styles.paymentButton,
              metodoPago === 'efectivo' && styles.paymentButtonActive
            ]}
            onPress={() => setMetodoPago('efectivo')}>
            <Text style={[
              styles.paymentButtonText,
              metodoPago === 'efectivo' && styles.paymentButtonTextActive
            ]}>Efectivo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paymentButton,
              metodoPago === 'tarjeta' && styles.paymentButtonActive
            ]}
            onPress={() => setMetodoPago('tarjeta')}>
            <Text style={[
              styles.paymentButtonText,
              metodoPago === 'tarjeta' && styles.paymentButtonTextActive
            ]}>Tarjeta</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paymentButton,
              metodoPago === 'transferencia' && styles.paymentButtonActive
            ]}
            onPress={() => setMetodoPago('transferencia')}>
            <Text style={[
              styles.paymentButtonText,
              metodoPago === 'transferencia' && styles.paymentButtonTextActive
            ]}>Transferencia</Text>
          </TouchableOpacity>
        </View>

        {/* Price */}
        <Text style={styles.label}>Precio ofrecido ($)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 5.00"
          placeholderTextColor="#999"
          value={precio}
          onChangeText={setPrecio}
          keyboardType="decimal-pad"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSolicitar}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Solicitar Viaje</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    color: '#2196F3',
  },
  map: {
    width: '100%',
    height: 300,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resetButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 5,
    fontWeight: '600',
  },
  paymentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  paymentButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#fff',
  },
  paymentButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  paymentButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  paymentButtonTextActive: {
    color: '#fff',
  },
});




