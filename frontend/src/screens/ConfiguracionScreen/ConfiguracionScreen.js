import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { createStyles } from './ConfiguracionScreen.styles';

const APP_VERSION = '2.4.0';

const THEME_LABELS = {
  dark: 'Oscuro',
  light: 'Claro',
  system: 'Según el dispositivo',
};

export default function ConfiguracionScreen({ navigation }) {
  const { colors, themeMode } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [modoSilencioso, setModoSilencioso] = useState(false);
  const [vehiculosElectricos, setVehiculosElectricos] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.bottomPadding}
        showsVerticalScrollIndicator={false}
      >
        {/* GENERAL */}
        <Text style={styles.sectionLabel}>GENERAL</Text>

        <TouchableOpacity style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardIconWrap}>
              <MaterialCommunityIcons name="translate" size={24} color="#0df2cc" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Idioma</Text>
              <Text style={styles.cardSubtitle}>Español (ES)</Text>
            </View>
            <Icon name="chevron-forward" size={22} color={colors.textMuted} />
          </View>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardIconWrap}>
              <MaterialCommunityIcons name="bell-outline" size={24} color="#0df2cc" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Notificaciones push</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: colors.surface, true: '#0df2cc' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Tema')}
        >
          <View style={styles.cardRow}>
            <View style={styles.cardIconWrap}>
              <MaterialCommunityIcons name="theme-light-dark" size={24} color="#0df2cc" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Apariencia</Text>
              <Text style={styles.cardSubtitle}>{THEME_LABELS[themeMode]}</Text>
            </View>
            <Icon name="chevron-forward" size={22} color={colors.textMuted} />
          </View>
        </TouchableOpacity>

        {/* PREFERENCIAS DE VIAJE */}
        <Text style={styles.sectionLabel}>PREFERENCIAS DE VIAJE</Text>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardIconWrap}>
              <MaterialCommunityIcons name="volume-off" size={24} color="#0df2cc" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Modo silencioso</Text>
              <Text style={styles.cardSubtitle}>El conductor evitará hablar</Text>
            </View>
            <Switch
              value={modoSilencioso}
              onValueChange={setModoSilencioso}
              trackColor={{ false: colors.surface, true: '#0df2cc' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardIconWrap}>
              <MaterialCommunityIcons name="motorbike-electric" size={24} color="#0df2cc" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Vehículos eléctricos</Text>
              <Text style={styles.cardSubtitle}>Priorizar conductores con Tuky-E</Text>
            </View>
            <Switch
              value={vehiculosElectricos}
              onValueChange={setVehiculosElectricos}
              trackColor={{ false: colors.surface, true: '#0df2cc' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* SOPORTE */}
        <Text style={styles.sectionLabel}>SOPORTE</Text>

        <TouchableOpacity style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardIconWrap}>
              <MaterialCommunityIcons name="file-document-outline" size={24} color="#0df2cc" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Términos y condiciones</Text>
            </View>
            <Icon name="chevron-forward" size={22} color={colors.textMuted} />
          </View>
        </TouchableOpacity>

        <Text style={styles.versionText}>TUKY APP V{APP_VERSION}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
