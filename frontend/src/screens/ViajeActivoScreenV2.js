/**
 * ViajeActivoScreenV2 — Versión OSS (OpenStreetMap + OSRM)
 *
 * Diferencias con ViajeActivoScreen (v1 Google):
 *  - GOOGLE_MAPS_APIKEY        → eliminado
 *  - <MapViewDirections>       → <OsrmRoute> (OSRM vía backend proxy)
 *  - <MapView>                 → + <UrlTile> OSM + provider={null}
 *
 * Toda la lógica de negocio (estados, polling, conductor, pasajero) es IDÉNTICA a v1.
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TransportService from '../services/transportService';
import ConductorService from '../services/conductorService';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import OsrmRoute from '../components/OsrmRoute';   // ← v2: reemplaza MapViewDirections

export default function ViajeActivoScreenV2({ route, navigation }) {
    const toast = useToast();
    const { showConfirm, DialogComponent } = useConfirmDialog();
    const { viajeId } = route.params;
    const [viaje, setViaje] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completando, setCompletando] = useState(false);
    const [conductorLocation, setConductorLocation] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [region, setRegion] = useState({
        latitude: -2.170998,
        longitude: -79.922359,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });
    const { user } = useAuth();

    useEffect(() => {
        cargarViaje();
        obtenerUbicacionUsuario();
        const interval = setInterval(() => {
            cargarViaje();
            obtenerUbicacionUsuario();
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (userLocation && viaje) {
            const esConductorLocal = viaje.conductor?.id === user?.id || user?.profile?.is_conductor;
            if (esConductorLocal) {
                ConductorService.actualizarUbicacion(userLocation.latitude, userLocation.longitude);
            }
        }
    }, [userLocation, viaje, user]);

    const obtenerUbicacionUsuario = () => {
        Geolocation.getCurrentPosition(
            position => setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
            error => console.log('[v2] Error obteniendo ubicación:', error),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
    };

    const cargarViaje = async () => {
        try {
            const result = await TransportService.obtenerDetalleViaje(viajeId);
            setLoading(false);
            if (result.success) {
                const viajeData = result.data.aData?.viaje || result.data?.viaje;
                setViaje(viajeData);
            } else {
                toast.showError('No se pudo cargar la información del viaje');
            }
        } catch {
            setLoading(false);
            toast.showError('Error al cargar el viaje');
        }
    };

    const actualizarEstado = async (endpoint, mensaje, notificarUsuario = false) => {
        try {
            const response = await TransportService[endpoint](viajeId);
            if (response.success) {
                toast.showSuccess(mensaje);
                cargarViaje();
            } else {
                toast.showError(response.error || 'No se pudo actualizar el estado');
            }
        } catch {
            toast.showError('No se pudo actualizar el estado');
        }
    };

    const finalizarViaje = async () => {
        try {
            setCompletando(true);
            const result = await TransportService.completarViaje(viajeId);
            setCompletando(false);
            if (result.success) {
                toast.showSuccess('Viaje completado correctamente');
                cargarViaje();
                setTimeout(() => navigation.navigate('Home'), 1500);
            } else {
                toast.showError(result.error || 'No se pudo completar el viaje');
            }
        } catch {
            setCompletando(false);
            toast.showError('Ocurrió un error al completar el viaje');
        }
    };

    const cancelarViaje = async () => {
        try {
            setCompletando(true);
            const result = await TransportService.cancelarViaje(viajeId);
            setCompletando(false);
            if (result.success) {
                toast.showSuccess('El viaje ha sido cancelado exitosamente');
                setTimeout(() => navigation.navigate('Home'), 1500);
            } else {
                toast.showError(result.error || 'No se pudo cancelar el viaje');
            }
        } catch {
            setCompletando(false);
            toast.showError('Ocurrió un error al cancelar');
        }
    };

    const handleCompletar = () => showConfirm({
        title: 'Finalizar Viaje', message: '¿Estás seguro que deseas finalizar el viaje?',
        type: 'success', icon: 'checkmark-circle', confirmText: 'Finalizar', cancelText: 'Cancelar',
        onConfirm: finalizarViaje,
    });

    const handleCancelar = () => showConfirm({
        title: 'Cancelar Viaje', message: '¿Estás seguro que deseas cancelar el viaje?',
        type: 'danger', icon: 'warning', confirmText: 'Sí, cancelar', cancelText: 'No, regresar',
        onConfirm: cancelarViaje,
    });

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color="#2196F3" /></View>;
    }

    const esConductor = viaje?.conductor?.id === user?.id || user?.profile?.is_conductor;

    // Coordenadas del origen y destino
    const origenLatParsed = parseFloat(viaje?.origen?.lat);
    const origenLngParsed = parseFloat(viaje?.origen?.lng);
    const destinoLatParsed = parseFloat(viaje?.destino?.lat);
    const destinoLngParsed = parseFloat(viaje?.destino?.lng);

    // Ubicación del conductor (desde el viaje o desde userLocation si soy el conductor)
    const ubicacionConductor = esConductor
        ? userLocation
        : (viaje?.conductor_lat && viaje?.conductor_lng
            ? { latitude: parseFloat(viaje.conductor_lat), longitude: parseFloat(viaje.conductor_lng) }
            : null);

    const mostrarRutaConductorAOrigen = ['aceptado', 'en_camino_origen', 'llegado_origen'].includes(viaje?.estado);
    const mostrarRutaOrigenADestino = viaje?.estado === 'en_viaje';

    return (
        <View style={styles.container}>
            <DialogComponent />

            {/* ─── Mapa v2.0: tiles OpenStreetMap + OSRM para rutas ─── */}
            <MapView
                style={styles.map}
                provider={null}
                region={region}
                onRegionChangeComplete={setRegion}
                showsUserLocation={esConductor}>
                {/* Tiles OSM (reemplaza Google Maps tiles) */}
                <UrlTile
                    urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maximumZ={19}
                    flipY={false}
                    tileSize={256}
                />

                {/* Marcador conductor */}
                {ubicacionConductor && (mostrarRutaConductorAOrigen || viaje?.estado === 'en_viaje') && (
                    <Marker coordinate={ubicacionConductor} title={esConductor ? 'Tu ubicación' : 'Conductor'} tracksViewChanges={false} pinColor="blue">
                        <View style={styles.markerContainer}><Icon name="bicycle" size={30} color="#2196F3" /></View>
                    </Marker>
                )}

                {/* Marcador origen */}
                {origenLatParsed && origenLngParsed && (
                    <Marker coordinate={{ latitude: origenLatParsed, longitude: origenLngParsed }} title="Origen" tracksViewChanges={false} pinColor="green">
                        <View style={styles.markerContainer}><Icon name="location" size={30} color="#4CAF50" /></View>
                    </Marker>
                )}

                {/* Marcador destino */}
                {destinoLatParsed && destinoLngParsed && (
                    <Marker coordinate={{ latitude: destinoLatParsed, longitude: destinoLngParsed }} title="Destino" tracksViewChanges={false} pinColor="red">
                        <View style={styles.markerContainer}><Icon name="flag" size={30} color="#F44336" /></View>
                    </Marker>
                )}

                {/* v2.0: Ruta conductor → origen con OSRM */}
                {mostrarRutaConductorAOrigen && ubicacionConductor && origenLatParsed && origenLngParsed && (
                    <OsrmRoute
                        origin={ubicacionConductor}
                        destination={{ latitude: origenLatParsed, longitude: origenLngParsed }}
                        strokeColor="#FF9800"
                        strokeWidth={4}
                    />
                )}

                {/* v2.0: Ruta origen → destino con OSRM */}
                {mostrarRutaOrigenADestino && origenLatParsed && origenLngParsed && destinoLatParsed && destinoLngParsed && (
                    <OsrmRoute
                        origin={{ latitude: origenLatParsed, longitude: origenLngParsed }}
                        destination={{ latitude: destinoLatParsed, longitude: destinoLngParsed }}
                        strokeColor="#2196F3"
                        strokeWidth={4}
                    />
                )}
            </MapView>

            <View style={styles.info}>
                <ScrollView>
                    {/* Badge v2 */}
                    <View style={styles.v2Banner}>
                        <Text style={styles.v2BannerText}>🗺️ Modo OSM v2 — OpenStreetMap + OSRM</Text>
                    </View>

                    {/* Estado */}
                    <View style={styles.statusCard}>
                        <Text style={styles.statusLabel}>Estado del Viaje</Text>
                        <Text style={styles.statusValue}>{viaje?.estado?.toUpperCase().replace(/_/g, ' ')}</Text>
                    </View>

                    {/* Direcciones */}
                    <View style={styles.direccionCard}>
                        <View style={styles.direccionItem}>
                            <View style={styles.direccionHeader}>
                                <Icon name="location" size={20} color="#4CAF50" />
                                <Text style={styles.direccionTitulo}>Origen</Text>
                            </View>
                            <Text style={styles.direccionTexto}>{viaje?.origen?.direccion || 'Ubicación de recogida'}</Text>
                        </View>
                        <View style={styles.direccionItem}>
                            <View style={styles.direccionHeader}>
                                <Icon name="flag" size={20} color="#F44336" />
                                <Text style={styles.direccionTitulo}>Destino</Text>
                            </View>
                            <Text style={styles.direccionTexto}>{viaje?.destino?.direccion || 'Ubicación de destino'}</Text>
                        </View>
                    </View>

                    {/* Acciones conductor */}
                    {esConductor && (
                        <View style={styles.actionsCard}>
                            {viaje?.estado === 'aceptado' && (
                                <TouchableOpacity style={styles.button} onPress={() => actualizarEstado('enCaminoOrigen', 'Notificando al pasajero que vas en camino')}>
                                    <Icon name="bicycle" size={24} color="#fff" /><Text style={styles.buttonText}>Voy en Camino</Text>
                                </TouchableOpacity>
                            )}
                            {viaje?.estado === 'en_camino_origen' && (
                                <TouchableOpacity style={styles.button} onPress={() => actualizarEstado('llegarOrigen', 'Notificando llegada', true)}>
                                    <Icon name="location" size={24} color="#fff" /><Text style={styles.buttonText}>Ya Llegué</Text>
                                </TouchableOpacity>
                            )}
                            {viaje?.estado === 'llegado_origen' && (
                                <TouchableOpacity style={[styles.button, { backgroundColor: '#4CAF50' }]} onPress={() => actualizarEstado('iniciarViaje', 'Viaje iniciado')}>
                                    <Icon name="play" size={24} color="#fff" /><Text style={styles.buttonText}>Iniciar Viaje</Text>
                                </TouchableOpacity>
                            )}
                            {viaje?.estado === 'en_viaje' && (
                                <TouchableOpacity style={[styles.button, { backgroundColor: '#F44336' }]} onPress={handleCompletar}>
                                    <Icon name="checkbox" size={24} color="#fff" /><Text style={styles.buttonText}>Finalizar Viaje</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Info pasajero/conductor */}
                    <View style={styles.pasajeroInfo}>
                        <Text style={styles.statusLabel}>{esConductor ? 'Pasajero' : 'Tu Conductor'}</Text>
                        <Text style={styles.pasajeroText}>
                            {esConductor
                                ? (viaje?.pasajero?.first_name || viaje?.pasajero?.username)
                                : (viaje?.conductor?.first_name || viaje?.conductor?.username)}
                        </Text>
                        <TouchableOpacity style={{ marginTop: 10 }} onPress={() => {
                            const phone = esConductor ? viaje?.pasajero?.phone : viaje?.conductor?.phone;
                            phone ? toast.showInfo(`Llamar a ${phone}`) : toast.showWarning('Número no disponible');
                        }}>
                            <Icon name="call" size={24} color="#2E7D32" />
                        </TouchableOpacity>
                    </View>

                    {/* Cancelar */}
                    {viaje?.estado !== 'completado' && viaje?.estado !== 'cancelado' && (
                        <View style={{ margin: 15 }}>
                            <TouchableOpacity style={[styles.button, { backgroundColor: '#9E9E9E', marginTop: 10 }]} onPress={handleCancelar} disabled={completando}>
                                <Icon name="close-circle" size={24} color="#fff" /><Text style={styles.buttonText}>Cancelar Viaje</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    info: { backgroundColor: '#fff', maxHeight: '50%' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    v2Banner: { backgroundColor: '#E8F5E9', padding: 8, margin: 10, borderRadius: 6, alignItems: 'center' },
    v2BannerText: { fontSize: 12, color: '#2E7D32', fontWeight: '600' },
    statusCard: { backgroundColor: '#E3F2FD', padding: 15, margin: 15, borderRadius: 8, alignItems: 'center' },
    statusLabel: { fontSize: 12, color: '#666', marginBottom: 5 },
    statusValue: { fontSize: 18, fontWeight: 'bold', color: '#1976D2' },
    direccionCard: { marginHorizontal: 15, marginBottom: 15 },
    direccionItem: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 8, marginBottom: 10 },
    direccionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    direccionTitulo: { fontSize: 16, fontWeight: 'bold', color: '#333', marginLeft: 10 },
    direccionTexto: { fontSize: 14, color: '#666', marginLeft: 34 },
    actionsCard: { padding: 15 },
    button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2196F3', padding: 15, borderRadius: 8, marginBottom: 10 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
    pasajeroInfo: { backgroundColor: '#E8F5E9', padding: 15, margin: 15, borderRadius: 8, alignItems: 'center' },
    pasajeroText: { fontSize: 16, fontWeight: '600', color: '#2E7D32' },
    markerContainer: { backgroundColor: 'white', borderRadius: 20, padding: 5 },
});
