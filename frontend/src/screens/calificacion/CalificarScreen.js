import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import CalificacionService from '../../services/calificacionService';

export default function CalificarScreen({route, navigation}) {
  const {viajeId, calificadoId, esConductor} = route.params;
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCalificar = async () => {
    if (puntuacion === 0) {
      Alert.alert('Error', 'Debes seleccionar una calificación');
      return;
    }

    setLoading(true);
    const result = await CalificacionService.calificar(
      viajeId,
      calificadoId,
      puntuacion,
      comentario,
    );
    setLoading(false);

    if (result.success) {
      Alert.alert('Éxito', 'Calificación enviada', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const renderEstrellas = () => {
    const estrellas = [];
    for (let i = 1; i <= 5; i++) {
      estrellas.push(
        <TouchableOpacity
          key={i}
          onPress={() => setPuntuacion(i)}
          style={styles.estrella}>
          <Text style={[styles.estrellaText, puntuacion >= i && styles.estrellaActiva]}>
            ★
          </Text>
        </TouchableOpacity>,
      );
    }
    return estrellas;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Calificar {esConductor ? 'Conductor' : 'Pasajero'}
      </Text>

      <View style={styles.estrellasContainer}>
        <Text style={styles.label}>Calificación:</Text>
        <View style={styles.estrellas}>{renderEstrellas()}</View>
        {puntuacion > 0 && (
          <Text style={styles.puntuacionText}>{puntuacion}/5</Text>
        )}
      </View>

      <Text style={styles.label}>Comentario (opcional):</Text>
      <TextInput
        style={styles.comentario}
        placeholder="Escribe un comentario..."
        value={comentario}
        onChangeText={setComentario}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleCalificar}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Enviar Calificación</Text>
        )}
      </TouchableOpacity>
    </View>
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
  estrellasContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  estrellas: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  estrella: {
    marginHorizontal: 5,
  },
  estrellaText: {
    fontSize: 40,
    color: '#ddd',
  },
  estrellaActiva: {
    color: '#FFD700',
  },
  puntuacionText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  comentario: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 30,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});





