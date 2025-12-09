import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import TransportService from '../../services/transportService';

export default function SolicitudesDisponiblesScreen({ navigation }) {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [location, setLocation] = useState(null);

    useEffect(() => {
        obtenerUbicacion();
    }, []);

    useEffect(() => {
        fetchSolicitudes();

        // Poll every 10 seconds
        const interval = setInterval(() => {
            fetchSolicitudes();
        }, 10000);

        return () => clearInterval(interval);
    }, []); // Run once on mount

    const obtenerUbicacion = () => {
        Geolocation.getCurrentPosition(
            position => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            error => {
                console.log('Error ubicación:', error);
                Alert.alert('Error', 'No se pudo obtener tu ubicación');
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
    };

    const fetchSolicitudes = async () => {
        // if (!location) return; // Permitir buscar sin ubicación para pruebas
        console.log('📡 Fetching solicitudes... Location:', location);

        try {
            const result = await TransportService.listarSolicitudesDisponibles(
                location?.latitude || null,
                location?.longitude || null,
                5, // radio 5km
            );

            console.log('📦 Solicitudes result:', result.success, result.data?.solicitudes?.length);

            if (result.success && result.data?.solicitudes) {
                setSolicitudes(result.data.solicitudes);
            }
            setLoading(false);
            setRefreshing(false);
        } catch (error) {
            console.error('Error fetching solicitudes:', error);
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleAceptar = (solicitud) => {
        Alert.alert(
            'Aceptar Solicitud',
            `¿Aceptar viaje por $${solicitud.precio_solicitado}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        const result = await TransportService.aceptarSolicitud(solicitud.id);
                        if (result.success) {
                            Alert.alert('¡Éxito!', 'Solicitud aceptada. El pasajero fue notificado.');
                            fetchSolicitudes(); // Refresh list
                        } else {
                            Alert.alert('Error', result.error || 'No se pudo aceptar');
                        }
                    },
                },
            ],
        );
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchSolicitudes();
    };

    const renderSolicitud = ({ item }) => {
        const distancia = item.distancia || 0;

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Icon name="location" size={24} color="#2196F3" />
                    <Text style={styles.cardTitle}>Nueva Solicitud</Text>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <Icon name="radio-button-on" size={20} color="#4CAF50" />
                        <Text style={styles.infoText} numberOfLines={1}>
                            {item.origen_direccion || 'Origen'}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Icon name="location-sharp" size={20} color="#f44336" />
                        <Text style={styles.infoText} numberOfLines={1}>
                            {item.destino_direccion || 'Destino'}
                        </Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Icon name="navigate" size={18} color="#666" />
                            <Text style={styles.statText}>{distancia.toFixed(1)} km</Text>
                        </View>

                        <View style={styles.stat}>
                            <Icon name="cash" size={18} color="#4CAF50" />
                            <Text style={styles.statText}>${item.precio_solicitado}</Text>
                        </View>

                        <View style={styles.stat}>
                            <Icon name="card" size={18} color="#666" />
                            <Text style={styles.statText}>{item.metodo_pago}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[styles.button, styles.acceptButton]}
                        onPress={() => handleAceptar(item)}>
                        <Icon name="checkmark-circle" size={24} color="#fff" />
                        <Text style={styles.buttonText}>Aceptar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Buscando solicitudes...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Icon name="notifications" size={28} color="#2196F3" />
                <Text style={styles.headerTitle}>Solicitudes Disponibles</Text>
                <Text style={styles.headerSubtitle}>
                    {solicitudes.length} solicitud{solicitudes.length !== 1 ? 'es' : ''}
                </Text>
            </View>

            {solicitudes.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="search" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>No hay solicitudes disponibles</Text>
                    <Text style={styles.emptySubtext}>
                        Las nuevas solicitudes aparecerán aquí
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={solicitudes}
                    renderItem={renderSolicitud}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    listContainer: {
        padding: 15,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    cardBody: {
        padding: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 10,
        flex: 1,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginLeft: 5,
    },
    cardActions: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 8,
    },
    acceptButton: {
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#999',
        marginTop: 20,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#ccc',
        marginTop: 10,
        textAlign: 'center',
    },
});
