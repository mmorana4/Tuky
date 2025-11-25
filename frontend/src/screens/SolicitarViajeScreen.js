import React, {useState, useEffect} from 'react';
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
import MapView, {Marker} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import TransportService from '../services/transportService';

export default function SolicitarViajeScreen({navigation}) {
  const [origen, setOrigen] = useState(null);
  const [destino, setDestino] = useState(null);
  const [precio, setPrecio] = useState('');
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState({
    latitude: -2.170998,
    longitude: -79.922359,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
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

  const handleMapPress = e => {
    if (!origen) {
      setOrigen(e.nativeEvent.coordinate);
    } else if (!destino) {
      setDestino(e.nativeEvent.coordinate);
    }
  };

  const handleSolicitar = async () => {
    if (!origen || !destino || !precio) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    setLoading(true);
    const data = {
      origen_lat: origen.latitude,
      origen_lng: origen.longitude,
      origen_direccion: 'Origen seleccionado', // TODO: Geocodificación inversa
      destino_lat: destino.latitude,
      destino_lng: destino.longitude,
      destino_direccion: 'Destino seleccionado', // TODO: Geocodificación inversa
      precio_solicitado: parseFloat(precio),
      metodo_pago: 'efectivo',
    };

    const result = await TransportService.crearSolicitud(data);
    setLoading(false);

    if (result.success) {
      Alert.alert('Éxito', 'Solicitud creada correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('ViajeActivo', {viajeId: result.data.data.id}),
        },
      ]);
    } else {
      Alert.alert('Error', result.error);
    }
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

      <View style={styles.form}>
        <Text style={styles.label}>Precio ofrecido ($)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 5.00"
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
    color: '#FF6B35',
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


