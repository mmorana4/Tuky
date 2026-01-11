import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import authService from '../../services/authService';
import { useToast } from '../../context/ToastContext';

export default function RegisterScreen({ navigation }) {
  const toast = useToast();
  const [tipoUsuario, setTipoUsuario] = useState('pasajero'); // 'pasajero' o 'conductor'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    // Campos adicionales para conductor
    telefono: '',
    licencia_numero: '',
    licencia_vencimiento: '',
  });

  const handleRegister = async () => {
    // Validar campos básicos
    if (!formData.username || !formData.password || !formData.email || !formData.first_name || !formData.last_name) {
      toast.showError('Todos los campos básicos son requeridos');
      return;
    }

    // Si es conductor, validar campos adicionales
    if (tipoUsuario === 'conductor') {
      if (!formData.telefono || !formData.licencia_numero || !formData.licencia_vencimiento) {
        toast.showError('Para registrarse como conductor, complete todos los campos (teléfono, número de licencia y vencimiento)');
        return;
      }
    }

    try {
      // Preparar datos para enviar
      const dataToSend = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        is_conductor: tipoUsuario === 'conductor',
      };

      // Si es conductor, agregar campos adicionales
      if (tipoUsuario === 'conductor') {
        dataToSend.telefono = formData.telefono;
        dataToSend.licencia_numero = formData.licencia_numero;
        dataToSend.licencia_vencimiento = formData.licencia_vencimiento;
      }

      const result = await authService.register(dataToSend);

      if (result.success) {
        toast.showSuccess(tipoUsuario === 'conductor' ? 'Conductor registrado correctamente' : 'Usuario registrado correctamente');
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1500);
      } else {
        toast.showError(result.error || 'No se pudo registrar');
      }
    } catch (error) {
      toast.showError('Error al registrar usuario');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>

      {/* Selector de tipo de usuario */}
      <View style={styles.selectorContainer}>
        <TouchableOpacity
          style={[styles.selectorButton, tipoUsuario === 'pasajero' && styles.selectorButtonActive]}
          onPress={() => setTipoUsuario('pasajero')}>
          <Text style={[styles.selectorText, tipoUsuario === 'pasajero' && styles.selectorTextActive]}>
            Pasajero
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.selectorButton, tipoUsuario === 'conductor' && styles.selectorButtonActive]}
          onPress={() => setTipoUsuario('conductor')}>
          <Text style={[styles.selectorText, tipoUsuario === 'conductor' && styles.selectorTextActive]}>
            Conductor
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Nombres"
        placeholderTextColor="#999"
        value={formData.first_name}
        onChangeText={text => setFormData({ ...formData, first_name: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Apellidos"
        placeholderTextColor="#999"
        value={formData.last_name}
        onChangeText={text => setFormData({ ...formData, last_name: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Usuario"
        placeholderTextColor="#999"
        value={formData.username}
        onChangeText={text => setFormData({ ...formData, username: text })}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={formData.email}
        onChangeText={text => setFormData({ ...formData, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#999"
        value={formData.password}
        onChangeText={text => setFormData({ ...formData, password: text })}
        secureTextEntry
      />

      {/* Campos adicionales para conductor */}
      {tipoUsuario === 'conductor' && (
        <>
          <Text style={styles.sectionTitle}>Datos de Conductor</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            placeholderTextColor="#999"
            value={formData.telefono}
            onChangeText={text => setFormData({ ...formData, telefono: text })}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Número de Licencia"
            placeholderTextColor="#999"
            value={formData.licencia_numero}
            onChangeText={text => setFormData({ ...formData, licencia_numero: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Vencimiento de Licencia (YYYY-MM-DD)"
            placeholderTextColor="#999"
            value={formData.licencia_vencimiento}
            onChangeText={text => setFormData({ ...formData, licencia_vencimiento: text })}
          />
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>
          {tipoUsuario === 'conductor' ? 'Registrarse como Conductor' : 'Registrarse'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('Login')}
        style={styles.linkButton}>
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 30,
    color: '#2196F3',
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorButtonActive: {
    backgroundColor: '#2196F3',
  },
  selectorText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  selectorTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#2196F3',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#2196F3',
    fontSize: 14,
  },
});





