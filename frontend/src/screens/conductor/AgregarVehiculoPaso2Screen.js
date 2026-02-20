import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';
import MotoService from '../../services/motoService';

const DOCS = [
  { key: 'soat', label: 'SOAT', icon: 'file-document-outline', statusKey: 'soat' },
  { key: 'licencia', label: 'Licencia de Conducir', icon: 'card-account-details-outline', statusKey: 'licencia' },
  { key: 'tarjeta', label: 'Tarjeta de Propiedad', icon: 'motorbike', statusKey: 'tarjeta' },
];

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
  progressFill: { height: '100%', backgroundColor: colors.primary },
  intro: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  introTitle: { ...typography.subtitle, color: colors.text, marginBottom: spacing.xs },
  introSub: { ...typography.caption, color: colors.textMuted },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(13, 242, 204, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardContent: { flex: 1 },
  cardTitle: { ...typography.body, fontWeight: '600', color: colors.text },
  cardStatus: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  btnSubir: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
  },
  btnSubirDisabled: { backgroundColor: colors.border },
  btnSubirText: { ...typography.caption, fontWeight: '700', color: '#1A2021' },
  btnSubirTextDisabled: { color: colors.textMuted },
  tip: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  tipText: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  btnFinalizar: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 4,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  btnFinalizarDisabled: { backgroundColor: colors.border, opacity: 0.8 },
  btnFinalizarText: { ...typography.subtitle, color: '#1A2021' },
  hint: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
};

export default function AgregarVehiculoPaso2Screen({ navigation, route }) {
  const { paso1 } = route.params || {};
  const [docStatus, setDocStatus] = useState({ soat: false, licencia: false, tarjeta: false });
  const [loading, setLoading] = useState(false);

  const allUploaded = docStatus.soat && docStatus.licencia && docStatus.tarjeta;

  const handleSubir = (key) => {
    Alert.alert('Subir documento', `Se abrirá la cámara o galería para ${DOCS.find((d) => d.key === key)?.label}.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Simular subido', onPress: () => setDocStatus((s) => ({ ...s, [key]: true })) },
    ]);
  };

  const handleFinalizar = async () => {
    if (!allUploaded) return;
    setLoading(true);
    const data = {
      marca: paso1?.marca || '',
      modelo: paso1?.modelo || '',
      año: paso1?.año || 2023,
      placa: paso1?.placa || '',
      color: '',
      cilindrada: '',
    };
    const result = await MotoService.registrarMoto(data);
    setLoading(false);
    if (result.success) {
      Alert.alert('Listo', 'Vehículo registrado correctamente.', [
        { text: 'OK', onPress: () => navigation.navigate('PerfilConductorMain') },
      ]);
    } else {
      Alert.alert('Error', result.error || 'No se pudo registrar el vehículo.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Documentos Legales</Text>
          <Text style={styles.headerStep}>PASO 2 DE 2</Text>
        </View>
        <View style={styles.progressWrap}>
          <Text style={styles.progressText}>50% completado</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Carga tus documentos</Text>
          <Text style={styles.introSub}>
            Por favor, carga fotos claras de tus documentos para activar tu cuenta de conductor en Tuky.
          </Text>
        </View>

        {DOCS.map((doc) => (
          <View key={doc.key} style={styles.card}>
            <View style={styles.cardIcon}>
              <MaterialCommunityIcons name={doc.icon} size={24} color={colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{doc.label}</Text>
              <Text style={styles.cardStatus}>
                {docStatus[doc.key] ? 'Subido' : doc.key === 'tarjeta' ? 'No iniciado' : 'Pendiente'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.btnSubir, docStatus[doc.key] && styles.btnSubirDisabled]}
              onPress={() => !docStatus[doc.key] && handleSubir(doc.key)}
            >
              <Text style={[styles.btnSubirText, docStatus[doc.key] && styles.btnSubirTextDisabled]}>Subir</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.tip}>
          <MaterialCommunityIcons name="lightbulb-outline" size={22} color={colors.primary} />
          <Text style={styles.tipText}>
            Asegúrate de que la foto tenga buena iluminación y que todo el texto sea legible.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.btnFinalizar, !allUploaded && styles.btnFinalizarDisabled]}
          onPress={handleFinalizar}
          disabled={!allUploaded || loading}
        >
          {loading ? (
            <ActivityIndicator color="#1A2021" />
          ) : (
            <Text style={styles.btnFinalizarText}>Finalizar Registro</Text>
          )}
        </TouchableOpacity>
        {!allUploaded && <Text style={styles.hint}>Debes subir todos los documentos para continuar</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}
