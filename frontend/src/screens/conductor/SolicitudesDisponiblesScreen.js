import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from 'react-native-geolocation-service';
import TransportService from '../../services/transportService';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';

export default function SolicitudesDisponiblesScreen({ navigation }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);
  const [vista, setVista] = useState('lista'); // 'lista' | 'mapa'

  useEffect(() => {
    obtenerUbicacion();
  }, []);

  useEffect(() => {
    if (location) fetchSolicitudes();
  }, [location]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (location) fetchSolicitudes();
    }, 10000);
    return () => clearInterval(interval);
  }, [location]);

  const obtenerUbicacion = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => setLocation({ latitude: -2.17, longitude: -79.92 }),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  const fetchSolicitudes = async () => {
    try {
      const result = await TransportService.listarSolicitudesDisponibles(
        location?.latitude ?? null,
        location?.longitude ?? null,
        10,
      );
      if (result.success) {
        const data = result.data?.aData?.solicitudes || result.data?.solicitudes || [];
        setSolicitudes(data);
      }
      setLoading(false);
      setRefreshing(false);
    } catch (e) {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAceptar = (solicitud) => {
    Alert.alert(
      'Aceptar viaje',
      `¿Aceptar viaje por $${solicitud.precio_solicitado}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          onPress: async () => {
            const result = await TransportService.aceptarSolicitud(solicitud.id);
            if (result.success) {
              const viajeId = result.data?.aData?.viaje_id || result.data?.viaje_id;
              if (viajeId) navigation.navigate('ViajeActivo', { viajeId });
              else Alert.alert('Error', 'No se pudo obtener el ID del viaje');
            } else {
              Alert.alert('Error', result.error || 'No se pudo aceptar');
            }
          },
        },
      ],
    );
  };

  const handleRechazar = (item) => {
    // Opcional: llamar API de rechazo si existe
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSolicitudes();
  };

  const formatMinutos = (distanciaKm) => {
    if (distanciaKm == null || isNaN(distanciaKm)) return 'A 5 min';
    if (distanciaKm < 1) return 'A 2 min';
    if (distanciaKm < 2) return 'A 3 min';
    if (distanciaKm < 4) return 'A 5 min';
    return `A ${Math.round(distanciaKm * 2)} min`;
  };

  const formatDuracion = (distanciaKm) => {
    if (distanciaKm == null || isNaN(distanciaKm)) return '10 min';
    const min = Math.max(5, Math.round(distanciaKm * 4));
    return `${min} min`;
  };

  const renderCard = ({ item }) => {
    const distancia = item.distancia ?? 0;
    const destino = item.destino_direccion || item.destino || 'Destino';
    const ganancia = item.precio_solicitado ?? '0';
    const rating = item.pasajero_calificacion ?? '4.8';

    return (
      <View style={styles.card}>
        <Text style={styles.cardType}>VIAJE EN MOTO</Text>
        <Text style={styles.cardDestino}>Destino: {destino}</Text>
        <View style={styles.cardGanancia}>
          <Text style={styles.cardGananciaValor}>${ganancia}</Text>
          <Text style={styles.cardGananciaLabel}>GANANCIA EST.</Text>
        </View>
        <View style={styles.cardDetails}>
          <View style={styles.cardDetail}>
            <Icon name="star" size={16} color={colors.primary} />
            <Text style={styles.cardDetailText}>{rating}</Text>
          </View>
          <View style={styles.cardDetail}>
            <Icon name="location" size={16} color={colors.textMuted} />
            <Text style={styles.cardDetailText}>{formatMinutos(distancia)}</Text>
          </View>
          <View style={styles.cardDetail}>
            <Icon name="time-outline" size={16} color={colors.textMuted} />
            <Text style={styles.cardDetailText}>{formatDuracion(distancia)}</Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.btnAceptar}
            onPress={() => handleAceptar(item)}
          >
            <Text style={styles.btnAceptarText}>Aceptar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnRechazar}
            onPress={() => handleRechazar(item)}
          >
            <MaterialCommunityIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Buscando solicitudes...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Icon name="person" size={24} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Tuky Driver</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>EN LÍNEA</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Toggle Lista / Mapa */}
      <View style={styles.toggleWrap}>
        <TouchableOpacity
          style={[styles.toggleBtn, vista === 'lista' && styles.toggleBtnActive]}
          onPress={() => setVista('lista')}
        >
          <MaterialCommunityIcons
            name="format-list-bulleted"
            size={20}
            color={vista === 'lista' ? '#1A2021' : colors.text}
          />
          <Text style={[styles.toggleText, vista === 'lista' && styles.toggleTextActive]}>Lista</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, vista === 'mapa' && styles.toggleBtnActive]}
          onPress={() => setVista('mapa')}
        >
          <MaterialCommunityIcons
            name="map"
            size={20}
            color={vista === 'mapa' ? '#1A2021' : colors.text}
          />
          <Text style={[styles.toggleText, vista === 'mapa' && styles.toggleTextActive]}>Mapa</Text>
        </TouchableOpacity>
      </View>

      {/* Título + badge */}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Viajes Cercanos</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{solicitudes.length} disponibles</Text>
        </View>
      </View>

      {solicitudes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="motorbike" size={64} color={colors.textMuted} />
          <Text style={styles.emptyText}>No hay viajes cercanos</Text>
          <Text style={styles.emptySubtext}>Las nuevas solicitudes aparecerán aquí</Text>
        </View>
      ) : vista === 'lista' ? (
        <FlatList
          data={solicitudes}
          renderItem={renderCard}
          keyExtractor={(item) => item.id?.toString() ?? String(Math.random())}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      ) : (
        <View style={styles.mapPlaceholder}>
          <MaterialCommunityIcons name="map" size={48} color={colors.textMuted} />
          <Text style={styles.mapPlaceholderText}>Vista mapa próximamente</Text>
        </View>
      )}

      {/* FAB */}
      <View style={styles.fabWrap}>
        <TouchableOpacity style={styles.fab}>
          <MaterialCommunityIcons name="motorbike" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.subtitle,
    fontSize: 18,
    color: colors.text,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  onlineText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleWrap: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.full,
    padding: spacing.xs,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMuted,
  },
  toggleTextActive: {
    color: '#1A2021',
    fontWeight: '600',
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 20,
    color: colors.text,
  },
  badge: {
    backgroundColor: 'rgba(13, 242, 204, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardType: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  cardDestino: {
    ...typography.subtitle,
    fontSize: 17,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  cardGanancia: {
    marginBottom: spacing.md,
  },
  cardGananciaValor: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  cardGananciaLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  cardDetails: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  cardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardDetailText: {
    ...typography.caption,
    fontSize: 13,
    color: colors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  btnAceptar: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnAceptarText: {
    ...typography.subtitle,
    fontSize: 16,
    color: '#1A2021',
  },
  btnRechazar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.subtitle,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  fabWrap: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
