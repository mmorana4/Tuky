import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TransportService from '../../services/transportService';
import { useAuth } from '../../context/AuthContext';
import styles from './HomeScreen.styles';

export default function HomeScreen({ navigation }) {
  const [location, setLocation] = useState({
    latitude: -2.170998,
    longitude: -79.922359,
  });
  const [region, setRegion] = useState({
    latitude: -2.170998,
    longitude: -79.922359,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [solicitudes, setSolicitudes] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [destinoTexto, setDestinoTexto] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (location) {
      cargarDatosMapa();
      const interval = setInterval(cargarDatosMapa, 5000);
      return () => clearInterval(interval);
    }
  }, [location]);

  useEffect(() => {
    if (location) {
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [location]);

  const cargarDatosMapa = async () => {
    await cargarSolicitudes();
    if (!user?.profile?.is_conductor) {
      await cargarConductores();
    }
  };

  const cargarConductores = async () => {
    if (!location) return;
    const result = await TransportService.listarConductoresDisponibles(
      location.latitude,
      location.longitude
    );
    if (result.success) {
      const conductoresData =
        result.data?.aData?.conductores || result.data?.conductores || [];
      const conductoresFiltrados = conductoresData.filter(
        c => c.ubicacion_actual_lat && c.ubicacion_actual_lng
      );
      setConductores(conductoresFiltrados);
    }
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de Ubicación',
            message: 'Tuky necesita acceso a tu ubicación',
            buttonNeutral: 'Preguntar Luego',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          obtenerUbicacion();
        } else {
          setLocation({ latitude: -2.170998, longitude: -79.922359 });
        }
      } else {
        obtenerUbicacion();
      }
    } catch (err) {
      setLocation({ latitude: -2.170998, longitude: -79.922359 });
    }
  };

  const obtenerUbicacion = () => {
    Geolocation.getCurrentPosition(
      position => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setLocation({ latitude: -2.170998, longitude: -79.922359 });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const cargarSolicitudes = async () => {
    try {
      const result = await TransportService.listarSolicitudesDisponibles(
        location.latitude,
        location.longitude
      );
      if (result.success) {
        const data =
          result.data?.aData?.solicitudes || result.data?.solicitudes || [];
        setSolicitudes(data);
      }
    } catch (error) {
      // silent
    }
  };

  const cantidadMotos = conductores.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.openDrawer?.()}
          activeOpacity={0.8}
        >
          <Icon name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tuky</Text>
        <TouchableOpacity style={styles.headerButton} activeOpacity={0.8}>
          <Icon name="notifications-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Mapa */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          showsUserLocation
          mapType="standard"
        >
          {solicitudes.map(solicitud => (
            <Marker
              key={solicitud.id}
              coordinate={{
                latitude: parseFloat(solicitud.origen_lat),
                longitude: parseFloat(solicitud.origen_lng),
              }}
              title={`Solicitud: $${solicitud.precio_solicitado}`}
              tracksViewChanges={false}
            >
              <View style={styles.markerMoto}>
                <MaterialCommunityIcons
                  name="motorbike"
                  size={22}
                  color="#1A2021"
                />
              </View>
            </Marker>
          ))}
          {conductores.map(conductor => {
            const lat = conductor.ubicacion_actual_lat;
            const lng = conductor.ubicacion_actual_lng;
            if (!lat || !lng) return null;
            return (
              <Marker
                key={`cond-${conductor.id}`}
                coordinate={{
                  latitude: parseFloat(lat),
                  longitude: parseFloat(lng),
                }}
                title={`Conductor: ${conductor.user__first_name || 'Conductor'}`}
                tracksViewChanges={false}
              >
                <View style={styles.markerMoto}>
                  <MaterialCommunityIcons
                    name="motorbike"
                    size={22}
                    color="#1A2021"
                  />
                </View>
              </Marker>
            );
          })}
        </MapView>
      </View>

      {/* Panel inferior */}
      <View style={styles.bottomPanel}>
        <Text style={styles.questionText}>¿A dónde vamos hoy?</Text>

        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => navigation.navigate('SolicitarViaje')}
          activeOpacity={0.9}
        >
          <MaterialCommunityIcons
            name="motorbike"
            size={22}
            color="#0df2cc"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu destino"
            placeholderTextColor="#6B7B7C"
            value={destinoTexto}
            onChangeText={setDestinoTexto}
            editable={false}
            onFocus={() => navigation.navigate('SolicitarViaje')}
          />
        </TouchableOpacity>

        <View style={styles.quickButtonsRow}>
          <TouchableOpacity style={styles.quickButton} activeOpacity={0.8}>
            <Icon name="home-outline" size={20} color="#FFFFFF" />
            <Text style={styles.quickButtonText}>Casa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickButton} activeOpacity={0.8}>
            <Icon name="briefcase-outline" size={20} color="#FFFFFF" />
            <Text style={styles.quickButtonText}>Trabajo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickButton} activeOpacity={0.8}>
            <Icon name="add" size={22} color="#FFFFFF" />
            <Text style={styles.quickButtonText}>+ Agregar</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('SolicitarViaje')}
          activeOpacity={0.9}
        >
          <MaterialCommunityIcons name="motorbike" size={24} color="#FFFFFF" />
          <Text style={styles.ctaButtonText}>Pedir un Tuky</Text>
        </TouchableOpacity>

        <Text style={styles.nearbyInfo}>
          MOTOS CERCANAS: {cantidadMotos} DISPONIBLES
        </Text>
      </View>
    </SafeAreaView>
  );
}
