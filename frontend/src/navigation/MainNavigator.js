import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Screens
import HomeScreen from '../screens/HomeScreen';
import SolicitarViajeScreen from '../screens/SolicitarViajeScreen';
import SolicitudEsperaScreen from '../screens/SolicitudEsperaScreen';
import MisViajesScreen from '../screens/MisViajesScreen';
import PerfilScreen from '../screens/PerfilScreen';
import PerfilPasajeroScreen from '../screens/PerfilPasajeroScreen';
import ViajeActivoScreen from '../screens/ViajeActivoScreen';
// Conductor
import ModoConductorScreen from '../screens/conductor/ModoConductorScreen';
import PerfilConductorScreen from '../screens/conductor/PerfilConductorScreen';
import RegistroConductorScreen from '../screens/conductor/RegistroConductorScreen';
import SolicitudesDisponiblesScreen from '../screens/conductor/SolicitudesDisponiblesScreen';
// Moto
import MisMotosScreen from '../screens/moto/MisMotosScreen';
import RegistrarMotoScreen from '../screens/moto/RegistrarMotoScreen';
// Calificación
import CalificarScreen from '../screens/calificacion/CalificarScreen';
// Billetera
import BilleteraScreen from '../screens/BilleteraScreen';
// Seguridad
import SeguridadScreen from '../screens/SeguridadScreen';
// Configuración
import ConfiguracionScreen from '../screens/ConfiguracionScreen';
import TemaScreen from '../screens/TemaScreen';
// Conductor - Agregar vehículo (paso 1 y 2)
import AgregarVehiculoPaso1Screen from '../screens/conductor/AgregarVehiculoPaso1Screen';
import AgregarVehiculoPaso2Screen from '../screens/conductor/AgregarVehiculoPaso2Screen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  const { user } = useAuth();
  const isConductor = user?.profile?.is_conductor || false;

  return (
    <Stack.Navigator>
      {isConductor ? (
        // Si es conductor, mostrar ModoConductorScreen como home
        <>
          <Stack.Screen
            name="HomeMain"
            component={ModoConductorScreen}
            options={{ title: 'Modo Conductor', headerShown: false }}
          />
          <Stack.Screen
            name="SolicitudesDisponibles"
            component={SolicitudesDisponiblesScreen}
            options={{ title: 'Solicitudes Disponibles', headerShown: false }}
          />
          <Stack.Screen
            name="ViajeActivo"
            component={ViajeActivoScreen}
            options={{ title: 'Viaje en Curso' }}
          />
          <Stack.Screen
            name="Calificar"
            component={CalificarScreen}
            options={{ title: 'Calificar' }}
          />
        </>
      ) : (
        // Si es pasajero, mostrar HomeScreen normal
        <>
          <Stack.Screen
            name="HomeMain"
            component={HomeScreen}
            options={{ title: 'Inicio', headerShown: false }}
          />
          <Stack.Screen
            name="SolicitarViaje"
            component={SolicitarViajeScreen}
            options={{ title: 'Solicitar Viaje' }}
          />
          <Stack.Screen
            name="SolicitudEspera"
            component={SolicitudEsperaScreen}
            options={{ title: 'Buscando Conductor', headerLeft: () => null }}
          />
          <Stack.Screen
            name="ViajeActivo"
            component={ViajeActivoScreen}
            options={{ title: 'Viaje en Curso' }}
          />
          <Stack.Screen
            name="Calificar"
            component={CalificarScreen}
            options={{ title: 'Calificar' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

function MotoStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MisMotosMain"
        component={MisMotosScreen}
        options={{ title: 'Mis Motos' }}
      />
      <Stack.Screen
        name="RegistrarMoto"
        component={RegistrarMotoScreen}
        options={{ title: 'Registrar Moto' }}
      />
    </Stack.Navigator>
  );
}

function PerfilPasajeroStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PerfilMain" component={PerfilPasajeroScreen} />
      <Stack.Screen name="Seguridad" component={SeguridadScreen} />
      <Stack.Screen name="Configuracion" component={ConfiguracionScreen} />
      <Stack.Screen name="Tema" component={TemaScreen} />
    </Stack.Navigator>
  );
}

function PerfilConductorStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PerfilConductorMain" component={PerfilConductorScreen} />
      <Stack.Screen name="AgregarVehiculoPaso1" component={AgregarVehiculoPaso1Screen} />
      <Stack.Screen name="AgregarVehiculoPaso2" component={AgregarVehiculoPaso2Screen} />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const isConductor = user?.profile?.is_conductor || false;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MisViajes') {
            iconName = focused ? 'map-marker' : 'map-marker-outline';
          } else if (route.name === 'Billetera') {
            iconName = 'wallet';
          } else if (route.name === 'Motos') {
            iconName = focused ? 'motorbike' : 'motorbike';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerShown: false,
      })}>
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          title: isConductor ? 'MODO CONDUCTOR' : 'INICIO',
        }}
      />
      <Tab.Screen
        name="MisViajes"
        component={MisViajesScreen}
        options={{ title: 'VIAJES' }}
      />
      <Tab.Screen
        name="Billetera"
        component={BilleteraScreen}
        options={{ title: 'BILLETERA' }}
      />
      {isConductor && <Tab.Screen name="Motos" component={MotoStack} />}
      <Tab.Screen
        name="Perfil"
        component={isConductor ? PerfilConductorStack : PerfilPasajeroStack}
        options={{ title: 'PERFIL' }}
      />
      <Tab.Screen
        name="PerfilConductor"
        component={PerfilConductorStack}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="RegistroConductor"
        component={RegistroConductorScreen}
        options={{ tabBarButton: () => null }}
      />
    </Tab.Navigator>
  );
}

