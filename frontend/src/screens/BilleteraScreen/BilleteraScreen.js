import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../styles/theme';
import styles from './BilleteraScreen.styles';

// Datos de ejemplo para actividad reciente
const MOCK_TRANSACCIONES = [
  {
    id: '1',
    descripcion: 'Viaje Tuky - Centro',
    fecha: 'Hoy, 14:20',
    monto: -1250,
    tipo: 'viaje',
  },
  {
    id: '2',
    descripcion: 'Recarga Efectivo',
    fecha: 'Ayer, 09:15',
    monto: 5000,
    tipo: 'recarga',
  },
  {
    id: '3',
    descripcion: 'Viaje Tuky - Mall',
    fecha: 'Lunes, 18:45',
    monto: -2100,
    tipo: 'viaje',
  },
  {
    id: '4',
    descripcion: 'Viaje Tuky - Oficina',
    fecha: '12 Oct, 08:30',
    monto: -1800,
    tipo: 'viaje',
  },
];

function formatMonto(monto) {
  const abs = Math.abs(monto);
  const str = abs.toLocaleString('es-EC');
  return monto >= 0 ? `+$${str}` : `-$${str}`;
}

export default function BilleteraScreen({ navigation }) {
  const [saldo] = useState(15420);

  const handleVerDetalles = () => {
    // TODO: navegar a detalle de saldo cuando exista pantalla
  };

  const handleRecargar = () => {
    // TODO: flujo de recarga
  };

  const handleMetodos = () => {
    // TODO: métodos de pago
  };

  const handleVerTodo = () => {
    // TODO: lista completa de transacciones
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBack}
          onPress={() => navigation.getParent()?.navigate('Perfil') ?? navigation.goBack?.()}
        >
          <Icon name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Billetera</Text>
        <TouchableOpacity style={styles.headerHelp}>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>?</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Saldo Tuky */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceCardTop}>
            <Text style={styles.balanceLabel}>SALDO TUKY</Text>
            <TouchableOpacity style={styles.balanceScanner}>
              <MaterialCommunityIcons name="line-scan" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            ${saldo.toLocaleString('es-EC')}
          </Text>
          <View style={styles.balanceCardBottom}>
            <View style={styles.balanceIcons}>
              <View style={styles.balanceIconCircle}>
                <MaterialCommunityIcons name="motorbike" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.balanceIconCircle}>
                <MaterialCommunityIcons name="lightning-bolt" size={20} color="#FFFFFF" />
              </View>
            </View>
            <TouchableOpacity style={styles.balanceVerDetalles} onPress={handleVerDetalles}>
              <Text style={styles.balanceVerDetallesText}>Ver detalles</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botones Recargar y Métodos */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleRecargar}>
            <View style={[styles.actionButtonIconWrap, styles.actionButtonIconRecargar]}>
              <Icon name="add" size={28} color="#1A2021" />
            </View>
            <Text style={styles.actionButtonText}>Recargar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleMetodos}>
            <View style={[styles.actionButtonIconWrap, styles.actionButtonIconMetodos]}>
              <MaterialCommunityIcons name="minus" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionButtonText}>Métodos</Text>
          </TouchableOpacity>
        </View>

        {/* Actividad Reciente */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          <TouchableOpacity onPress={handleVerTodo}>
            <Text style={styles.verTodoLink}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionList}>
          {MOCK_TRANSACCIONES.map((t) => (
            <View key={t.id} style={styles.transactionItem}>
              <View
                style={[
                  styles.transactionIconWrap,
                  t.monto >= 0 ? styles.transactionIconPositive : styles.transactionIconNegative,
                ]}
              >
                {t.monto >= 0 ? (
                  <MaterialCommunityIcons name="arrow-down" size={22} color="#0df2cc" />
                ) : (
                  <MaterialCommunityIcons name="arrow-up" size={22} color={colors.danger} />
                )}
              </View>
              <View style={styles.transactionContent}>
                <Text style={styles.transactionDesc}>{t.descripcion}</Text>
                <Text style={styles.transactionDate}>{t.fecha}</Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  t.monto >= 0 ? styles.transactionAmountPositive : styles.transactionAmountNegative,
                ]}
              >
                {formatMonto(t.monto)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
