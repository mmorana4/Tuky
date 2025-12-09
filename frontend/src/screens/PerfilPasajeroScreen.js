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

export default function PerfilPasajeroScreen({ navigation }) {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({
        viajesRealizados: 0,
        calificacionPromedio: 0,
    });

    const handleLogout = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro que deseas cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar Sesión',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    },
                },
            ],
        );
    };

    const handleRegisterAsConductor = () => {
        navigation.navigate('RegistroConductor');
    };

    return (
        <ScrollView style={styles.container}>
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

                <TouchableOpacity
                    style={[styles.menuItem, styles.conductorButton]}
                    onPress={handleRegisterAsConductor}>
                    <Icon name="bicycle-outline" size={24} color="#2196F3" />
                    <Text style={[styles.menuText, styles.conductorButtonText]}>
                        Registrarse como Conductor
                    </Text>
                    <Icon name="chevron-forward" size={24} color="#2196F3" />
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
});
