import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import MotoService from '../../services/motoService';

export default function MisMotosScreen({navigation}) {
  const [motos, setMotos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarMotos();
  }, []);

  const cargarMotos = async () => {
    setLoading(true);
    const result = await MotoService.listarMotos();
    setLoading(false);

    if (result.success) {
      setMotos(result.data.data?.motos || []);
    }
  };

  const activarMoto = async motoId => {
    const result = await MotoService.activarMoto(motoId);
    if (result.success) {
      Alert.alert('Éxito', 'Moto activada');
      cargarMotos();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const eliminarMoto = async motoId => {
    Alert.alert('Eliminar Moto', '¿Estás seguro?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const result = await MotoService.eliminarMoto(motoId);
          if (result.success) {
            cargarMotos();
          } else {
            Alert.alert('Error', result.error);
          }
        },
      },
    ]);
  };

  const renderMoto = ({item}) => (
    <TouchableOpacity
      style={styles.motoCard}
      onPress={() => navigation.navigate('DetalleMoto', {motoId: item.id})}>
      <View style={styles.motoHeader}>
        <Text style={styles.motoMarca}>
          {item.marca} {item.modelo} ({item.año})
        </Text>
        {item.is_active_moto && (
          <View style={styles.badgeActiva}>
            <Text style={styles.badgeText}>ACTIVA</Text>
          </View>
        )}
      </View>
      <Text style={styles.motoPlaca}>Placa: {item.placa}</Text>
      <Text style={styles.motoColor}>Color: {item.color}</Text>
      <View style={styles.motoActions}>
        {!item.is_active_moto && (
          <TouchableOpacity
            style={styles.btnActivar}
            onPress={() => activarMoto(item.id)}>
            <Text style={styles.btnText}>Activar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.btnEliminar}
          onPress={() => eliminarMoto(item.id)}>
          <Text style={styles.btnEliminarText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Motos</Text>
        <TouchableOpacity
          style={styles.btnAgregar}
          onPress={() => navigation.navigate('RegistrarMoto')}>
          <Text style={styles.btnAgregarText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={motos}
        renderItem={renderMoto}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={cargarMotos} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No tienes motos registradas</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('RegistrarMoto')}>
              <Text style={styles.buttonText}>Registrar Primera Moto</Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  btnAgregar: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnAgregarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  motoCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  motoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  motoMarca: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  badgeActiva: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  motoPlaca: {
    fontSize: 16,
    marginBottom: 5,
  },
  motoColor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  motoActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  btnActivar: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  btnEliminar: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  btnEliminarText: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  empty: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
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





