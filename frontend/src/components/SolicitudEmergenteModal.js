import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

const COUNTDOWN_SEG = 15;

export default function SolicitudEmergenteModal({
  visible,
  solicitud,
  onAccept,
  onReject,
  onClose,
}) {
  const [segundos, setSegundos] = useState(COUNTDOWN_SEG);

  useEffect(() => {
    if (!visible || !solicitud) return;
    setSegundos(COUNTDOWN_SEG);
    const interval = setInterval(() => {
      setSegundos((s) => {
        if (s <= 1) {
          clearInterval(interval);
          onClose?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [visible, solicitud?.id]);

  if (!solicitud) return null;

  const origen = solicitud.origen_direccion || solicitud.origen || 'Origen';
  const destino = solicitud.destino_direccion || solicitud.destino || 'Destino';
  const precio = solicitud.precio_solicitado ?? '0';
  const metodoPago = solicitud.metodo_pago || 'Efectivo';
  const distanciaOrigen = solicitud.distancia_origen_km != null ? `${solicitud.distancia_origen_km.toFixed(1)} km` : '1.2 km';
  const distanciaDestino = solicitud.distancia_km != null ? `${solicitud.distancia_km.toFixed(1)} km` : '2.3 km';
  const totalKm = solicitud.distancia_total_km != null ? `${solicitud.distancia_total_km.toFixed(1)} km` : '3.5 km';
  const minutosPickup = solicitud.minutos_pickup ?? 4;
  const nombrePasajero = solicitud.pasajero_nombre || solicitud.user__first_name || 'Pasajero';
  const rating = solicitud.pasajero_calificacion ?? '4.9';
  const totalViajes = solicitud.pasajero_viajes ?? '248';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        {/* Timer circular arriba */}
        <View style={styles.timerWrap}>
          <View style={[styles.timerCircle, styles.timerBg]}>
            <View style={styles.timerInner}>
              <Text style={styles.timerNum}>{segundos}</Text>
              <Text style={styles.timerLabel}>SEG</Text>
            </View>
          </View>
        </View>

        {/* Card oscura */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.pasajeroRow}>
              <View style={styles.avatar}>
                <Icon name="person" size={32} color={colors.textMuted} />
              </View>
              <View style={styles.pasajeroInfo}>
                <View style={styles.pasajeroNombreRow}>
                  <Text style={styles.pasajeroNombre}>{nombrePasajero}</Text>
                  <MaterialCommunityIcons name="motorbike" size={18} color={colors.primary} />
                </View>
                <Text style={styles.pasajeroRating}>
                  ★ {rating} ({totalViajes} viajes)
                </Text>
              </View>
            </View>
            <View style={styles.precioWrap}>
              <Text style={styles.precioValor}>${precio}</Text>
              <Text style={styles.precioLabel}>ESTIMADO</Text>
            </View>
          </View>

          <View style={styles.ruta}>
            <View style={styles.rutaRow}>
              <Icon name="location" size={18} color={colors.primary} />
              <View style={styles.rutaContent}>
                <Text style={styles.rutaLabel}>DESDE</Text>
                <Text style={styles.rutaDir}>{origen}</Text>
              </View>
              <Text style={styles.rutaMeta}>{distanciaOrigen} · A {minutosPickup} min</Text>
            </View>
            <View style={styles.rutaLine} />
            <View style={styles.rutaRow}>
              <Icon name="location" size={18} color={colors.danger} />
              <View style={styles.rutaContent}>
                <Text style={styles.rutaLabel}>HACIA</Text>
                <Text style={styles.rutaDir} numberOfLines={1}>{destino}</Text>
              </View>
              <Text style={styles.rutaMeta}>{distanciaDestino} · Total viaje</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="cash" size={16} color={colors.textMuted} />
              <Text style={styles.metaText}>{metodoPago}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="map-marker-path" size={16} color={colors.textMuted} />
              <Text style={styles.metaText}>{totalKm} total</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnRechazar} onPress={onReject}>
              <Text style={styles.btnRechazarText}>RECHAZAR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnAceptar} onPress={() => onAccept(solicitud)}>
              <Text style={styles.btnAceptarText}>ACEPTAR</Text>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#1A2021" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  timerWrap: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 10,
  },
  timerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerBg: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 4,
    borderColor: colors.primary,
  },
  timerInner: {
    alignItems: 'center',
  },
  timerNum: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  timerLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl + 20,
    minHeight: 380,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  pasajeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  pasajeroInfo: { flex: 1 },
  pasajeroNombreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pasajeroNombre: {
    ...typography.subtitle,
    fontSize: 18,
    color: colors.text,
  },
  pasajeroRating: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  precioWrap: {
    alignItems: 'flex-end',
  },
  precioValor: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
  },
  precioLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  ruta: {
    marginBottom: spacing.md,
  },
  rutaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rutaContent: { flex: 1 },
  rutaLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 2,
  },
  rutaDir: {
    ...typography.body,
    color: colors.text,
    fontSize: 14,
  },
  rutaMeta: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
  },
  rutaLine: {
    width: 2,
    height: 16,
    backgroundColor: colors.border,
    marginLeft: 9,
    marginVertical: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  btnRechazar: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRechazarText: {
    ...typography.subtitle,
    color: colors.text,
    fontSize: 15,
  },
  btnAceptar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  btnAceptarText: {
    ...typography.subtitle,
    color: '#1A2021',
    fontSize: 15,
  },
});
