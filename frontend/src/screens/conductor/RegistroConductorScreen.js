import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import ConductorService from '../../services/conductorService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegistroConductorScreen({ navigation }) {
  const { user, reloadUser } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    telefono: '',
    licencia_numero: '',
    licencia_vencimiento: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegistro = async () => {
    // Validar campos individualmente
    if (!formData.telefono.trim()) {
      toast.showError('El campo teléfono es requerido');
      return;
    }
    if (!formData.licencia_numero.trim()) {
      toast.showError('El campo número de licencia es requerido');
      return;
    }
    if (!formData.licencia_vencimiento.trim()) {
      toast.showError('El campo fecha de vencimiento es requerido');
      return;
    }

    // Validar formato de fecha
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(formData.licencia_vencimiento)) {
      toast.showError('La fecha debe estar en formato YYYY-MM-DD (ej: 2025-12-31)');
      return;
    }

    setLoading(true);
    const result = await ConductorService.registrarConductor(formData);
    setLoading(false);

    if (result.success) {
      toast.showSuccess('Conductor registrado correctamente');
      
      // Actualizar el usuario si viene en la respuesta
      if (result.data?.aData?.user) {
        const updatedUser = result.data.aData.user;
        await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
      }
      
      // Recargar el usuario para actualizar el estado de conductor
      await reloadUser();
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } else {
      // Limpiar el mensaje de error si viene como array
      let errorMsg = result.error;
      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg.join(', ');
      }
      if (typeof errorMsg === 'string' && errorMsg.includes('[') && errorMsg.includes(']')) {
        // Remover corchetes y comillas
        errorMsg = errorMsg.replace(/[\[\]']/g, '');
      }
      toast.showError(errorMsg || 'Error al registrar conductor');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Registrarse como Conductor</Text>

      <Text style={styles.label}>Teléfono *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 0999999999"
        placeholderTextColor="#999"
        value={formData.telefono}
        onChangeText={text => setFormData({ ...formData, telefono: text })}
        keyboardType="phone-pad"
        maxLength={15}
      />

      <Text style={styles.label}>Número de Licencia *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: ABC123456"
        placeholderTextColor="#999"
        value={formData.licencia_numero}
        onChangeText={text => setFormData({ ...formData, licencia_numero: text })}
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Vencimiento de Licencia *</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD (ej: 2025-12-31)"
        placeholderTextColor="#999"
        value={formData.licencia_vencimiento}
        onChangeText={text => setFormData({ ...formData, licencia_vencimiento: text })}
        maxLength={10}
      />
      <Text style={styles.helperText}>Formato: Año-Mes-Día (ej: 2025-12-31)</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegistro}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Registrarse como Conductor</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 30,
    color: '#2196F3',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: -15,
    marginBottom: 15,
    fontStyle: 'italic',
  },
});





