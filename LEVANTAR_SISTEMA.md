# Análisis: qué falta para levantar el sistema Tuky

## 1. Backend – Core Service (Django)

### 1.1 Archivo de settings faltante (crítico)
- **Problema:** El proyecto usa `server.settings` (manage.py, wsgi.py, urls.py, core/my_business.py) pero en `server/` solo existe `settings_dev.py`. No hay `server/settings.py`.
- **Solución:** Crear `backend/core-service-ms/server/settings.py` que importe la configuración de desarrollo o producción, por ejemplo:
  ```python
  # Opción A: usar siempre settings_dev
  from .settings_dev import *
  ```
  O configurar `DJANGO_SETTINGS_MODULE=server.settings_dev` en todos los puntos de entrada (manage.py, wsgi.py, asgi.py, create_admin.py, etc.) y en `server/urls.py` usar `from server import settings_dev as settings`.

### 1.2 Variables de entorno
- **Raíz del proyecto:** Debe existir un `.env` (no versionado) basado en `.env.example`. Contenido mínimo para Docker:
  - `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST=db`, `POSTGRES_PORT=5432`
  - `REDIS_HOST=redis`, `REDIS_PORT=6379`
  - `CORE_DEBUG`, `CORE_SECRET_KEY`, `BUSINESS_DEBUG`, `BUSINESS_SECRET_KEY`
- **Core service:** Opcionalmente un `.env` en `backend/core-service-ms/` si se corre sin Docker. `core/my_base.py` usa `python-decouple` y lee `DB_HOST`, `DB_NAME`, etc. En Docker las variables se inyectan por `docker-compose.yml`.

### 1.3 Base de datos
- **PostgreSQL** debe estar levantado antes que los servicios Django (docker-compose ya define `depends_on` con healthcheck).
- **Migraciones:** Ejecutar al menos una vez:
  ```bash
  docker-compose exec core-service python manage.py migrate --noinput
  ```
  El `start.sh` usado en Railway ya hace migrate; en Docker el Dockerfile por defecto hace `migrate` y `runserver`. Si usas `start.sh` en Docker, también haría migrate.

### 1.4 Gunicorn (producción)
- **start.sh** usa `gunicorn`; no está en `requirements.txt` del core-service. Añadir a `backend/core-service-ms/requirements.txt`:
  ```
  gunicorn==21.2.0
  ```
  O el `start.sh` hace `pip install gunicorn==21.2.0` si no está (línea 32).

### 1.5 Usuario inicial / datos de prueba
- Después de las migraciones, crear al menos un usuario admin o datos de prueba:
  ```bash
  docker-compose exec core-service python create_admin.py
  ```
  O usar `seed_user.py` / fixtures según tu flujo.

---

## 2. Backend – Business Service

- **Docker-compose** ya define `business-service` (puerto 8001). Usa la misma DB y Redis y `CORE_SERVICE_URL` para llamar al core.
- **Variables:** Mismas `DB_*`, `REDIS_*`; `BUSINESS_DEBUG`, `BUSINESS_SECRET_KEY`.
- **Migraciones:** Si el business-service tiene modelos propios, ejecutar sus migraciones cuando corresponda.
- **Rutas/APIs:** El frontend actual apunta solo al core (auth, transport). Si el frontend debe consumir también el business-service, habrá que configurar esa URL en el cliente.

---

## 3. Infraestructura – Docker

### 3.1 Dockerfile del core
- **Ubicación:** `infrastructure/docker/django.Dockerfile`. El contexto de build en docker-compose es `./backend/core-service-ms`, por lo que el Dockerfile se invoca desde ahí; la ruta al Dockerfile es `../../infrastructure/docker/django.Dockerfile`.
- **CMD actual:** Hace `migrate` y `runserver`. Para producción conviene usar `start.sh` con gunicorn (como en Railway) o cambiar el CMD a un script que ejecute migrate + gunicorn.

### 3.2 Host de DB en Docker
- En `.env` (raíz) debe estar **POSTGRES_HOST=db** (o el nombre del servicio de postgres en docker-compose). El compose pasa `DB_HOST=${POSTGRES_HOST}` al core-service. Si no, el core intentará conectar a `localhost` y fallará dentro del contenedor.

### 3.3 Puerto y red
- Verificar que los puertos 5432, 6379, 8000 (y 8001 si usas business-service) estén libres en el host.

---

## 4. Frontend (React Native)

### 4.1 API base URL
- **Archivo:** `frontend/src/utils/config.js`. En `__DEV__` usa una IP fija (ej. `192.168.1.103:8000`) para Android. Para levantar el sistema en tu red debes:
  - Poner la **IP de tu PC** en la misma red que el celular/emulador.
  - O usar `10.0.2.2:8000` para el emulador Android (localhost del host).

### 4.2 Dependencias
- Ejecutar `npm install` en `frontend/`. No hay indicios de que falten paquetes críticos si el `package.json` está completo.

### 4.3 Android
- Tener configurado Android SDK (y opcionalmente `local.properties` con `sdk.dir`). Sin eso no se puede construir/ejecutar la app.

---

## 5. Railway (despliegue)

- **railway.json** y **start.sh** están preparados para el core-service (Nixpacks, migrate, collectstatic, gunicorn).
- **Solo se despliega el core-service.** Si en producción quieres también PostgreSQL y Redis, hay que añadirlos como servicios en Railway o usar DB/Redis externos y configurar variables (PGHOST, REDISHOST, etc.). `core/my_base.py` ya contempla variables tipo Railway (PGHOST, PGPORT, REDISHOST, REDISPORT).
- Tener en Railway las variables de entorno equivalentes a las del `.env.example` (SECRET_KEY, DB, Redis, etc.) con los valores de los servicios provisionados.

---

## 6. Resumen de pasos mínimos para levantar

1. **Crear `server/settings.py`** en core-service (o unificar uso de `settings_dev` como arriba).
2. **Crear `.env`** en la raíz del proyecto a partir de `.env.example`, con `POSTGRES_HOST=db` y `REDIS_HOST=redis` para Docker.
3. **Añadir gunicorn** a `backend/core-service-ms/requirements.txt` si usas `start.sh` en producción.
4. **Levantar servicios:**  
   `docker-compose up -d`
5. **Migraciones:**  
   `docker-compose exec core-service python manage.py migrate --noinput`
6. **Usuario admin / seed:**  
   `docker-compose exec core-service python create_admin.py` (o el script que uses).
7. **Frontend:** En `frontend/src/utils/config.js` poner la IP correcta del backend (tu máquina o 10.0.2.2 para emulador). Luego `npm install` y `npx react-native run-android` (o start + run-ios según corresponda).

Con esto deberías poder tener el backend (core + DB + Redis) y el frontend conectados en un entorno local/Docker. Para producción en Railway, además configurar las variables de entorno y los servicios de DB/Redis en esa plataforma.
