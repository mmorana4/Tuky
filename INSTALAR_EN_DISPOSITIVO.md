# 📱 Guía: Instalar la App en Dispositivo Móvil

Esta guía te ayudará a generar e instalar la aplicación en tu dispositivo móvil Android.

---

## 📋 Requisitos Previos

1. **Node.js y npm** instalados
2. **Android Studio** instalado (para Android)
3. **Java JDK** instalado
4. **Dispositivo Android** o emulador
5. **Cable USB** (para dispositivo físico)

---

## 🔧 Paso 1: Actualizar URL del API

### 1.1 Editar `frontend/src/utils/config.js`

Abre el archivo y actualiza la URL de producción con tu dominio de Railway:

```javascript
// Cambia esta línea:
return 'https://tuky-production.up.railway.app/api/security/v1.0.0';

// Por tu URL de Railway (si es diferente):
return 'https://tu-dominio.railway.app/api/security/v1.0.0';
```

**⚠️ IMPORTANTE:** 
- Usa `https://` (no `http://`)
- No incluyas el puerto (Railway lo maneja automáticamente)
- Asegúrate de que la URL termine en `/api/security/v1.0.0`

---

## 📦 Paso 2: Generar APK para Android

### ⚠️ IMPORTANTE: Usar APK de Release

**El APK de debug requiere Metro bundler corriendo**, por lo que no funcionará en un dispositivo sin conexión a tu computadora. **Debes generar un APK de release** que incluye el bundle de JavaScript empaquetado.

### Opción A: Generar APK de Release (RECOMENDADO) ✅

1. **Abre una terminal** en la carpeta `frontend`

2. **Genera el bundle de JavaScript:**
   ```bash
   cd frontend
   mkdir -p android/app/src/main/assets
   npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
   ```

3. **Genera el APK de release:**
   ```bash
   cd android
   .\gradlew.bat assembleRelease    # Windows
   # o
   ./gradlew assembleRelease        # Linux/Mac
   ```

4. **El APK estará en:**
   ```
   frontend/android/app/build/outputs/apk/release/app-release.apk
   ```

### Opción B: APK de Desarrollo (Solo para desarrollo con Metro)

**⚠️ Solo funciona si Metro bundler está corriendo en tu computadora**

1. **Abre una terminal** en la carpeta `frontend`

2. **Inicia Metro bundler:**
   ```bash
   cd frontend
   npx react-native start
   ```

3. **En otra terminal, instala en el dispositivo:**
   ```bash
   cd frontend
   npx react-native run-android
   ```

   Esto instalará la app directamente en tu dispositivo, pero **requiere que Metro esté corriendo**.

5. **Transfiere el APK a tu dispositivo** usando uno de estos métodos:

   **Método A: Por USB (Más rápido)**
   - Conecta tu dispositivo Android por USB
   - Copia el archivo `app-release.apk` a la carpeta "Descargas" o "Download" de tu dispositivo
   - Desconecta el USB

   **Método B: Por Email**
   - Envía el APK por email a ti mismo
   - Abre el email en tu dispositivo
   - Descarga el archivo adjunto

   **Método C: Por Google Drive / Dropbox**
   - Sube el APK a Google Drive o Dropbox
   - Abre la app en tu dispositivo
   - Descarga el APK

   **Método D: Por WhatsApp / Telegram**
   - Envía el APK a ti mismo por WhatsApp o Telegram
   - Descarga el archivo desde la conversación

6. **Instala el APK:**
   - En tu dispositivo Android, ve a **Configuración → Seguridad**
   - Activa **"Fuentes desconocidas"** o **"Instalar apps desconocidas"**
     - En Android 8+: Ve a la app que usarás para instalar (ej: "Archivos") y activa "Permitir desde esta fuente"
   - Abre el archivo APK desde el administrador de archivos
   - Toca "Instalar" y sigue las instrucciones
   - Una vez instalado, puedes desactivar "Fuentes desconocidas" por seguridad

### Opción C: APK de Producción (Release) - Para Distribución

1. **Genera una clave de firma** (solo la primera vez):
   ```bash
   cd frontend/android/app
   keytool -genkeypair -v -storetype PKCS12 -keystore tuky-release-key.keystore -alias tuky-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configura `android/gradle.properties`:**
   ```properties
   TUKY_RELEASE_STORE_FILE=tuky-release-key.keystore
   TUKY_RELEASE_KEY_ALIAS=tuky-key-alias
   TUKY_RELEASE_STORE_PASSWORD=tu-password
   TUKY_RELEASE_KEY_PASSWORD=tu-password
   ```

3. **Configura `android/app/build.gradle`:**
   ```gradle
   android {
       ...
       signingConfigs {
           release {
               if (project.hasProperty('TUKY_RELEASE_STORE_FILE')) {
                   storeFile file(TUKY_RELEASE_STORE_FILE)
                   storePassword TUKY_RELEASE_STORE_PASSWORD
                   keyAlias TUKY_RELEASE_KEY_ALIAS
                   keyPassword TUKY_RELEASE_KEY_PASSWORD
               }
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
           }
       }
   }
   ```

4. **Genera el APK de release:**
   ```bash
   cd frontend/android
   ./gradlew assembleRelease
   ```

5. **El APK estará en:**
   ```
   frontend/android/app/build/outputs/apk/release/app-release.apk
   ```

---

## 🚀 Paso 3: Instalar en el Dispositivo

### Método 1: Instalación Directa (Recomendado)

1. **Conecta tu dispositivo por USB**
2. **Ejecuta:**
   ```bash
   cd frontend
   npx react-native run-android
   ```
3. La app se instalará automáticamente

### Método 2: Instalación Manual desde APK

1. **Transfiere el APK** a tu dispositivo (USB, email, Google Drive, etc.)
2. **Habilita "Fuentes desconocidas"** en tu dispositivo
3. **Abre el archivo APK** desde el administrador de archivos
4. **Sigue las instrucciones** de instalación

---

## ✅ Paso 4: Verificar que Funciona

1. **Abre la app** en tu dispositivo
2. **Intenta iniciar sesión** o registrarte
3. **Verifica en los logs** que las peticiones van a Railway:
   - Abre React Native Debugger o Chrome DevTools
   - Busca peticiones a `tuky-production.up.railway.app`

---

## 🔍 Solución de Problemas

### Error: "Unable to resolve module"
**Solución:** Ejecuta `npm install` en la carpeta `frontend`

### Error: "SDK location not found"
**Solución:** Configura `ANDROID_HOME` en las variables de entorno:
```bash
# Windows
set ANDROID_HOME=C:\Users\TuUsuario\AppData\Local\Android\Sdk

# Linux/Mac
export ANDROID_HOME=$HOME/Android/Sdk
```

### Error: "Metro bundler not starting"
**Solución:** 
```bash
cd frontend
npm start -- --reset-cache
```

### La app no se conecta al backend
**Solución:** 
1. Verifica que la URL en `config.js` sea correcta
2. Asegúrate de usar `https://` (no `http://`)
3. Verifica que Railway esté funcionando accediendo a la URL en el navegador

### Error de permisos en Android
**Solución:** 
- Verifica que la app tenga permisos de ubicación, internet, etc.
- Revisa `AndroidManifest.xml` en `frontend/android/app/src/main/`

---

## 📝 Checklist Final

- [ ] URL del API actualizada en `config.js`
- [ ] APK generado correctamente
- [ ] Dispositivo conectado o emulador iniciado
- [ ] App instalada en el dispositivo
- [ ] App se conecta correctamente al backend de Railway
- [ ] Login/Registro funcionan correctamente

---

## 🎯 Próximos Pasos

1. **Probar todas las funcionalidades** en el dispositivo
2. **Verificar que el GPS funcione** correctamente
3. **Probar la conexión con Railway** desde el dispositivo
4. **Generar APK de release** para distribución

---

## 💡 Consejos

- **Para desarrollo:** Usa `npx react-native run-android` (más rápido)
- **Para pruebas:** Genera APK de debug y compártelo
- **Para producción:** Genera APK de release firmado
- **Para iOS:** Necesitas Mac y Xcode (proceso similar pero más complejo)

---

¿Necesitas ayuda con algún paso específico?


haciendo una prueba con el git 

esto es una segunda prueba 