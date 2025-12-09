import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import TransportService from '../services/transportService';
import { useAuth } from '../context/AuthContext';

export default function MisViajesScreen({ navigation }) {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('proceso'); // 'pendientes', 'proceso', 'realizados'
  const { user } = useAuth();

  useEffect(() => {
    cargarViajes();
  }, []);

  // Recargar cuando la pantalla se enfoca (cuando se regresa de otra pantalla)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cargarViajes();
    });
    return unsubscribe;
  }, [navigation]);

  const cargarViajes = async () => {
    setLoading(true);
    try {
      const result = await TransportService.obtenerMisViajes();
      console.log('📦 MisViajes - Result:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        // El backend retorna {is_success: true, aData: {viajes: [...]}}
        const viajesData = result.data?.aData?.viajes || result.data?.viajes || [];
        console.log('📦 MisViajes - Viajes cargados:', viajesData.length);
        
        // Log detallado de cada viaje para debug
        viajesData.forEach((v, index) => {
          console.log(`📦 Viaje ${index + 1} (ID: ${v.id}): estado="${v.estado}", estado_display="${v.estado_display || 'N/A'}"`);
        });
        
        setViajes(viajesData);
      } else {
        console.error('❌ Error al cargar viajes:', result.error);
      }
    } catch (error) {
      console.error('❌ Error en cargarViajes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getViajesFiltrados = () => {
    return viajes.filter(v => {
      const estado = (v.estado || '').toLowerCase();
      if (filtro === 'pendientes') {
        return ['solicitado', 'pendiente', 'aceptado'].includes(estado);
      } else if (filtro === 'proceso') {
        return ['aceptado', 'en_camino_origen', 'llegado_origen', 'en_viaje'].includes(estado);
      } else if (filtro === 'realizados') {
        return ['completado', 'cancelado'].includes(estado);
      }
      return true;
    });
  };

  const getEstadoLabel = (estado) => {
    if (!estado) {
      console.warn('⚠️ Estado vacío o undefined');
      return 'DESCONOCIDO';
    }
    
    const estadoLower = estado.toLowerCase().trim();
    const estados = {
      'solicitado': 'SOLICITADO',
      'pendiente': 'PENDIENTE',
      'aceptado': 'ACEPTADO',
      'en_camino_origen': 'EN CAMINO',
      'llegado_origen': 'LLEGÓ AL ORIGEN',
      'en_viaje': 'EN VIAJE',
      'completado': 'COMPLETADO',
      'cancelado': 'CANCELADO',
    };
    
    const label = estados[estadoLower];
    if (!label) {
      console.warn(`⚠️ Estado desconocido: "${estado}" (lowercase: "${estadoLower}")`);
      return estado.toUpperCase();
    }
    
    return label;
  };

  const getRolEnViaje = (viaje) => {
    // Determinar si el usuario es conductor o pasajero en este viaje
    if (user?.profile?.is_conductor && viaje.conductor_id === user?.id) {
      return 'Conductor';
    }
    return 'Pasajero';
  };

  const renderViaje = ({ item }) => {
    const rol = getRolEnViaje(item);
    const estadoReal = item.estado || '';
    const estadoLabel = getEstadoLabel(estadoReal);
    
    // Log para debug
    console.log(`🔍 Viaje ${item.id}: estado="${estadoReal}" -> label="${estadoLabel}"`);
    
    return (
      <TouchableOpacity
        style={styles.viajeCard}
        onPress={() => {
          if (item.id) {
            navigation.navigate('ViajeActivo', { viajeId: item.id });
          }
        }}>
        <View style={styles.headerCard}>
          <View style={styles.estadoContainer}>
            <Text style={styles.estado}>{estadoLabel}</Text>
            <Text style={styles.rol}>{rol}</Text>
          </View>
          <Text style={styles.precio}>${item.precio || item.precio_solicitado || '0.00'}</Text>
        </View>
        <Text style={styles.ruta}>📍 {item.origen || item.origen_direccion || 'Origen no disponible'}</Text>
        <Text style={styles.ruta}>🏁 {item.destino || item.destino_direccion || 'Destino no disponible'}</Text>
        {item.fecha && (
          <Text style={styles.fecha}>
            {new Date(item.fecha).toLocaleString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && viajes.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Cargando viajes...</Text>
      </View>
    );
  }

  const viajesFiltrados = getViajesFiltrados();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Viajes</Text>
      <Text style={styles.subtitle}>
        {user?.profile?.is_conductor ? 'Como Conductor' : 'Como Pasajero'}
      </Text>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <TouchableOpacity
          style={[styles.filtroBtn, filtro === 'pendientes' && styles.filtroBtnActive]}
          onPress={() => setFiltro('pendientes')}>
          <Text style={[styles.filtroText, filtro === 'pendientes' && styles.filtroTextActive]}>Pendientes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroBtn, filtro === 'proceso' && styles.filtroBtnActive]}
          onPress={() => setFiltro('proceso')}>
          <Text style={[styles.filtroText, filtro === 'proceso' && styles.filtroTextActive]}>En Proceso</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroBtn, filtro === 'realizados' && styles.filtroBtnActive]}
          onPress={() => setFiltro('realizados')}>
          <Text style={[styles.filtroText, filtro === 'realizados' && styles.filtroTextActive]}>Realizados</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={viajesFiltrados}
        renderItem={renderViaje}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={cargarViajes} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No hay viajes en esta sección</Text>
            <Text style={styles.emptySubtext}>
              {filtro === 'pendientes' && 'No tienes viajes pendientes'}
              {filtro === 'proceso' && 'No tienes viajes en proceso'}
              {filtro === 'realizados' && 'No tienes viajes completados'}
            </Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2196F3',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  filtrosContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 4,
  },
  filtroBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  filtroBtnActive: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  filtroText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 12,
  },
  filtroTextActive: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  viajeCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#2196F3',
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  estadoContainer: {
    flex: 1,
  },
  estado: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2196F3',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  rol: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
  debugEstado: {
    fontSize: 8,
    color: '#ccc',
    fontStyle: 'italic',
    marginTop: 2,
  },
  ruta: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  precio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  fecha: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'right',
  },
  empty: {
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  notificationCard: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  notificationText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
});





