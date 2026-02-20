import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';

const styles = {
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  headerBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { ...typography.title, fontSize: 18, color: colors.text },
  headerStep: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  progressWrap: { width: 80, alignItems: 'flex-end' },
  progressText: { ...typography.caption, color: colors.primary },
  progressBar: {
    height: 4,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, width: '25%' },
  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1,
    marginLeft: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  docCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  docIcon: { marginBottom: spacing.sm },
  docTitle: { ...typography.body, fontWeight: '600', color: colors.text, marginBottom: 4 },
  docSub: { ...typography.caption, color: colors.textMuted },
  btnSubir: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  btnSubirText: { ...typography.caption, fontWeight: '700', color: '#1A2021' },
  btnContinuar: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 4,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  btnContinuarText: { ...typography.subtitle, color: '#1A2021' },
};

export default function AgregarVehiculoPaso1Screen({ navigation }) {
  const [form, setForm] = useState({
    marca: '',
    modelo: '',
    año: '2023',
    placa: '',
  });
  const [fotoMoto, setFotoMoto] = useState(null);
  const [tarjetaPropiedad, setTarjetaPropiedad] = useState(null);

  const handleSubirFotoMoto = () => {
    // TODO: abrir cámara/galería
    Alert.alert('Subir foto', 'Se abrirá la cámara o galería para subir la foto de la moto.');
  };

  const handleSubirTarjeta = () => {
    Alert.alert('Subir documento', 'Se abrirá la cámara o galería para la tarjeta de propiedad.');
  };

  const handleContinuar = () => {
    if (!form.marca.trim() || !form.modelo.trim() || !form.año.trim() || !form.placa.trim()) {
      Alert.alert('Campos requeridos', 'Completa Marca, Modelo, Año y Placa.');
      return;
    }
    navigation.navigate('AgregarVehiculoPaso2', {
      paso1: { ...form, año: parseInt(form.año, 10) || 2023 },
      fotoMoto,
      tarjetaPropiedad,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Información de tu Moto</Text>
          <Text style={styles.headerStep}>PASO 1 DE 2</Text>
        </View>
        <View style={styles.progressWrap}>
          <Text style={styles.progressText}>25% completado</Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>DETALLES DEL VEHÍCULO</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Honda, Yamaha, Pulsar"
          placeholderTextColor={colors.placeholder}
          value={form.marca}
          onChangeText={(t) => setForm((f) => ({ ...f, marca: t }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Ej. CB 190R"
          placeholderTextColor={colors.placeholder}
          value={form.modelo}
          onChangeText={(t) => setForm((f) => ({ ...f, modelo: t }))}
        />
        <TextInput
          style={styles.input}
          placeholder="2023"
          placeholderTextColor={colors.placeholder}
          value={form.año}
          onChangeText={(t) => setForm((f) => ({ ...f, año: t }))}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="ABC-123"
          placeholderTextColor={colors.placeholder}
          value={form.placa}
          onChangeText={(t) => setForm((f) => ({ ...f, placa: t }))}
          autoCapitalize="characters"
        />

        <Text style={styles.sectionLabel}>DOCUMENTACIÓN</Text>
        <View style={styles.docCard}>
          <View style={styles.docIcon}>
            <MaterialCommunityIcons name="motorbike" size={40} color={colors.primary} />
          </View>
          <Text style={styles.docTitle}>Foto de la Moto</Text>
          <Text style={styles.docSub}>Vista lateral completa</Text>
          <TouchableOpacity style={styles.btnSubir} onPress={handleSubirFotoMoto}>
            <MaterialCommunityIcons name="camera" size={18} color="#1A2021" />
            <Text style={styles.btnSubirText}>SUBIR</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.docCard}>
          <View style={styles.docIcon}>
            <MaterialCommunityIcons name="card-account-details-outline" size={40} color={colors.primary} />
          </View>
          <Text style={styles.docTitle}>Tarjeta de Propiedad</Text>
          <Text style={styles.docSub}>Ambas caras legibles</Text>
          <TouchableOpacity style={styles.btnSubir} onPress={handleSubirTarjeta}>
            <MaterialCommunityIcons name="file-upload-outline" size={18} color="#1A2021" />
            <Text style={styles.btnSubirText}>SUBIR</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btnContinuar} onPress={handleContinuar}>
          <Text style={styles.btnContinuarText}>CONTINUAR</Text>
          <MaterialCommunityIcons name="arrow-right" size={22} color="#1A2021" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
