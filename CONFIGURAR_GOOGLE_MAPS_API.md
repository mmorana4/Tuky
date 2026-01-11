# Configuración de Google Maps API

Para que funcione correctamente la búsqueda de direcciones y el autocompletado, necesitas habilitar las siguientes APIs en Google Cloud Console:

## APIs Requeridas

1. **Places API** - Para autocompletado de direcciones
2. **Geocoding API** - Para convertir direcciones en coordenadas
3. **Maps JavaScript API** - Para mostrar mapas (ya debería estar habilitada)

## Pasos para Habilitar las APIs

### 1. Acceder a Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Selecciona el proyecto donde está tu API key

### 2. Habilitar Places API

1. En el menú lateral, ve a **APIs & Services** > **Library**
2. Busca "Places API"
3. Haz clic en **Places API**
4. Haz clic en el botón **ENABLE** (Habilitar)

### 3. Habilitar Geocoding API

1. En el menú lateral, ve a **APIs & Services** > **Library**
2. Busca "Geocoding API"
3. Haz clic en **Geocoding API**
4. Haz clic en el botón **ENABLE** (Habilitar)

### 4. Verificar Restricciones de la API Key

1. Ve a **APIs & Services** > **Credentials**
2. Busca tu API key: `AIzaSyCUK0r2jPEqxWSMRj3GWmZRzo2hICdcq6o`
3. Haz clic en la API key para editarla
4. En **API restrictions**, asegúrate de que esté configurada como:
   - **Don't restrict key** (No restringir clave) - Para desarrollo
   - O **Restrict key** y selecciona solo:
     - Places API
     - Geocoding API
     - Maps JavaScript API

### 5. Verificar Restricciones de Aplicación (Opcional)

Si tienes restricciones de aplicación configuradas:
- Para desarrollo: Puedes usar **None** (Ninguna)
- Para producción: Configura las restricciones según tu plataforma (Android, iOS, HTTP referrers)

## Verificar que Funciona

Después de habilitar las APIs, espera unos minutos y luego prueba:

1. Abre la app
2. Ve a "Solicitar Viaje"
3. Selecciona "Ingresar ubicación"
4. Escribe una dirección (ej: "Guayaquil, Ecuador")
5. Deberías ver sugerencias mientras escribes
6. Al seleccionar una sugerencia o confirmar, debería encontrar la ubicación

## Solución de Problemas

### Error: "REQUEST_DENIED"
- **Causa**: La API key no tiene permisos o las APIs no están habilitadas
- **Solución**: Verifica que Places API y Geocoding API estén habilitadas

### Error: "No se encontró la dirección"
- **Causa**: La dirección es muy genérica o no existe
- **Solución**: Intenta con una dirección más específica o selecciona en el mapa

### No aparecen sugerencias al escribir
- **Causa**: Places API no está habilitada o hay un error de red
- **Solución**: 
  1. Verifica que Places API esté habilitada
  2. Revisa la consola del navegador/React Native para ver errores
  3. Verifica tu conexión a internet

### Las APIs están habilitadas pero no funciona
- Espera 5-10 minutos después de habilitar las APIs (puede tomar tiempo propagarse)
- Verifica que la API key sea correcta
- Revisa los logs en la consola de React Native para ver mensajes de error específicos

## Costos

**Nota**: Google Maps Platform tiene un plan gratuito con límites:
- **Places API**: $200 USD de crédito mensual (equivalente a ~40,000 solicitudes)
- **Geocoding API**: $200 USD de crédito mensual (equivalente a ~40,000 solicitudes)

Para la mayoría de aplicaciones pequeñas/medianas, el plan gratuito es suficiente.

## API Key Actual

La API key que se está usando en el código es:
```
AIzaSyCUK0r2jPEqxWSMRj3GWmZRzo2hICdcq6o
```

**⚠️ IMPORTANTE**: Esta API key está expuesta en el código. Para producción, considera:
1. Usar variables de entorno
2. Restringir la API key por dominio/aplicación
3. Usar un proxy backend para ocultar la API key
