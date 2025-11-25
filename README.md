# Tuky Motos - Aplicación de Transporte en Moto

Aplicación móvil tipo InDrive para transporte en motocicletas. Permite a los usuarios solicitar viajes y a los conductores aceptarlos, con seguimiento en tiempo real y sistema de calificaciones.

## 🏗️ Estructura del Proyecto

```
Tuky/
├── backend/
│   └── core-service-ms/          # Backend Django REST Framework
│       ├── api/
│       │   └── v1_0_0/
│       │       ├── transport/    # APIs de transporte
│       │       │   ├── solicitud/ # Gestión de solicitudes
│       │       │   └── viaje/    # Gestión de viajes
│       │       └── auth/         # Autenticación
│       └── security/
│           └── models.py         # Modelos de datos (Moto, Conductor, Viaje, etc.)
│
└── frontend/                      # Aplicación móvil React Native
    └── src/
        ├── screens/              # Pantallas de la app
        ├── navigation/           # Navegación
        ├── services/             # Servicios API
        └── context/              # Contextos React
```

## 🚀 Características Principales

### Para Pasajeros
- ✅ Solicitar viajes indicando origen y destino en el mapa
- ✅ Ofrecer precio personalizado
- ✅ Ver solicitudes disponibles cerca
- ✅ Seguimiento en tiempo real del viaje
- ✅ Calificar al conductor después del viaje
- ✅ Historial de viajes

### Para Conductores
- ✅ Ver solicitudes de viaje disponibles
- ✅ Aceptar solicitudes de viaje
- ✅ Gestionar motos registradas
- ✅ Actualizar ubicación en tiempo real
- ✅ Iniciar y completar viajes
- ✅ Sistema de calificaciones

## 📋 Modelos de Datos

### Moto
- Marca, modelo, año, placa, color
- Cilindrada
- Foto de la moto
- Verificación de documentos

### Conductor
- Perfil extendido del usuario
- Licencia de conducir
- Calificación promedio
- Estado (disponible, en viaje, no disponible)
- Ubicación actual (lat/lng)

### Viaje
- Pasajero y conductor
- Moto utilizada
- Origen y destino (coordenadas y dirección)
- Precio solicitado y precio final
- Método de pago
- Estados: solicitado, aceptado, en_camino_origen, llegado_origen, en_viaje, completado, cancelado
- Calificaciones mutuas

### SolicitudViaje
- Solicitudes pendientes de ser aceptadas
- Expiración automática
- Ubicaciones y precio

## 🔧 Tecnologías Utilizadas

### Backend
- **Django 4.x** - Framework web
- **Django REST Framework** - API REST
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación

### Frontend
- **React Native 0.72** - Framework móvil
- **React Navigation** - Navegación
- **React Native Maps** - Mapas
- **Axios** - Cliente HTTP
- **React Native Paper** - UI Components
- **AsyncStorage** - Almacenamiento local

## 📦 Instalación

### Backend

```bash
cd backend/core-service-ms
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
# Para Android
npm run android
# Para iOS
npm run ios
```

## 🔌 APIs Principales

### Solicitudes de Viaje
- `POST /api/v1_0_0/transport/solicitudes/crear/` - Crear solicitud
- `GET /api/v1_0_0/transport/solicitudes/disponibles/` - Listar disponibles
- `POST /api/v1_0_0/transport/solicitudes/aceptar/` - Aceptar solicitud
- `POST /api/v1_0_0/transport/solicitudes/cancelar/` - Cancelar solicitud

### Viajes
- `GET /api/v1_0_0/transport/viajes/mis_viajes/` - Mis viajes
- `GET /api/v1_0_0/transport/viajes/{id}/detalle/` - Detalle del viaje
- `POST /api/v1_0_0/transport/viajes/{id}/iniciar/` - Iniciar viaje
- `POST /api/v1_0_0/transport/viajes/{id}/completar/` - Completar viaje
- `POST /api/v1_0_0/transport/viajes/{id}/cancelar/` - Cancelar viaje

## 🗺️ Flujo de la Aplicación

1. **Pasajero solicita viaje**
   - Selecciona origen y destino en el mapa
   - Ofrece un precio
   - Se crea una SolicitudViaje

2. **Conductor acepta solicitud**
   - Ve solicitudes disponibles cerca
   - Acepta una solicitud
   - Se crea un Viaje con estado "aceptado"

3. **Viaje en progreso**
   - Conductor va al origen (estado "en_camino_origen")
   - Llega al origen (estado "llegado_origen")
   - Inicia el viaje (estado "en_viaje")
   - Completa el viaje (estado "completado")

4. **Calificación**
   - Pasajero y conductor se califican mutuamente
   - Se actualiza la calificación promedio del conductor

## 🔐 Autenticación

La aplicación utiliza JWT (JSON Web Tokens) para autenticación:
- Token de acceso (corto plazo)
- Token de refresco (largo plazo)
- Los tokens se almacenan en AsyncStorage

## 📱 Pantallas Principales

1. **Login/Register** - Autenticación de usuarios
2. **Home** - Mapa con solicitudes disponibles y botón para solicitar viaje
3. **Solicitar Viaje** - Selección de origen/destino y precio
4. **Viaje Activo** - Seguimiento del viaje en curso
5. **Mis Viajes** - Historial de viajes
6. **Perfil** - Información del usuario

## 🚧 Próximas Mejoras

- [ ] Notificaciones push
- [ ] Chat en tiempo real entre pasajero y conductor
- [ ] Integración con pasarelas de pago
- [ ] Geocodificación inversa para direcciones
- [ ] Cálculo automático de distancia y precio sugerido
- [ ] Sistema de referidos
- [ ] Modo conductor/pasajero
- [ ] Historial de pagos
- [ ] Soporte multi-idioma

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👥 Contribuidores

- Equipo de desarrollo Tuky

---

**Nota**: Esta aplicación está en desarrollo activo. Algunas funcionalidades pueden estar incompletas o en fase de prueba.
