import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/Ionicons';
import TransportService from '../services/transportService';
import { useToast } from '../context/ToastContext';

export default function SolicitarViajeScreen({ navigation }) {
  const toast = useToast();
  
  // Estados para el flujo paso a paso
  const [paso, setPaso] = useState('origen'); // 'origen' o 'destino'
  const [showModalOrigen, setShowModalOrigen] = useState(true);
  const [showModalDestino, setShowModalDestino] = useState(false);
  const [modoSeleccionOrigen, setModoSeleccionOrigen] = useState(null); // 'actual', 'ingresar', 'mapa'
  const [modoSeleccionDestino, setModoSeleccionDestino] = useState(null); // 'mapa', 'ingresar'
  
  // Estados de ubicaciones
  const [origen, setOrigen] = useState(null);
  const [destino, setDestino] = useState(null);
  const [origenAddress, setOrigenAddress] = useState('');
  const [destinoAddress, setDestinoAddress] = useState('');
  const [direccionIngresadaOrigen, setDireccionIngresadaOrigen] = useState('');
  const [direccionIngresadaDestino, setDireccionIngresadaDestino] = useState('');
  
  // Estados del formulario
  const [precio, setPrecio] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [distancia, setDistancia] = useState(0);
  const [precioSugerido, setPrecioSugerido] = useState('0.00');
  const [loading, setLoading] = useState(false);
  const [buscandoDireccion, setBuscandoDireccion] = useState(false);
  
  // Estado del mapa
  const [region, setRegion] = useState({
    latitude: -2.170998,
    longitude: -79.922359,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    // No obtener ubicación automáticamente, esperar a que el usuario elija
  }, []);

  const obtenerUbicacionActual = () => {
    setBuscandoDireccion(true);
    Geolocation.getCurrentPosition(
      position => {
        const loc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setOrigen(loc);
        setOrigenAddress('Ubicación actual');
        setRegion({
          ...region,
          latitude: loc.latitude,
          longitude: loc.longitude,
        });
        setShowModalOrigen(false);
        setShowModalDestino(true);
        setPaso('destino');
        setBuscandoDireccion(false);
      },
      error => {
        toast.showError('No se pudo obtener la ubicación. Verifica que tengas los permisos de ubicación activados.');
        setBuscandoDireccion(false);
      },
    );
  };

  // Geocodificación simple usando Google Maps Geocoding API
  const geocodificarDireccion = async (direccion) => {
    try {
      const API_KEY = 'AIzaSyCUK0r2jPEqxWSMRj3GWmZRzo2hICdcq6o';
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(direccion)}&key=${API_KEY}`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
          address: data.results[0].formatted_address,
        };
      } else {
        throw new Error('No se encontró la dirección');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleUsarUbicacionActual = () => {
    setModoSeleccionOrigen('actual');
    obtenerUbicacionActual();
  };

  const handleIngresarOrigen = () => {
    setModoSeleccionOrigen('ingresar');
    setShowModalOrigen(false);
  };

  const handleSeleccionarMapaOrigen = () => {
    setModoSeleccionOrigen('mapa');
    setShowModalOrigen(false);
    // Obtener ubicación actual para centrar el mapa
    Geolocation.getCurrentPosition(
      position => {
        setRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      },
      () => {}
    );
  };

  const handleConfirmarDireccionOrigen = async () => {
    if (!direccionIngresadaOrigen.trim()) {
      toast.showError('Ingresa una dirección');
      return;
    }

    setBuscandoDireccion(true);
    try {
      const resultado = await geocodificarDireccion(direccionIngresadaOrigen);
      setOrigen({
        latitude: resultado.latitude,
        longitude: resultado.longitude,
      });
      setOrigenAddress(resultado.address);
      setRegion({
        ...region,
        latitude: resultado.latitude,
        longitude: resultado.longitude,
      });
      setShowModalDestino(true);
      setPaso('destino');
      setBuscandoDireccion(false);
    } catch (error) {
      toast.showError('No se pudo encontrar la dirección. Intenta con otra dirección o selecciona en el mapa.');
      setBuscandoDireccion(false);
    }
  };

  const handleSeleccionarMapaDestino = () => {
    setModoSeleccionDestino('mapa');
    setShowModalDestino(false);
  };

  const handleIngresarDestino = () => {
    setModoSeleccionDestino('ingresar');
    setShowModalDestino(false);
  };

  const handleConfirmarDireccionDestino = async () => {
    if (!direccionIngresadaDestino.trim()) {
      toast.showError('Ingresa una dirección de destino');
      return;
    }

    setBuscandoDireccion(true);
    try {
      const resultado = await geocodificarDireccion(direccionIngresadaDestino);
      setDestino({
        latitude: resultado.latitude,
        longitude: resultado.longitude,
      });
      setDestinoAddress(resultado.address);
      
      // Calcular distancia y precio
      if (origen) {
        const dist = calculateDistance(
          origen.latitude,
          origen.longitude,
          resultado.latitude,
          resultado.longitude
        );
        setDistancia(dist);
        const suggested = calculateSuggestedPrice(dist);
        setPrecioSugerido(suggested);
        setPrecio(suggested);
      }
      setBuscandoDireccion(false);
    } catch (error) {
      toast.showError('No se pudo encontrar la dirección. Intenta con otra dirección o selecciona en el mapa.');
      setBuscandoDireccion(false);
    }
  };

  // Calculate distance using Haversine formula  
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calculate suggested price based on distance
  const calculateSuggestedPrice = (distance) => {
    const baseRate = 0.80; // Reduced from 1.00
    const perKmRate = 0.25; // Reduced from 0.30  
    const calculated = baseRate + (distance * perKmRate);
    return Math.max(0.80, calculated).toFixed(2); // Minimum $0.80
  };

  const handleMapPress = e => {
    if (paso === 'origen' && modoSeleccionOrigen === 'mapa') {
      const coord = e.nativeEvent.coordinate;
      setOrigen(coord);
      setOrigenAddress('Ubicación seleccionada en el mapa');
      setShowModalDestino(true);
      setPaso('destino');
    } else if (paso === 'destino' && modoSeleccionDestino === 'mapa') {
      const newDestino = e.nativeEvent.coordinate;
      setDestino(newDestino);
      setDestinoAddress('Destino seleccionado en el mapa');

      // Calculate distance and suggested price
      if (origen) {
        const dist = calculateDistance(
          origen.latitude,
          origen.longitude,
          newDestino.latitude,
          newDestino.longitude
        );
        setDistancia(dist);
        const suggested = calculateSuggestedPrice(dist);
        setPrecioSugerido(suggested);
        setPrecio(suggested); // Auto-fill with suggested price
      }
    }
  };

  const handleSolicitar = async () => {
    if (!origen || !destino || !precio) {
      toast.showError('Completa todos los campos');
      return;
    }

    setLoading(true);
    const data = {
      origen_lat: parseFloat(origen.latitude.toFixed(6)),
      origen_lng: parseFloat(origen.longitude.toFixed(6)),
      origen_direccion: origenAddress || 'Origen seleccionado',
      destino_lat: parseFloat(destino.latitude.toFixed(6)),
      destino_lng: parseFloat(destino.longitude.toFixed(6)),
      destino_direccion: destinoAddress || 'Destino seleccionado',
      precio_solicitado: parseFloat(precio),
      metodo_pago: metodoPago,
      fecha_expiracion: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };

    console.log('Enviando solicitud:', JSON.stringify(data, null, 2));
    const result = await TransportService.crearSolicitud(data);
    setLoading(false);
    console.log('Respuesta:', JSON.stringify(result, null, 2));

    if (result.success) {
      const solicitudId = result.data.aData.id;
      // Navigate to waiting screen
      toast.showSuccess('Solicitud de viaje creada exitosamente');
      navigation.navigate('SolicitudEspera', { solicitudId });
      // Reset form
      resetMarkers();
    } else {
      toast.showError(result.error || 'No se pudo crear la solicitud');
    }
  };

  const resetMarkers = () => {
    setOrigen(null);
    setDestino(null);
    setOrigenAddress('');
    setDestinoAddress('');
    setDireccionIngresadaOrigen('');
    setDireccionIngresadaDestino('');
    setDistancia(0);
    setPrecioSugerido('0.00');
    setPrecio('');
    setPaso('origen');
    setShowModalOrigen(true);
    setShowModalDestino(false);
    setModoSeleccionOrigen(null);
    setModoSeleccionDestino(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solicitar Viaje</Text>

      {/* Modal para seleccionar origen */}
      <Modal
        visible={showModalOrigen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => navigation.goBack()}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Origen</Text>
            <Text style={styles.modalSubtitle}>¿Cómo deseas seleccionar tu punto de origen?</Text>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleUsarUbicacionActual}
              disabled={buscandoDireccion}>
              <Icon name="locate" size={24} color="#2196F3" />
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Usar ubicación actual</Text>
                <Text style={styles.modalOptionSubtitle}>Usar GPS para detectar tu ubicación</Text>
              </View>
              {buscandoDireccion && <ActivityIndicator size="small" color="#2196F3" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleIngresarOrigen}>
              <Icon name="create-outline" size={24} color="#2196F3" />
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Ingresar dirección</Text>
                <Text style={styles.modalOptionSubtitle}>Escribe la dirección de origen</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleSeleccionarMapaOrigen}>
              <Icon name="map-outline" size={24} color="#2196F3" />
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Seleccionar en el mapa</Text>
                <Text style={styles.modalOptionSubtitle}>Toca en el mapa para elegir</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para ingresar dirección de origen */}
      {modoSeleccionOrigen === 'ingresar' && !showModalOrigen && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowModalOrigen(true)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Ingresar Dirección de Origen</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Av. 9 de Octubre y Malecón, Guayaquil"
                placeholderTextColor="#999"
                value={direccionIngresadaOrigen}
                onChangeText={setDireccionIngresadaOrigen}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => setShowModalOrigen(true)}>
                  <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={handleConfirmarDireccionOrigen}
                  disabled={buscandoDireccion}>
                  {buscandoDireccion ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonTextPrimary}>Confirmar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal para seleccionar destino */}
      <Modal
        visible={showModalDestino && origen !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {}}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Destino</Text>
            <Text style={styles.modalSubtitle}>¿Cómo deseas seleccionar tu destino?</Text>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleSeleccionarMapaDestino}>
              <Icon name="map-outline" size={24} color="#2196F3" />
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Seleccionar en el mapa</Text>
                <Text style={styles.modalOptionSubtitle}>Toca en el mapa para elegir</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleIngresarDestino}>
              <Icon name="create-outline" size={24} color="#2196F3" />
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Ingresar dirección</Text>
                <Text style={styles.modalOptionSubtitle}>Escribe la dirección de destino</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para ingresar dirección de destino */}
      {modoSeleccionDestino === 'ingresar' && !showModalDestino && origen !== null && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowModalDestino(true)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Ingresar Dirección de Destino</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Mall del Sol, Guayaquil"
                placeholderTextColor="#999"
                value={direccionIngresadaDestino}
                onChangeText={setDireccionIngresadaDestino}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => setShowModalDestino(true)}>
                  <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={handleConfirmarDireccionDestino}
                  disabled={buscandoDireccion}>
                  {buscandoDireccion ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonTextPrimary}>Confirmar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Mapa */}
      <MapView
        style={styles.map}
        region={region}
        onPress={handleMapPress}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}>
        {origen && (
          <Marker coordinate={origen} title="Origen" pinColor="green">
            <View style={styles.markerContainer}>
              <Icon name="location" size={30} color="#4CAF50" />
            </View>
          </Marker>
        )}
        {destino && (
          <Marker coordinate={destino} title="Destino" pinColor="red">
            <View style={styles.markerContainer}>
              <Icon name="flag" size={30} color="#F44336" />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Instrucciones en el mapa */}
      {paso === 'origen' && modoSeleccionOrigen === 'mapa' && (
        <View style={styles.instructionOverlay}>
          <Text style={styles.instructionText}>📍 Toca en el mapa para seleccionar el origen</Text>
        </View>
      )}
      {paso === 'destino' && modoSeleccionDestino === 'mapa' && (
        <View style={styles.instructionOverlay}>
          <Text style={styles.instructionText}>📍 Toca en el mapa para seleccionar el destino</Text>
        </View>
      )}

      {/* Reset Button */}
      {(origen || destino) && (
        <TouchableOpacity style={styles.resetButton} onPress={resetMarkers}>
          <Text style={styles.resetButtonText}>↺ Reiniciar</Text>
        </TouchableOpacity>
      )}

      {/* Formulario - Solo mostrar cuando origen y destino estén seleccionados */}
      {origen && destino && (
        <ScrollView style={styles.form}>
          {/* Info de ubicaciones */}
          <View style={styles.locationInfo}>
            <View style={styles.locationItem}>
              <Icon name="location" size={20} color="#4CAF50" />
              <Text style={styles.locationText} numberOfLines={2}>{origenAddress || 'Origen seleccionado'}</Text>
            </View>
            <View style={styles.locationItem}>
              <Icon name="flag" size={20} color="#F44336" />
              <Text style={styles.locationText} numberOfLines={2}>{destinoAddress || 'Destino seleccionado'}</Text>
            </View>
          </View>

          {/* Distance Info */}
          {distancia > 0 && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Distancia: {distancia.toFixed(2)} km
              </Text>
              <Text style={styles.infoText}>
                Precio sugerido: ${precioSugerido}
              </Text>
            </View>
          )}

          {/* Payment Method */}
          <Text style={styles.label}>Método de pago</Text>
          <View style={styles.paymentButtons}>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                metodoPago === 'efectivo' && styles.paymentButtonActive
              ]}
              onPress={() => setMetodoPago('efectivo')}>
              <Text style={[
                styles.paymentButtonText,
                metodoPago === 'efectivo' && styles.paymentButtonTextActive
              ]}>Efectivo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                metodoPago === 'tarjeta' && styles.paymentButtonActive
              ]}
              onPress={() => setMetodoPago('tarjeta')}>
              <Text style={[
                styles.paymentButtonText,
                metodoPago === 'tarjeta' && styles.paymentButtonTextActive
              ]}>Tarjeta</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                metodoPago === 'transferencia' && styles.paymentButtonActive
              ]}
              onPress={() => setMetodoPago('transferencia')}>
              <Text style={[
                styles.paymentButtonText,
                metodoPago === 'transferencia' && styles.paymentButtonTextActive
              ]}>Transferencia</Text>
            </TouchableOpacity>
          </View>

          {/* Price */}
          <Text style={styles.label}>Precio ofrecido ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 5.00"
            placeholderTextColor="#999"
            value={precio}
            onChangeText={setPrecio}
            keyboardType="decimal-pad"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSolicitar}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Solicitar Viaje</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    color: '#2196F3',
    textAlign: 'center',
  },
  map: {
    width: '100%',
    height: 300,
  },
  form: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  resetButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resetButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 5,
    fontWeight: '600',
  },
  paymentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  paymentButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#fff',
  },
  paymentButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  paymentButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  paymentButtonTextActive: {
    color: '#fff',
  },
  // Estilos para modales
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalOptionText: {
    flex: 1,
    marginLeft: 15,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  modalOptionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonPrimary: {
    backgroundColor: '#2196F3',
  },
  modalButtonSecondary: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalButtonTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonTextSecondary: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  // Estilos para marcadores
  markerContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 5,
    borderWidth: 2,
    borderColor: 'white',
  },
  // Estilos para instrucciones
  instructionOverlay: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  instructionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Estilos para información de ubicaciones
  locationInfo: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
});




