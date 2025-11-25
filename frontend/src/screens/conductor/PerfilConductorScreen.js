import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import ConductorService from '../../services/conductorService';

export default function PerfilConductorScreen({navigation}) {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    setLoading(true);
    const result = await ConductorService.obtenerPerfil();
    setLoading(false);

    if (result.success) {
      setPerfil(result.data.data?.conductor);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!perfil) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No eres conductor</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('RegistroConductor')}>
          <Text style={styles.buttonText}>Registrarse como Conductor</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mi Perfil de Conductor</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Licencia:</Text>
        <Text style={styles.value}>{perfil.licencia_numero}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Teléfono:</Text>
        <Text style={styles.value}>{perfil.telefono}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Calificación Promedio:</Text>
        <Text style={styles.value}>{perfil.calificacion_promedio}/5.00</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Total de Viajes:</Text>
        <Text style={styles.value}>{perfil.total_viajes}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Estado:</Text>
        <Text style={styles.value}>{perfil.estado}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ModoConductor')}>
        <Text style={styles.buttonText}>Modo Conductor</Text>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#FF6B35',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FF6B35',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});


