import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ConductorService from '../../services/conductorService';
import { colors, spacing } from '../../styles/theme';

export default function PerfilConductorScreen({ navigation }) {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    setLoading(true);
    const result = await ConductorService.obtenerPerfil();
    setLoading(false);
    if (result.success) {
      setPerfil(result.data.data?.conductor);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!perfil) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No eres conductor</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('RegistroConductor')}
        >
          <Text style={styles.buttonText}>Registrarse como Conductor</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mi Perfil de Conductor</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Licencia:</Text>
        <Text style={styles.value}>{perfil.licencia_numero}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Teléfono:</Text>
        <Text style={styles.value}>{perfil.telefono}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Calificación Promedio:</Text>
        <Text style={styles.value}>{perfil.calificacion_promedio}/5.00</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Total de Viajes:</Text>
        <Text style={styles.value}>{perfil.total_viajes}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Estado:</Text>
        <Text style={styles.value}>{perfil.estado}</Text>
      </View>

      <TouchableOpacity
        style={styles.buttonAgregar}
        onPress={() => navigation.navigate('AgregarVehiculoPaso1')}
      >
        <MaterialCommunityIcons name="motorbike" size={24} color="#1A2021" />
        <Text style={styles.buttonAgregarText}>Agregar vehículo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ModoConductor')}
      >
        <Text style={styles.buttonText}>Modo Conductor</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: colors.primary,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 5,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  buttonAgregar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  buttonAgregarText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1A2021',
  },
  button: {
    backgroundColor: colors.backgroundSecondary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonText: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: 'bold',
  },
});





