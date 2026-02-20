import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import ConductorService from '../../services/conductorService';
import { useToast } from '../../context/ToastContext';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import styles from './PerfilPasajeroScreen.styles';

export default function PerfilPasajeroScreen({ navigation }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const { showConfirm, DialogComponent } = useConfirmDialog();
  const [stats, setStats] = useState({
    viajesRealizados: 0,
    calificacionPromedio: 0,
    kmAproximados: '0',
    antiguedad: '0',
  });
  const [esConductor, setEsConductor] = useState(false);
  const [verificandoConductor, setVerificandoConductor] = useState(true);

  useEffect(() => {
    verificarSiEsConductor();
  }, []);

  const verificarSiEsConductor = async () => {
    setVerificandoConductor(true);
    try {
      const result = await ConductorService.obtenerPerfil();
      setEsConductor(result.success || false);
      if (result.success && result.data) {
        const d = result.data;
        setStats(prev => ({
          ...prev,
          viajesRealizados: d.total_viajes ?? prev.viajesRealizados,
          calificacionPromedio: parseFloat(d.calificacion_promedio) || prev.calificacionPromedio,
        }));
      }
    } catch {
      setEsConductor(false);
    } finally {
      setVerificandoConductor(false);
    }
  };

  const handleLogout = () => {
    showConfirm({
      title: 'Cerrar Sesión',
      message: '¿Estás seguro que deseas cerrar sesión?',
      type: 'warning',
      icon: 'log-out-outline',
      confirmText: 'Cerrar Sesión',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        await logout();
      },
    });
  };

  const modoPasajero = () => {
    toast.showInfo('Ya estás en modo pasajero');
  };

  const modoConductor = () => {
    if (esConductor) {
      navigation.navigate('PerfilConductor');
    } else {
      toast.showWarning('Regístrate como conductor para acceder al modo conductor.');
      navigation.navigate('RegistroConductor');
    }
  };

  const calificacion = (stats.calificacionPromedio || 0).toFixed(1);
  const viajes = stats.viajesRealizados ?? 0;
  const km = stats.kmAproximados || '0';
  const antiguedad = stats.antiguedad || '0';
  const nombre = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Usuario';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DialogComponent />

      {/* Barra superior */}
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.navButton} onPress={() => {}}>
          <Icon name="chevron-back" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Perfil</Text>
        <TouchableOpacity style={styles.navButton}>
          <Icon name="notifications-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.bottomPadding}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + nombre + membresía */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarPlaceholder}>
              <Icon name="person" size={48} color="#888" />
            </View>
            <View style={styles.ratingBadge}>
              <Icon name="star" size={14} color="#FFFFFF" />
              <Text style={styles.ratingText}>{calificacion}</Text>
            </View>
          </View>
          <Text style={styles.profileName}>{nombre}</Text>
          <Text style={styles.membershipLabel}>MIEMBRO GOLD</Text>
        </View>

        {/* Selector Modo Pasajero | Modo Conductor */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeOption, styles.modeOptionActive]}
            onPress={modoPasajero}
          >
            <MaterialCommunityIcons name="account-plus" size={20} color="#FFFFFF" />
            <Text style={[styles.modeOptionText, styles.modeOptionTextActive]}>
              Modo Pasajero
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modeOption}
            onPress={modoConductor}
          >
            <MaterialCommunityIcons name="motorbike" size={20} color="#CCCCCC" />
            <Text style={styles.modeOptionText}>Modo Conductor</Text>
          </TouchableOpacity>
        </View>

        {/* Estadísticas */}
        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{viajes}</Text>
            <Text style={styles.statLabel}>VIAJES</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{km}</Text>
            <Text style={styles.statLabel}>KM</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{antiguedad}</Text>
            <Text style={styles.statLabel}>ANTIGÜEDAD</Text>
          </View>
        </View>

        {/* GENERAL */}
        <Text style={styles.sectionLabel}>GENERAL</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => {}}
          >
            <View style={styles.menuIconWrap}>
              <MaterialCommunityIcons name="account-outline" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.menuText}>Mi Cuenta</Text>
            <Icon name="chevron-forward" size={20} color="#888" style={styles.menuChevron} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => navigation.navigate('Billetera')}
          >
            <View style={styles.menuIconWrap}>
              <MaterialCommunityIcons name="wallet-outline" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.menuText}>Billetera</Text>
            <Icon name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => navigation.navigate('Seguridad')}
          >
            <View style={styles.menuIconWrap}>
              <MaterialCommunityIcons name="shield-check-outline" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.menuText}>Seguridad</Text>
            <Icon name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Configuracion')}
          >
            <View style={styles.menuIconWrap}>
              <MaterialCommunityIcons name="cog-outline" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.menuText}>Configuración</Text>
            <Icon name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {/* SOPORTE */}
        <Text style={styles.sectionLabel}>SOPORTE</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => {}}
          >
            <View style={styles.menuIconWrap}>
              <View style={styles.menuIconHelp}>
                <Icon name="help" size={16} color="#1A2021" />
              </View>
            </View>
            <Text style={styles.menuText}>Ayuda</Text>
            <Icon name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.logoutIconWrap}>
              <View style={styles.logoutIcon}>
                <MaterialCommunityIcons name="logout" size={14} color="#FFFFFF" />
              </View>
            </View>
            <Text style={[styles.menuText, styles.menuTextDanger]}>Cerrar Sesión</Text>
            <Icon name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
