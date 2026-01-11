import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import ConductorService from '../services/conductorService';
import { useToast } from '../context/ToastContext';
import { useConfirmDialog } from '../hooks/useConfirmDialog';

export default function PerfilPasajeroScreen({ navigation }) {
    const { user, logout } = useAuth();
    const toast = useToast();
    const { showConfirm, DialogComponent } = useConfirmDialog();
    const [stats, setStats] = useState({
        viajesRealizados: 0,
        calificacionPromedio: 0,
    });
    const [esConductor, setEsConductor] = useState(false);
    const [verificandoConductor, setVerificandoConductor] = useState(true);

    useEffect(() => {
        verificarSiEsConductor();
    }, []);

    const verificarSiEsConductor = async () => {
        setVerificandoConductor(true);
        try {
            const result = await ConductorService.obtenerPerfil();
            if (result.success) {
                setEsConductor(true);
            } else {
                setEsConductor(false);
            }
        } catch (error) {
            setEsConductor(false);
        } finally {
            setVerificandoConductor(false);
        }
    };

    const handleLogout = () => {
        showConfirm({
            title: 'Cerrar Sesión',
            message: '¿Estás seguro que deseas cerrar sesión?',
            type: 'warning',
            icon: 'log-out-outline',
            confirmText: 'Cerrar Sesión',
            cancelText: 'Cancelar',
            onConfirm: async () => {
                await logout();
            },
        });
    };

    const handleRegisterAsConductor = () => {
        navigation.navigate('RegistroConductor');
    };

    const handleVerPerfilConductor = () => {
        if (esConductor) {
            navigation.navigate('PerfilConductor');
        } else {
            toast.showWarning('No tienes perfil de conductor. Regístrate primero como conductor.');
        }
    };

    const handleCambiarModo = () => {
        if (esConductor) {
            // Si es conductor, puede cambiar entre modos
            Alert.alert(
                'Cambiar Modo',
                '¿Qué modo deseas usar?',
                [
                    {
                        text: 'Modo Pasajero',
                        onPress: () => {
                            // Ya está en modo pasajero
                            toast.showInfo('Ya estás en modo pasajero');
                        },
                    },
                    {
                        text: 'Modo Conductor',
                        onPress: () => {
                            navigation.navigate('PerfilConductor');
                        },
                    },
                    {
                        text: 'Cancelar',
                        style: 'cancel',
                    },
                ]
            );
        } else {
            toast.showWarning('No eres conductor. Regístrate primero como conductor para acceder al modo conductor.');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <DialogComponent />
            
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Icon name="person-circle" size={80} color="#2196F3" />
                </View>
                <Text style={styles.nombre}>
                    {user?.first_name} {user?.last_name}
                </Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Estadísticas</Text>
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Icon name="car" size={30} color="#2196F3" />
                        <Text style={styles.statNumber}>{stats.viajesRealizados}</Text>
                        <Text style={styles.statLabel}>Viajes Realizados</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Icon name="star" size={30} color="#FFB300" />
                        <Text style={styles.statNumber}>
                            {stats.calificacionPromedio.toFixed(1)}
                        </Text>
                        <Text style={styles.statLabel}>Calificación</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Modo de Usuario</Text>

                <TouchableOpacity
                    style={[styles.modoCard, styles.modoPasajero]}
                    onPress={() => toast.showInfo('Ya estás en modo pasajero')}>
                    <Icon name="person" size={32} color="#2196F3" />
                    <View style={styles.modoCardContent}>
                        <Text style={styles.modoCardTitle}>Modo Pasajero</Text>
                        <Text style={styles.modoCardSubtitle}>Solicitar viajes</Text>
                    </View>
                    <Icon name="checkmark-circle" size={24} color="#4CAF50" />
                </TouchableOpacity>

                {verificandoConductor ? (
                    <View style={styles.modoCard}>
                        <Text style={styles.modoCardSubtitle}>Verificando...</Text>
                    </View>
                ) : esConductor ? (
                    <TouchableOpacity
                        style={[styles.modoCard, styles.modoConductor]}
                        onPress={() => navigation.navigate('PerfilConductor')}>
                        <Icon name="bicycle" size={32} color="#FF9800" />
                        <View style={styles.modoCardContent}>
                            <Text style={styles.modoCardTitle}>Modo Conductor</Text>
                            <Text style={styles.modoCardSubtitle}>Aceptar viajes</Text>
                        </View>
                        <Icon name="chevron-forward" size={24} color="#FF9800" />
                    </TouchableOpacity>
                ) : (
                    <View style={[styles.modoCard, styles.modoConductorDisabled]}>
                        <Icon name="bicycle-outline" size={32} color="#999" />
                        <View style={styles.modoCardContent}>
                            <Text style={[styles.modoCardTitle, { color: '#999' }]}>Modo Conductor</Text>
                            <Text style={styles.modoCardSubtitle}>No eres conductor</Text>
                        </View>
                    </View>
                )}

                {!esConductor && (
                    <TouchableOpacity
                        style={[styles.menuItem, styles.conductorButton]}
                        onPress={handleRegisterAsConductor}>
                        <Icon name="add-circle-outline" size={24} color="#2196F3" />
                        <Text style={[styles.menuText, styles.conductorButtonText]}>
                            Registrarse como Conductor
                        </Text>
                        <Icon name="chevron-forward" size={24} color="#2196F3" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Acciones</Text>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('EditarPerfil')}>
                    <Icon name="create-outline" size={24} color="#666" />
                    <Text style={styles.menuText}>Editar Perfil</Text>
                    <Icon name="chevron-forward" size={24} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('MisViajes')}>
                    <Icon name="list-outline" size={24} color="#666" />
                    <Text style={styles.menuText}>Mis Viajes</Text>
                    <Icon name="chevron-forward" size={24} color="#666" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Icon name="log-out-outline" size={24} color="#fff" />
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 30,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    avatarContainer: {
        marginBottom: 15,
    },
    nombre: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    email: {
        fontSize: 16,
        color: '#666',
    },
    section: {
        backgroundColor: '#fff',
        marginTop: 15,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statCard: {
        alignItems: 'center',
        padding: 15,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginLeft: 15,
    },
    conductorButton: {
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
        marginTop: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 0,
    },
    conductorButtonText: {
        color: '#2196F3',
        fontWeight: '600',
    },
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: '#f44336',
        margin: 20,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    // Estilos para modo de usuario
    modoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 2,
    },
    modoPasajero: {
        backgroundColor: '#E3F2FD',
        borderColor: '#2196F3',
    },
    modoConductor: {
        backgroundColor: '#FFF3E0',
        borderColor: '#FF9800',
    },
    modoConductorDisabled: {
        backgroundColor: '#f5f5f5',
        borderColor: '#e0e0e0',
        opacity: 0.6,
    },
    modoCardContent: {
        flex: 1,
        marginLeft: 15,
    },
    modoCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    modoCardSubtitle: {
        fontSize: 14,
        color: '#666',
    },
});
