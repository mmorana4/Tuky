import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import TransportService from '../services/transportService';

export default function MisViajesScreen({navigation}) {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarViajes();
  }, []);

  const cargarViajes = async () => {
    setLoading(true);
    const result = await TransportService.obtenerMisViajes();
    setLoading(false);

    if (result.success) {
      setViajes(result.data.data?.viajes || []);
    }
  };

  const renderViaje = ({item}) => (
    <TouchableOpacity
      style={styles.viajeCard}
      onPress={() => navigation.navigate('ViajeActivo', {viajeId: item.id})}>
      <Text style={styles.estado}>{item.estado}</Text>
      <Text style={styles.ruta}>{item.origen} → {item.destino}</Text>
      <Text style={styles.precio}>${item.precio}</Text>
      <Text style={styles.fecha}>{new Date(item.fecha).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Viajes</Text>
      <FlatList
        data={viajes}
        renderItem={renderViaje}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={cargarViajes} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No tienes viajes aún</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FF6B35',
  },
  viajeCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  estado: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 5,
  },
  ruta: {
    fontSize: 16,
    marginBottom: 5,
  },
  precio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  fecha: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  empty: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});


