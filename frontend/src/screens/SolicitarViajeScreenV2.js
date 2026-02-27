/**
 * SolicitarViajeScreenV2 — Versión OSS (OpenStreetMap)
 * 
 * Diferencias con SolicitarViajeScreen (v1 Google):
 *  - buscarSugerencias()      → GeoService.autocomplete()  [Photon/OSM]
 *  - geocodificarPlaceId()    → eliminada (Photon incluye lat/lng directo)
 *  - geocodificarDireccion()  → GeoService.geocode()       [Nominatim/OSM]
 *  - <MapView>                → + <UrlTile> OSM + provider={null}
 *
 * La lógica de UI, formulario y solicitud de viaje es IDÉNTICA a v1.
 */
import React, { useState, useEffect, useRef } from 'react';
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
    FlatList,
} from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/Ionicons';
import TransportService from '../services/transportService';
import GeoService from '../services/geoService';
import { useToast } from '../context/ToastContext';

export default function SolicitarViajeScreenV2({ navigation }) {
    const toast = useToast();

    const [paso, setPaso] = useState('origen');
    const [showModalOrigen, setShowModalOrigen] = useState(true);
    const [showModalDestino, setShowModalDestino] = useState(false);
    const [modoSeleccionOrigen, setModoSeleccionOrigen] = useState(null);
    const [modoSeleccionDestino, setModoSeleccionDestino] = useState(null);

    const [origen, setOrigen] = useState(null);
    const [destino, setDestino] = useState(null);
    const [origenAddress, setOrigenAddress] = useState('');
    const [destinoAddress, setDestinoAddress] = useState('');
    const [direccionIngresadaOrigen, setDireccionIngresadaOrigen] = useState('');
    const [direccionIngresadaDestino, setDireccionIngresadaDestino] = useState('');

    const [sugerenciasOrigen, setSugerenciasOrigen] = useState([]);
    const [sugerenciasDestino, setSugerenciasDestino] = useState([]);
    const [mostrarSugerenciasOrigen, setMostrarSugerenciasOrigen] = useState(false);
    const [mostrarSugerenciasDestino, setMostrarSugerenciasDestino] = useState(false);
    const debounceTimer = useRef(null);

    const [precio, setPrecio] = useState('');
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [distancia, setDistancia] = useState(0);
    const [precioSugerido, setPrecioSugerido] = useState('0.00');
    const [loading, setLoading] = useState(false);
    const [buscandoDireccion, setBuscandoDireccion] = useState(false);

    const [region, setRegion] = useState({
        latitude: -2.170998,
        longitude: -79.922359,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    const obtenerUbicacionActual = () => {
        setBuscandoDireccion(true);
        Geolocation.getCurrentPosition(
            position => {
                const loc = { latitude: position.coords.latitude, longitude: position.coords.longitude };
                setOrigen(loc);
                setOrigenAddress('Ubicación actual');
                setRegion({ ...region, latitude: loc.latitude, longitude: loc.longitude });
                setShowModalOrigen(false);
                setShowModalDestino(true);
                setPaso('destino');
                setBuscandoDireccion(false);
            },
            () => {
                toast.showError('No se pudo obtener la ubicación. Verifica los permisos.');
                setBuscandoDireccion(false);
            },
        );
    };

    // ─────────────────────────────────────────────────────────
    // v2.0: Autocompletado con Photon (OpenStreetMap) en lugar de Google Places
    // ─────────────────────────────────────────────────────────
    const buscarSugerencias = async (input, tipo) => {
        if (!input || input.length < 3) {
            tipo === 'origen' ? setSugerenciasOrigen([]) : setSugerenciasDestino([]);
            tipo === 'origen' ? setMostrarSugerenciasOrigen(false) : setMostrarSugerenciasDestino(false);
            return;
        }
        try {
            console.log('🔍 [v2 OSM] Buscando sugerencias para:', input);
            const suggestions = await GeoService.autocomplete(input, 'ec', 5);
            console.log('✅ [v2 OSM] Sugerencias:', suggestions.length);
            if (tipo === 'origen') {
                setSugerenciasOrigen(suggestions);
                setMostrarSugerenciasOrigen(suggestions.length > 0);
            } else {
                setSugerenciasDestino(suggestions);
                setMostrarSugerenciasDestino(suggestions.length > 0);
            }
        } catch (error) {
            console.error('❌ [v2 OSM] Error autocomplete:', error.message);
            tipo === 'origen' ? setSugerenciasOrigen([]) : setSugerenciasDestino([]);
            tipo === 'origen' ? setMostrarSugerenciasOrigen(false) : setMostrarSugerenciasDestino(false);
        }
    };

    // ─────────────────────────────────────────────────────────
    // v2.0: Photon ya retorna lat/lng en la sugerencia — sin llamada extra
    // ─────────────────────────────────────────────────────────
    const seleccionarSugerenciaOrigen = async (sugerencia) => {
        setDireccionIngresadaOrigen(sugerencia.description);
        setMostrarSugerenciasOrigen(false);
        setSugerenciasOrigen([]);
        setOrigen({ latitude: sugerencia.latitude, longitude: sugerencia.longitude });
        setOrigenAddress(sugerencia.description);
        setRegion({ ...region, latitude: sugerencia.latitude, longitude: sugerencia.longitude });
        setShowModalDestino(true);
        setPaso('destino');
    };

    const seleccionarSugerenciaDestino = async (sugerencia) => {
        setDireccionIngresadaDestino(sugerencia.description);
        setMostrarSugerenciasDestino(false);
        setSugerenciasDestino([]);
        setDestino({ latitude: sugerencia.latitude, longitude: sugerencia.longitude });
        setDestinoAddress(sugerencia.description);
        if (origen) {
            const dist = calculateDistance(origen.latitude, origen.longitude, sugerencia.latitude, sugerencia.longitude);
            setDistancia(dist);
            const suggested = calculateSuggestedPrice(dist);
            setPrecioSugerido(suggested);
            setPrecio(suggested);
        }
    };

    // ─────────────────────────────────────────────────────────
    // v2.0: Geocodificación con Nominatim en lugar de Google Geocoding
    // ─────────────────────────────────────────────────────────
    const geocodificarDireccion = async (direccion) => {
        console.log('🔍 [v2 OSM] Geocodificando:', direccion);
        const resultado = await GeoService.geocode(direccion, 'ec');
        console.log('✅ [v2 OSM] Geocodificado:', resultado.address);
        return resultado;
    };

    const handleTextChangeOrigen = (text) => {
        setDireccionIngresadaOrigen(text);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => buscarSugerencias(text, 'origen'), 500);
    };

    const handleTextChangeDestino = (text) => {
        setDireccionIngresadaDestino(text);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => buscarSugerencias(text, 'destino'), 500);
    };

    const handleUsarUbicacionActual = () => { setModoSeleccionOrigen('actual'); obtenerUbicacionActual(); };
    const handleIngresarOrigen = () => { setModoSeleccionOrigen('ingresar'); setShowModalOrigen(false); };
    const handleSeleccionarMapaOrigen = () => {
        setModoSeleccionOrigen('mapa');
        setShowModalOrigen(false);
        setDireccionIngresadaOrigen('');
        Geolocation.getCurrentPosition(
            pos => setRegion({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }),
            () => { },
        );
    };
    const handleIngresarDestino = () => { setModoSeleccionDestino('ingresar'); setShowModalDestino(false); };
    const handleSeleccionarMapaDestino = () => { setModoSeleccionDestino('mapa'); setShowModalDestino(false); setDireccionIngresadaDestino(''); };

    const handleConfirmarDireccionOrigen = async () => {
        if (!direccionIngresadaOrigen.trim()) { toast.showError('Ingresa una dirección'); return; }
        setMostrarSugerenciasOrigen(false);
        setBuscandoDireccion(true);
        try {
            const r = await geocodificarDireccion(direccionIngresadaOrigen);
            setOrigen({ latitude: r.latitude, longitude: r.longitude });
            setOrigenAddress(r.address);
            setRegion({ ...region, latitude: r.latitude, longitude: r.longitude });
            setModoSeleccionOrigen(null);
            setShowModalDestino(true);
            setPaso('destino');
        } catch (e) {
            toast.showError(e.message || 'No se pudo encontrar la dirección.');
        } finally {
            setBuscandoDireccion(false);
        }
    };

    const handleConfirmarDireccionDestino = async () => {
        if (!direccionIngresadaDestino.trim()) { toast.showError('Ingresa una dirección de destino'); return; }
        setMostrarSugerenciasDestino(false);
        setBuscandoDireccion(true);
        try {
            const r = await geocodificarDireccion(direccionIngresadaDestino);
            setDestino({ latitude: r.latitude, longitude: r.longitude });
            setDestinoAddress(r.address);
            if (origen) {
                const dist = calculateDistance(origen.latitude, origen.longitude, r.latitude, r.longitude);
                setDistancia(dist);
                const suggested = calculateSuggestedPrice(dist);
                setPrecioSugerido(suggested);
                setPrecio(suggested);
            }
            setModoSeleccionDestino(null);
        } catch (e) {
            toast.showError(e.message || 'No se pudo encontrar la dirección.');
        } finally {
            setBuscandoDireccion(false);
        }
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const calculateSuggestedPrice = (distance) => {
        const calculated = 0.80 + (distance * 0.25);
        return Math.max(0.80, calculated).toFixed(2);
    };

    const handleMapPress = e => {
        if (paso === 'origen' && modoSeleccionOrigen === 'mapa') {
            const coord = e.nativeEvent.coordinate;
            setOrigen(coord);
            setOrigenAddress('Ubicación seleccionada en el mapa');
            setModoSeleccionOrigen(null);
            setShowModalDestino(true);
            setPaso('destino');
        } else if (paso === 'destino' && modoSeleccionDestino === 'mapa') {
            const newDestino = e.nativeEvent.coordinate;
            setDestino(newDestino);
            setDestinoAddress('Destino seleccionado en el mapa');
            setModoSeleccionDestino(null);
            if (origen) {
                const dist = calculateDistance(origen.latitude, origen.longitude, newDestino.latitude, newDestino.longitude);
                setDistancia(dist);
                const suggested = calculateSuggestedPrice(dist);
                setPrecioSugerido(suggested);
                setPrecio(suggested);
            }
        }
    };

    const handleSolicitar = async () => {
        if (!origen || !destino || !precio) { toast.showError('Completa todos los campos'); return; }
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
        const result = await TransportService.crearSolicitud(data);
        setLoading(false);
        if (result.success) {
            toast.showSuccess('Solicitud de viaje creada exitosamente');
            navigation.navigate('SolicitudEspera', { solicitudId: result.data.aData.id });
            resetMarkers();
        } else {
            toast.showError(result.error || 'No se pudo crear la solicitud');
        }
    };

    const resetMarkers = () => {
        setOrigen(null); setDestino(null); setOrigenAddress(''); setDestinoAddress('');
        setDireccionIngresadaOrigen(''); setDireccionIngresadaDestino('');
        setDistancia(0); setPrecioSugerido('0.00'); setPrecio('');
        setPaso('origen'); setShowModalOrigen(true); setShowModalDestino(false);
        setModoSeleccionOrigen(null); setModoSeleccionDestino(null);
        setSugerenciasOrigen([]); setSugerenciasDestino([]);
        setMostrarSugerenciasOrigen(false); setMostrarSugerenciasDestino(false);
    };

    const renderSugerencias = (sugerencias, onSelect) => (
        <FlatList
            data={sugerencias}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <TouchableOpacity style={styles.sugerenciaItem} onPress={() => onSelect(item)}>
                    <Icon name="location" size={20} color="#2196F3" />
                    <View style={styles.sugerenciaText}>
                        <Text style={styles.sugerenciaMainText}>{item.mainText}</Text>
                        {item.secondaryText ? <Text style={styles.sugerenciaSecondaryText}>{item.secondaryText}</Text> : null}
                    </View>
                </TouchableOpacity>
            )}
            style={styles.sugerenciasList}
            nestedScrollEnabled
        />
    );

    return (
        <View style={styles.container}>
            {/* Badge v2 */}
            <Text style={styles.title}>
                Solicitar Viaje <Text style={styles.v2Badge}>v2 OSM</Text>
            </Text>

            {/* Modal Origen */}
            <Modal visible={showModalOrigen} transparent animationType="slide" onRequestClose={() => navigation.goBack()}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Seleccionar Origen</Text>
                        <Text style={styles.modalSubtitle}>¿Cómo deseas seleccionar tu punto de origen?</Text>
                        <TouchableOpacity style={styles.modalOption} onPress={handleUsarUbicacionActual} disabled={buscandoDireccion}>
                            <Icon name="locate" size={24} color="#2196F3" />
                            <View style={styles.modalOptionText}>
                                <Text style={styles.modalOptionTitle}>Usar ubicación actual</Text>
                                <Text style={styles.modalOptionSubtitle}>Usar GPS para detectar tu ubicación</Text>
                            </View>
                            {buscandoDireccion && <ActivityIndicator size="small" color="#2196F3" />}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={handleIngresarOrigen}>
                            <Icon name="create-outline" size={24} color="#2196F3" />
                            <View style={styles.modalOptionText}>
                                <Text style={styles.modalOptionTitle}>Ingresar dirección</Text>
                                <Text style={styles.modalOptionSubtitle}>Escribe la dirección de origen</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={handleSeleccionarMapaOrigen}>
                            <Icon name="map-outline" size={24} color="#2196F3" />
                            <View style={styles.modalOptionText}>
                                <Text style={styles.modalOptionTitle}>Seleccionar en el mapa</Text>
                                <Text style={styles.modalOptionSubtitle}>Toca en el mapa para elegir</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal ingreso dirección origen */}
            {modoSeleccionOrigen === 'ingresar' && !showModalOrigen && (
                <Modal visible transparent animationType="slide" onRequestClose={() => { setModoSeleccionOrigen(null); setShowModalOrigen(true); }}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Ingresar Dirección de Origen</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej: Av. 9 de Octubre y Malecón, Guayaquil"
                                    placeholderTextColor="#999"
                                    value={direccionIngresadaOrigen}
                                    onChangeText={handleTextChangeOrigen}
                                    autoFocus
                                />
                                {mostrarSugerenciasOrigen && sugerenciasOrigen.length > 0 && (
                                    <View style={styles.sugerenciasContainer}>
                                        {renderSugerencias(sugerenciasOrigen, seleccionarSugerenciaOrigen)}
                                    </View>
                                )}
                            </View>
                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={[styles.modalButton, styles.modalButtonSecondary]} onPress={() => { setModoSeleccionOrigen(null); setShowModalOrigen(true); }}>
                                    <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleConfirmarDireccionOrigen} disabled={buscandoDireccion}>
                                    {buscandoDireccion ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalButtonTextPrimary}>Confirmar</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

            {/* Modal destino */}
            <Modal visible={showModalDestino && origen !== null} transparent animationType="slide" onRequestClose={() => { }}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Seleccionar Destino</Text>
                        <Text style={styles.modalSubtitle}>¿Cómo deseas seleccionar tu destino?</Text>
                        <TouchableOpacity style={styles.modalOption} onPress={handleSeleccionarMapaDestino}>
                            <Icon name="map-outline" size={24} color="#2196F3" /><View style={styles.modalOptionText}><Text style={styles.modalOptionTitle}>Seleccionar en el mapa</Text><Text style={styles.modalOptionSubtitle}>Toca en el mapa para elegir</Text></View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={handleIngresarDestino}>
                            <Icon name="create-outline" size={24} color="#2196F3" /><View style={styles.modalOptionText}><Text style={styles.modalOptionTitle}>Ingresar dirección</Text><Text style={styles.modalOptionSubtitle}>Escribe la dirección de destino</Text></View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal ingreso dirección destino */}
            {modoSeleccionDestino === 'ingresar' && !showModalDestino && origen !== null && (
                <Modal visible transparent animationType="slide" onRequestClose={() => { setModoSeleccionDestino(null); setShowModalDestino(true); }}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Ingresar Dirección de Destino</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej: Mall del Sol, Guayaquil"
                                    placeholderTextColor="#999"
                                    value={direccionIngresadaDestino}
                                    onChangeText={handleTextChangeDestino}
                                    autoFocus
                                />
                                {mostrarSugerenciasDestino && sugerenciasDestino.length > 0 && (
                                    <View style={styles.sugerenciasContainer}>
                                        {renderSugerencias(sugerenciasDestino, seleccionarSugerenciaDestino)}
                                    </View>
                                )}
                            </View>
                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={[styles.modalButton, styles.modalButtonSecondary]} onPress={() => { setModoSeleccionDestino(null); setShowModalDestino(true); }}>
                                    <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleConfirmarDireccionDestino} disabled={buscandoDireccion}>
                                    {buscandoDireccion ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalButtonTextPrimary}>Confirmar</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

            {/* ─── Mapa v2.0: tiles OpenStreetMap ─── */}
            <MapView
                style={styles.map}
                provider={null}
                region={region}
                onPress={handleMapPress}
                onRegionChangeComplete={setRegion}
                showsUserLocation>
                {/* Tiles de OpenStreetMap (reemplaza Google Maps tiles) */}
                <UrlTile
                    urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maximumZ={19}
                    flipY={false}
                    tileSize={256}
                />
                {origen && (
                    <Marker coordinate={origen} title="Origen" pinColor="green">
                        <View style={styles.markerContainer}><Icon name="location" size={30} color="#4CAF50" /></View>
                    </Marker>
                )}
                {destino && (
                    <Marker coordinate={destino} title="Destino" pinColor="red">
                        <View style={styles.markerContainer}><Icon name="flag" size={30} color="#F44336" /></View>
                    </Marker>
                )}
            </MapView>

            {paso === 'origen' && modoSeleccionOrigen === 'mapa' && (
                <View style={styles.instructionOverlay}><Text style={styles.instructionText}>📍 Toca en el mapa para seleccionar el origen</Text></View>
            )}
            {paso === 'destino' && modoSeleccionDestino === 'mapa' && (
                <View style={styles.instructionOverlay}><Text style={styles.instructionText}>📍 Toca en el mapa para seleccionar el destino</Text></View>
            )}

            {(origen || destino) && (
                <TouchableOpacity style={styles.resetButton} onPress={resetMarkers}>
                    <Text style={styles.resetButtonText}>↺ Reiniciar</Text>
                </TouchableOpacity>
            )}

            {origen && destino && (
                <ScrollView style={styles.form}>
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
                    {distancia > 0 && (
                        <View style={styles.infoBox}>
                            <Text style={styles.infoText}>Distancia: {distancia.toFixed(2)} km</Text>
                            <Text style={styles.infoText}>Precio sugerido: ${precioSugerido}</Text>
                        </View>
                    )}
                    <Text style={styles.label}>Método de pago</Text>
                    <View style={styles.paymentButtons}>
                        {['efectivo', 'tarjeta', 'transferencia'].map(m => (
                            <TouchableOpacity key={m} style={[styles.paymentButton, metodoPago === m && styles.paymentButtonActive]} onPress={() => setMetodoPago(m)}>
                                <Text style={[styles.paymentButtonText, metodoPago === m && styles.paymentButtonTextActive]}>{m.charAt(0).toUpperCase() + m.slice(1)}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={styles.label}>Precio ofrecido ($)</Text>
                    <TextInput style={styles.input} placeholder="Ej: 5.00" placeholderTextColor="#999" value={precio} onChangeText={setPrecio} keyboardType="decimal-pad" />
                    <TouchableOpacity style={styles.button} onPress={handleSolicitar} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Solicitar Viaje</Text>}
                    </TouchableOpacity>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', padding: 16, color: '#2196F3', textAlign: 'center' },
    v2Badge: { fontSize: 12, backgroundColor: '#E8F5E9', color: '#2E7D32', paddingHorizontal: 6, borderRadius: 4, fontWeight: '700' },
    map: { width: '100%', height: 300 },
    form: { flex: 1, padding: 20 },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 15, marginBottom: 20, fontSize: 16, color: '#000', backgroundColor: '#fff' },
    button: { backgroundColor: '#2196F3', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    resetButton: { backgroundColor: '#fff', padding: 10, borderRadius: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', margin: 15, marginTop: 10, borderWidth: 1, borderColor: '#2196F3', elevation: 3 },
    resetButtonText: { color: '#2196F3', fontSize: 14, fontWeight: '600' },
    infoBox: { backgroundColor: '#E3F2FD', padding: 15, borderRadius: 8, marginBottom: 15 },
    infoText: { fontSize: 14, color: '#1565C0', marginBottom: 4 },
    locationInfo: { marginBottom: 15 },
    locationItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 8 },
    locationText: { flex: 1, fontSize: 14, color: '#333', marginLeft: 10 },
    paymentButtons: { flexDirection: 'row', gap: 8, marginBottom: 20 },
    paymentButton: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
    paymentButtonActive: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
    paymentButtonText: { color: '#666', fontSize: 13 },
    paymentButtonTextActive: { color: '#fff', fontWeight: 'bold' },
    markerContainer: { backgroundColor: 'white', borderRadius: 20, padding: 5 },
    instructionOverlay: { position: 'absolute', top: 320, left: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 8, padding: 12 },
    instructionText: { color: '#fff', textAlign: 'center', fontSize: 14 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '90%', maxWidth: 400 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8, textAlign: 'center' },
    modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' },
    modalOption: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 10 },
    modalOptionText: { flex: 1, marginLeft: 15 },
    modalOptionTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
    modalOptionSubtitle: { fontSize: 13, color: '#666', marginTop: 2 },
    modalButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
    modalButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
    modalButtonPrimary: { backgroundColor: '#2196F3' },
    modalButtonSecondary: { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#ddd' },
    modalButtonTextPrimary: { color: '#fff', fontWeight: '600', fontSize: 16 },
    modalButtonTextSecondary: { color: '#333', fontWeight: '600', fontSize: 16 },
    inputContainer: { position: 'relative', marginBottom: 10 },
    sugerenciasContainer: { position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, maxHeight: 200, elevation: 5 },
    sugerenciasList: { maxHeight: 200 },
    sugerenciaItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    sugerenciaText: { flex: 1, marginLeft: 10 },
    sugerenciaMainText: { fontSize: 14, fontWeight: '600', color: '#333' },
    sugerenciaSecondaryText: { fontSize: 12, color: '#666', marginTop: 2 },
});
