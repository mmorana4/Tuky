import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../styles/theme';
import styles from './SeguridadScreen.styles';

export default function SeguridadScreen({ navigation }) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const handleCambiarContrasena = () => {
    // TODO: navegar a pantalla cambiar contraseña
  };

  const handleDispositivos = () => {
    // TODO: pantalla dispositivos vinculados
  };

  const handleEliminarCuenta = () => {
    Alert.alert(
      'Eliminar cuenta',
      'Esta acción no se puede deshacer. ¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBack}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seguridad</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.bottomPadding}
        showsVerticalScrollIndicator={false}
      >
        {/* CONFIGURACIÓN DE SEGURIDAD */}
        <Text style={styles.sectionLabel}>CONFIGURACIÓN DE SEGURIDAD</Text>

        <TouchableOpacity style={styles.card} onPress={handleCambiarContrasena}>
          <View style={styles.cardRow}>
            <View style={styles.cardIconWrap}>
              <MaterialCommunityIcons name="lock-outline" size={24} color="#0df2cc" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Cambiar Contraseña</Text>
              <Text style={styles.cardSubtitle}>Actualiza tu clave de acceso</Text>
            </View>
            <Icon name="chevron-forward" size={22} color="#888" style={styles.cardChevron} />
          </View>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardIconWrap}>
              <MaterialCommunityIcons name="shield-check" size={24} color="#0df2cc" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Autenticación de dos pasos</Text>
              <Text style={styles.cardSubtitle}>Protege tu cuenta con un código extra</Text>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={setTwoFactorEnabled}
              trackColor={{ false: colors.background, true: '#0df2cc' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.card} onPress={handleDispositivos}>
          <View style={styles.cardRow}>
            <View style={styles.cardIconWrap}>
              <MaterialCommunityIcons name="monitor-multiple" size={24} color="#0df2cc" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Dispositivos vinculados</Text>
              <Text style={styles.cardSubtitle}>Gestiona tus sesiones activas</Text>
            </View>
            <Icon name="chevron-forward" size={22} color="#888" style={styles.cardChevron} />
          </View>
        </TouchableOpacity>

        {/* ZONA DE PELIGRO */}
        <Text style={styles.sectionLabel}>ZONA DE PELIGRO</Text>

        <TouchableOpacity
          style={[styles.card, styles.dangerCard]}
          onPress={handleEliminarCuenta}
        >
          <View style={styles.cardRow}>
            <View style={[styles.cardIconWrap, styles.dangerIconWrap]}>
              <MaterialCommunityIcons name="close" size={24} color="#F44336" />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, styles.dangerTitle]}>Eliminar Cuenta</Text>
              <Text style={[styles.cardSubtitle, styles.dangerSubtitle]}>
                Esta acción no se puede deshacer
              </Text>
            </View>
            <Icon name="chevron-forward" size={22} color="#888" style={styles.cardChevron} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
