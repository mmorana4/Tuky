# Tuky Motos

Aplicación de transporte de pasajeros en motocicleta para Guayaquil, Ecuador.

## 📋 Requisitos Previos

### Backend
- Docker Desktop instalado y corriendo
- Docker Compose
- Puerto 8000 disponible

### Frontend (React Native - Android)
- Node.js v18 o superior
- npm o yarn
- Android Studio con SDK instalado
- Java JDK 17
- Un dispositivo Android físico o emulador configurado
- Android SDK Platform 34
- Android Build Tools 34.0.0

## 🚀 Instalación y Ejecución

### 1. Backend (Django + PostgreSQL + Redis)

```bash
# Navegar a la carpeta raíz del proyecto
cd c:\Users\Miller\Desktop\Tuky

# Crear archivo .env si no existe (ya debería existir)
# El archivo .env ya está configurado con las variables necesarias

# Levantar los servicios con Docker Compose
docker-compose up -d

# Verificar que los contenedores estén corriendo
docker-compose ps

# Ver logs del backend (opcional)
docker-compose logs -f core-service
```

**Servicios que se levantan:**
- PostgreSQL en puerto 5432
- Redis en puerto 6379
- Backend Django en puerto 8000

**Crear usuario administrador:**
```bash
# Ejecutar script de creación de usuario
docker-compose exec core-service python create_admin.py
```

### 2. Frontend (React Native - Android)

```bash
# Navegar a la carpeta del frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar el Metro bundler
npx react-native start

# En otra terminal, instalar y ejecutar en Android
npx react-native run-android
```

**Configuración importante:**
- El frontend está configurado para conectarse a `http://192.168.1.101:8000`
- Asegúrate de que tu celular y PC estén en la misma red WiFi
- Si tu IP es diferente, edita `frontend/src/utils/config.js`

## 🔑 Credenciales de Prueba

**Usuario Administrador:**
- Username: `admin`
- Password: `admin123`

## 📱 Permisos de Android

La aplicación solicitará los siguientes permisos:
- **Ubicación**: Para mostrar tu ubicación en el mapa y solicitar viajes
- **Internet**: Para comunicarse con el backend

## 🛠️ Comandos Útiles

### Backend

```bash
# Detener todos los servicios
docker-compose down

# Reconstruir y reiniciar servicios
docker-compose up -d --build

# Ver logs de un servicio específico
docker-compose logs -f core-service

# Ejecutar comandos Django en el contenedor
docker-compose exec core-service python manage.py <comando>

# Acceder a la shell de Django
docker-compose exec core-service python manage.py shell
```

### Frontend

```bash
# Limpiar cache y reinstalar
cd frontend
rm -rf node_modules
npm install

# Limpiar build de Android
cd android
./gradlew clean
cd ..

# Reiniciar Metro bundler con cache limpio
npx react-native start --reset-cache

# Ver logs de Android en tiempo real
npx react-native log-android
```

## 🐛 Solución de Problemas

### Backend

**Error: Puerto 8000 ya está en uso**
```bash
# En Windows PowerShell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Error: DisallowedHost**
- El backend ya está configurado con `ALLOWED_HOSTS = *`
- Si persiste, verifica el archivo `backend/core-service-ms/core/my_base.py`

### Frontend

**Error: Unable to load script**
- Asegúrate de que Metro bundler esté corriendo (`npx react-native start`)
- Verifica que el puerto 8081 esté disponible

**Error: INSTALL_FAILED_USER_RESTRICTED**
- En el celular, ve a Configuración > Opciones de desarrollador
- Activa "Instalación por USB"
- Desactiva "Verificar apps por USB"

**Error: SDK location not found**
- Crea el archivo `frontend/android/local.properties`:
```
sdk.dir=C\:\\Users\\<TU_USUARIO>\\AppData\\Local\\Android\\Sdk
```

**La app no se conecta al backend**
1. Verifica que estés en la misma red WiFi
2. Encuentra tu IP local:
   ```bash
   ipconfig
   # Busca IPv4 Address
   ```
3. Actualiza `frontend/src/utils/config.js` con tu IP

**Texto invisible en los inputs**
- Ya está corregido con `color: '#000'` y `placeholderTextColor="#999"`
- Si persiste, recarga la app agitando el celular y seleccionando "Reload"

## 📚 Estructura del Proyecto

```
Tuky/
├── backend/
│   └── core-service-ms/          # Backend Django
│       ├── api/                   # Endpoints REST
│       ├── security/              # Modelos de usuarios y autenticación
│       ├── server/                # Configuración Django
│       ├── create_admin.py        # Script para crear usuario admin
│       └── requirements.txt       # Dependencias Python
├── frontend/
│   ├── src/
│   │   ├── screens/              # Pantallas de la app
│   │   ├── services/             # Servicios API
│   │   ├── context/              # Context API (Auth, etc.)
│   │   └── navigation/           # Configuración de navegación
│   ├── android/                  # Código nativo Android
│   └── package.json              # Dependencias npm
├── docker-compose.yml            # Orquestación de servicios
├── .env                          # Variables de entorno
└── README.md                     # Este archivo
```

## 🌐 URLs Importantes

- Backend API: `http://192.168.1.101:8000`
- Swagger Docs: `http://192.168.1.101:8000/swagger/`
- Admin Django: `http://192.168.1.101:8000/admin/`

## 📝 Notas de Desarrollo

- React Native version: 0.72.6
- Android SDK: 34
- Python: 3.11
- Django: Versión especificada en requirements.txt
- PostgreSQL: Latest
- Redis: Latest

## 🤝 Contribuir

Para contribuir al proyecto:
1. Crea una rama nueva para tu feature
2. Haz commit de tus cambios
3. Crea un Pull Request

## 📄 Licencia

[Especificar licencia del proyecto]

## 👥 Contacto

[Información de contacto del equipo]
