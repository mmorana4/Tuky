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

export default function RegistroConductorScreen({ navigation }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    telefono: '',
    licencia_numero: '',
    licencia_vencimiento: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegistro = async () => {
    if (!formData.telefono || !formData.licencia_numero || !formData.licencia_vencimiento) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    setLoading(true);
    const result = await ConductorService.registrarConductor(formData);
    setLoading(false);

    if (result.success) {
      Alert.alert('Éxito', 'Conductor registrado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Registrarse como Conductor</Text>

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 0999999999"
        placeholderTextColor="#999"
        value={formData.telefono}
        onChangeText={text => setFormData({ ...formData, telefono: text })}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Número de Licencia</Text>
      <TextInput
        style={styles.input}
        placeholder="Número de licencia"
        placeholderTextColor="#999"
        value={formData.licencia_numero}
        onChangeText={text => setFormData({ ...formData, licencia_numero: text })}
      />

      <Text style={styles.label}>Vencimiento de Licencia</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#999"
        value={formData.licencia_vencimiento}
        onChangeText={text => setFormData({ ...formData, licencia_vencimiento: text })}
      />

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
});





