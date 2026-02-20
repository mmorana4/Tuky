# Levantar Tuky en local

## Requisitos

- **Docker Desktop** instalado y **en ejecución** (que aparezca el ícono de Docker en la bandeja).
- (Opcional) Node.js 18+ y Android Studio / emulador para el frontend.

## Pasos rápidos (PowerShell)

1. Abre PowerShell en la carpeta del proyecto (`Tuky`).

2. Ejecuta el script:
   ```powershell
   .\levantar_local.ps1
   ```
   Eso hará: crear `.env` si no existe, levantar contenedores, esperar a la DB, ejecutar migraciones y crear usuario admin.

3. Si Docker no estaba corriendo, inicia **Docker Desktop** y vuelve a ejecutar:
   ```powershell
   .\levantar_local.ps1
   ```

## Pasos manuales

```powershell
# Desde la carpeta Tuky

# 1. Crear .env (solo la primera vez)
copy .env.example .env

# 2. Levantar servicios
docker-compose up -d --build

# 3. Esperar ~15 segundos y ejecutar migraciones
docker-compose exec core-service python manage.py migrate --noinput

# 4. Crear usuario admin
docker-compose exec core-service python create_admin.py
```

## Comprobar que el backend está bien

- **API:** http://localhost:8000/api/security/v1.0.0/
- **Swagger:** http://localhost:8000/swagger/
- **Admin Django:** http://localhost:8000/admin/

Credenciales por defecto (si usaste `create_admin.py`): usuario `admin`, contraseña según el script (a veces `admin123`).

## Frontend (app móvil)

1. En **`frontend/src/utils/config.js`** pon la URL del backend:
   - Emulador Android: `http://10.0.2.2:8000/api/security/v1.0.0`
   - Celular en la misma WiFi: `http://TU_IP:8000/api/security/v1.0.0` (ej. `http://192.168.1.10:8000/...`)

2. En una terminal:
   ```powershell
   cd frontend
   npm install
   npx react-native start
   ```

3. En otra terminal:
   ```powershell
   cd frontend
   npx react-native run-android
   ```

## Detener todo

```powershell
docker-compose down
```

## Problemas frecuentes

- **"unable to get image" / "pipe dockerDesktopLinuxEngine"**  
  Docker no está en ejecución. Abre Docker Desktop y espera a que arranque.

- **Puerto 8000 en uso**  
  Libera el puerto o cambia en `docker-compose.yml` el mapeo (ej. `"8002:8000"`).

- **La app no conecta al backend**  
  Revisa la IP en `frontend/src/utils/config.js` y que el celular y la PC estén en la misma red (o usa el emulador con `10.0.2.2`).
