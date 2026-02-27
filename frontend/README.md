# Tuky Motos - Aplicación Móvil

Aplicación móvil React Native para transporte en motocicletas.

## Instalación

```bash
npm install
```

## Configuración

1. Copia `.env.example` a `.env` y configura la URL de la API
2. Para Android, configura las credenciales de Google Maps en `android/app/src/main/AndroidManifest.xml`
3. Para iOS, configura las credenciales en `ios/TukyMotos/Info.plist`

## Entorno Android (Windows)

Si ves **"adb no se reconoce"** o **"No emulators found"**:

1. **Instala Android Studio** y, dentro, el **Android SDK** (Settings → Appearance & Behavior → System Settings → Android SDK).
2. **Variables de entorno** (Panel de control → Sistema → Configuración avanzada → Variables de entorno):
   - Crea o edita `ANDROID_HOME` = `C:\Users\TU_USUARIO\AppData\Local\Android\Sdk` (o la ruta donde esté el SDK).
   - En **Path** del usuario, añade:
     - `%ANDROID_HOME%\platform-tools` (para `adb`)
     - `%ANDROID_HOME%\emulator` (para `emulator`)
   - Cierra y vuelve a abrir la terminal (o PowerShell) para que se apliquen.
3. **Emulador**: En Android Studio, **Tools → Device Manager → Create Device**. Crea un AVD (p. ej. Pixel 5, API 33) y ábrelo antes de ejecutar la app, o conecta un móvil con **depuración USB** activada.

Más detalle: [ANDROID_SETUP.md](./ANDROID_SETUP.md).

## Ejecución

### Android
```bash
npm run android
```
(Requiere emulador abierto o dispositivo conectado por USB.)

### iOS
```bash
npm run ios
```

## Estructura

- `src/screens/` - Pantallas de la aplicación
- `src/navigation/` - Configuración de navegación
- `src/services/` - Servicios para comunicación con la API
- `src/context/` - Contextos de React (Auth, etc.)
- `src/utils/` - Utilidades y configuración

## Seguridad

Vulnerabilidades de dependencias: ver [SECURITY.md](./SECURITY.md). La crítica (fast-xml-parser) está corregida vía `overrides`; el resto son altas en el ecosistema React Native/Metro/Jest y requieren una futura actualización de React Native para corregirse sin romper el proyecto.

## Características

- Autenticación con JWT
- Solicitud de viajes con mapa
- Seguimiento en tiempo real
- Historial de viajes
- Perfil de usuario




