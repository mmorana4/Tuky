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

## Ejecución

### Android
```bash
npm run android
```

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




