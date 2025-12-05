import React, {useState} from 'react';
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
import MotoService from '../../services/motoService';

export default function RegistrarMotoScreen({navigation}) {
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    año: '',
    placa: '',
    color: '',
    cilindrada: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegistro = async () => {
    if (
      !formData.marca ||
      !formData.modelo ||
      !formData.año ||
      !formData.placa ||
      !formData.color
    ) {
      Alert.alert('Error', 'Completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    const data = {
      ...formData,
      año: parseInt(formData.año),
    };
    const result = await MotoService.registrarMoto(data);
    setLoading(false);

    if (result.success) {
      Alert.alert('Éxito', 'Moto registrada correctamente', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Registrar Moto</Text>

      <Text style={styles.label}>Marca *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Honda"
        value={formData.marca}
        onChangeText={text => setFormData({...formData, marca: text})}
      />

      <Text style={styles.label}>Modelo *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: CBR 250"
        value={formData.modelo}
        onChangeText={text => setFormData({...formData, modelo: text})}
      />

      <Text style={styles.label}>Año *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 2020"
        value={formData.año}
        onChangeText={text => setFormData({...formData, año: text})}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Placa *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: ABC-1234"
        value={formData.placa}
        onChangeText={text => setFormData({...formData, placa: text})}
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Color *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Rojo"
        value={formData.color}
        onChangeText={text => setFormData({...formData, color: text})}
      />

      <Text style={styles.label}>Cilindrada</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 250cc"
        value={formData.cilindrada}
        onChangeText={text => setFormData({...formData, cilindrada: text})}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegistro}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Registrar Moto</Text>
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
    color: '#FF6B35',
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
  },
  button: {
    backgroundColor: '#FF6B35',
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




