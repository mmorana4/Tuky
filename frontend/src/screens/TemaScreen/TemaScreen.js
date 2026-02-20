import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { createStyles } from './TemaScreen.styles';

const OPTIONS = [
  { key: 'dark', title: 'Oscuro', subtitle: 'Tema oscuro siempre' },
  { key: 'light', title: 'Claro', subtitle: 'Tema claro siempre' },
  { key: 'system', title: 'Según el dispositivo', subtitle: 'Usar configuración del sistema' },
];

export default function TemaScreen({ navigation }) {
  const { themeMode, setThemeMode, colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleSelect = (key) => {
    setThemeMode(key);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apariencia</Text>
      </View>

      <Text style={styles.sectionLabel}>TEMA</Text>
      <View style={styles.card}>
        {OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={styles.optionRow}
            onPress={() => handleSelect(opt.key)}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{opt.title}</Text>
              <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
            </View>
            {themeMode === opt.key && (
              <View style={styles.checkWrap}>
                <Icon name="checkmark" size={18} color="#1A2021" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
