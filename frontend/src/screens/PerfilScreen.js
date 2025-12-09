import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView} from 'react-native';
import {useAuth} from '../context/AuthContext';

export default function PerfilScreen({navigation}) {
  const {user, logout} = useAuth();

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>
      {user && (
        <View style={styles.info}>
          <Text style={styles.label}>Nombre: {user.first_name} {user.last_name}</Text>
          <Text style={styles.label}>Usuario: {user.username}</Text>
          <Text style={styles.label}>Email: {user.email}</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('PerfilConductor')}>
        <Text style={styles.buttonText}>Perfil de Conductor</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonSecondary]}
        onPress={() => navigation.navigate('RegistroConductor')}>
        <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
          Registrarse como Conductor
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
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
    marginBottom: 30,
    color: '#2196F3',
  },
  info: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#2196F3',
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
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  buttonTextSecondary: {
    color: '#2196F3',
  },
  buttonDanger: {
    backgroundColor: '#f44336',
    marginTop: 20,
  },
});


