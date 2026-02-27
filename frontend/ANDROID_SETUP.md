# Configuración de Android para Tuky (Windows)

Si al ejecutar `npm run android` aparece **"adb no se reconoce"** o **"No emulators found"**, sigue estos pasos.

## 1. Android Studio y SDK

- Instala [Android Studio](https://developer.android.com/studio).
- Abre Android Studio → **More Actions** o **Configure** → **SDK Manager**.
- En **SDK Platforms**: marca al menos una versión (p. ej. **API 33**).
- En **SDK Tools**: asegúrate de tener **Android SDK Platform-Tools** y **Android Emulator**.
- Anota la ruta del SDK (ej. `C:\Users\TuUsuario\AppData\Local\Android\Sdk`).

## 2. Variables de entorno

En Windows:

1. **Win + R** → `sysdm.cpl` → **Opciones avanzadas** → **Variables de entorno**.
2. En **Variables del sistema** o **Variables de usuario**:
   - **Nueva** → Nombre: `ANDROID_HOME` → Valor: la ruta del SDK (ej. `C:\Users\TuUsuario\AppData\Local\Android\Sdk`).
3. Edita la variable **Path** y **agrega** estas dos entradas (usando `%ANDROID_HOME%` o la ruta completa):
   - `%ANDROID_HOME%\platform-tools`  → para que funcione `adb`
   - `%ANDROID_HOME%\emulator`        → para que funcione `emulator`
4. Acepta todo y **cierra y vuelve a abrir** la terminal (o Cursor) para que se actualice el PATH.

## 3. Comprobar en terminal

En una **nueva** PowerShell o CMD:

```bash
adb version
emulator -list-avds
```

- Si `adb version` muestra la versión, el PATH está bien.
- Si `emulator -list-avds` no muestra nada, aún no hay ningún emulador creado.

## 4. Crear un emulador (AVD)

1. En Android Studio: **Tools** → **Device Manager** (o **More Actions** → **Virtual Device Manager**).
2. **Create Device** → elige un dispositivo (p. ej. Pixel 5) → **Next**.
3. Elige una imagen del sistema (p. ej. **API 33**) y descárgala si hace falta → **Next** → **Finish**.
4. En la lista del Device Manager, pulsa el **▶** del AVD para iniciar el emulador.

Cuando el emulador esté abierto (o tengas un dispositivo conectado por USB con depuración USB activada), en la carpeta del frontend ejecuta:

```bash
npm run android
```

## 5. Dispositivo físico (opcional)

- Activa **Opciones de desarrollador** en el móvil (tocar 7 veces el número de compilación en **Acerca del teléfono**).
- Activa **Depuración USB**.
- Conecta por USB y acepta “¿Permitir depuración USB?” en el móvil.
- Comprueba con `adb devices`. Si aparece el dispositivo, `npm run android` lo usará.

## Resumen de errores frecuentes

| Mensaje | Solución |
|--------|----------|
| `adb no se reconoce` | Añadir `%ANDROID_HOME%\platform-tools` al PATH y reiniciar la terminal. |
| `No emulators found` | Crear un AVD en Android Studio (Device Manager) o conectar un dispositivo por USB. |
| `emulator` no encontrado | Añadir `%ANDROID_HOME%\emulator` al PATH. |
