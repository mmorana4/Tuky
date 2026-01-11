import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import TransportService from '../services/transportService';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { useToast } from '../context/ToastContext';

export default function SolicitudEsperaScreen({ route, navigation }) {
    const { solicitudId } = route.params;
    const toast = useToast();
    const { showConfirm, DialogComponent } = useConfirmDialog();
    const [estado, setEstado] = useState('pendiente');
    const [conductor, setConductor] = useState(null);
    const [etaMinutos, setEtaMinutos] = useState(null);
    const [viajeId, setViajeId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkEstado();

        // Poll every 3 seconds
        const interval = setInterval(() => {
            checkEstado();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const checkEstado = async () => {
        try {
            const result = await TransportService.obtenerEstadoSolicitud(solicitudId);
            console.log('Estado solicitud:', JSON.stringify(result, null, 2));

            if (result.success && result.data) {
                // El backend retorna {is_success: true, aData: {estado, id, ...}}
                const estadoData = result.data.aData || result.data;
                const estadoActual = estadoData.estado || estadoData.estado;

                console.log('Estado actual:', estadoActual);
                setEstado(estadoActual);
                setLoading(false);

                if (estadoActual === 'aceptada') {
                    setConductor(estadoData.conductor);
                    setEtaMinutos(estadoData.eta_minutos);
                    
                    // Guardar viaje_id para navegación
                    if (estadoData.viaje_id) {
                        setViajeId(estadoData.viaje_id);
                    }
                } else if (estadoActual === 'cancelada') {
                    // Si se canceló (por usuario o sistema), volver al home sin alerta bloqueante
                    navigation.navigate('Home');
                } else if (estadoActual === 'expirada') {
                    toast.showWarning('Tu solicitud expiró y no pudo ser completada');
                    setTimeout(() => {
                        navigation.navigate('Home');
                    }, 2000);
                }
            }
        } catch (error) {
            console.error('Error checking estado:', error);
        }
    };

    const handleCancelar = () => {
        showConfirm({
            title: 'Cancelar Solicitud',
            message: '¿Estás seguro de cancelar tu solicitud?',
            type: 'danger',
            icon: 'close-circle',
            confirmText: 'Sí, Cancelar',
            cancelText: 'No',
            onConfirm: async () => {
                const result = await TransportService.cancelarSolicitud(solicitudId);
                if (result.success) {
                    toast.showSuccess('Solicitud cancelada');
                    setTimeout(() => {
                        navigation.navigate('Home');
                    }, 1000);
                } else {
                    toast.showError(result.error || 'No se pudo cancelar la solicitud');
                }
            },
        });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    if (estado === 'aceptada' && conductor) {
        return (
            <View style={styles.container}>
                <Icon name="checkmark-circle" size={80} color="#4CAF50" />
                <Text style={styles.title}>¡Conductor Aceptó!</Text>

                <View style={styles.conductorCard}>
                    <Icon name="person-circle" size={60} color="#2196F3" />
                    <View style={styles.conductorInfo}>
                        <Text style={styles.conductorNombre}>
                            {conductor.nombre || 'Conductor'}
                        </Text>
                        <View style={styles.rating}>
                            <Icon name="star" size={20} color="#FFB300" />
                            <Text style={styles.ratingText}>
                                {conductor.calificacion || '5.0'}
                            </Text>
                        </View>
                        {conductor.placa && (
                            <Text style={styles.placa}>🏍️ {conductor.placa}</Text>
                        )}
                    </View>
                </View>

                {etaMinutos && (
                    <View style={styles.etaCard}>
                        <Icon name="time-outline" size={30} color="#2196F3" />
                        <Text style={styles.etaText}>
                            Llegará en {etaMinutos} minutos
                        </Text>
                    </View>
                )}

                {viajeId ? (
                    <TouchableOpacity
                        style={styles.mapButton}
                        onPress={() => {
                            navigation.replace('ViajeActivo', {
                                viajeId: viajeId,
                            });
                        }}>
                        <Icon name="map-outline" size={24} color="#fff" />
                        <Text style={styles.mapButtonText}>Ver Viaje en Mapa</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.mapButton}
                        onPress={() => toast.showInfo('El viaje se está configurando...')}>
                        <Icon name="map-outline" size={24} color="#fff" />
                        <Text style={styles.mapButtonText}>Ver en Mapa</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    // Mostrar botón de cancelar solo si está pendiente y no está cargando
    const mostrarCancelar = estado === 'pendiente' && !loading;

    return (
        <View style={styles.container}>
            <DialogComponent />
            
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.title}>Buscando Conductor...</Text>
            <Text style={styles.subtitle}>
                Tu solicitud está siendo vista por conductores cercanos
            </Text>

            <View style={styles.infoBox}>
                <Icon name="location" size={24} color="#2196F3" />
                <Text style={styles.infoText}>
                    Estamos buscando el mejor conductor para ti
                </Text>
            </View>

            {mostrarCancelar && (
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelar}>
                    <Icon name="close-circle" size={24} color="#fff" />
                    <Text style={styles.cancelButtonText}>Cancelar Solicitud</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        padding: 15,
        borderRadius: 8,
        marginVertical: 20,
    },
    infoText: {
        fontSize: 14,
        color: '#1976D2',
        marginLeft: 10,
        flex: 1,
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f44336',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 20,
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    conductorCard: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        padding: 20,
        borderRadius: 12,
        marginVertical: 20,
        width: '100%',
        alignItems: 'center',
    },
    conductorInfo: {
        marginLeft: 15,
        flex: 1,
    },
    conductorNombre: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    ratingText: {
        fontSize: 16,
        color: '#666',
        marginLeft: 5,
    },
    placa: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    etaCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    etaText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1976D2',
        marginLeft: 10,
    },
    mapButton: {
        flexDirection: 'row',
        backgroundColor: '#2196F3',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    mapButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
});
