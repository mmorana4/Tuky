# 🚀 Guía de Despliegue Gratuito - Tuky

Esta guía te ayudará a desplegar tu proyecto de manera gratuita para hacer pruebas.

## 📋 Opciones Recomendadas

### 1. **Railway** (⭐ RECOMENDADO - Más fácil)

**Ventajas:**
- $5 USD de crédito gratuito mensual
- Despliegue automático desde GitHub
- PostgreSQL y Redis incluidos
- URL pública automática
- Muy fácil de configurar

**Pasos:**

1. **Crear cuenta en Railway:**
   - Ve a [railway.app](https://railway.app)
   - Inicia sesión con GitHub

2. **Crear nuevo proyecto:**
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Conecta tu repositorio

3. **Agregar Base de Datos PostgreSQL:**
   - En tu proyecto, click en "+ New"
   - Selecciona "Database" → "Add PostgreSQL"
   - Railway generará automáticamente las variables de entorno

4. **Agregar Redis:**
   - Click en "+ New"
   - Selecciona "Database" → "Add Redis"

5. **Desplegar Django:**
   - Click en "+ New"
   - Selecciona "GitHub Repo" → Tu repositorio
   - Railway debería detectar automáticamente el proyecto Django gracias a los archivos de configuración (`nixpacks.toml`, `start.sh`, `Procfile`)
   - Si no detecta automáticamente, ve a "Settings" → "Build" y selecciona "Nixpacks" o "Dockerfile"

6. **Configurar Variables de Entorno:**
   En el servicio de Django, ve a "Variables" y agrega las siguientes variables (estas son las que usa tu proyecto según `core/my_base.py`):

   ```env
   DEBUG=False
   SECRET_KEY=tu-secret-key-generada
   DB_NAME=${{Postgres.DATABASE}}
   DB_USER=${{Postgres.USER}}
   DB_PASSWORD=${{Postgres.PASSWORD}}
   DB_HOST=${{Postgres.HOST}}
   DB_PORT=${{Postgres.PORT}}
   REDIS_HOST=${{Redis.REDIS_HOST}}
   REDIS_PORT=${{Redis.REDIS_PORT}}
   REDIS_DB=0
   REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
   ALLOWED_HOSTS=*
   ```
   
   **⚠️ IMPORTANTE - Generar SECRET_KEY:**
   - `SECRET_KEY` es **OBLIGATORIO** en producción
   - Genera uno seguro con este comando:
     ```bash
     python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
     ```
   - O usa este generador online: https://djecrety.ir/
   - **NUNCA** uses el valor por defecto en producción
   
   **⚠️ CRÍTICO - Variables de Base de Datos:**
   - Las variables `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` son **OBLIGATORIAS**
   - Si no están configuradas, el proyecto intentará conectarse a `localhost` (que fallará en Railway)
   - **Cómo obtener las variables en Railway:**
     1. Ve a tu servicio PostgreSQL en Railway
     2. En la pestaña "Variables", encontrarás:
        - `PGDATABASE` → usar como `DB_NAME`
        - `PGUSER` → usar como `DB_USER`
        - `PGPASSWORD` → usar como `DB_PASSWORD`
        - `PGHOST` → usar como `DB_HOST`
        - `PGPORT` → usar como `DB_PORT`
     3. O usa las referencias automáticas: `${{Postgres.DATABASE}}`, `${{Postgres.USER}}`, etc.
   
   **Nota importante:** 
   - Railway usa `${{Service.VARIABLE}}` para referenciar variables de otros servicios
   - Si Railway no genera estas referencias automáticamente, ve a cada servicio (PostgreSQL y Redis) y copia los valores reales de las variables
   - En PostgreSQL, busca: `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT` (o `DATABASE`, `USER`, etc.)
   - En Redis, busca: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` (si aplica)
   
   **Variables opcionales (tienen valores por defecto):**
   ```env
   IP_LOAD_BALANCED_INTERNAL=127.0.0.1
   COOKIE_SESSION_NAME=123456
   ```
   
   **Variables con valores por defecto (pero deben configurarse en producción):**
   - `SECRET_KEY`: Tiene un valor temporal por defecto, **DEBE cambiarse en producción**
   - `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`: Tienen valores por defecto para desarrollo, **DEBEN configurarse en producción**

7. **Configurar el comando de inicio (si es necesario):**
   - Railway debería detectar automáticamente el `start.sh` o `Procfile`
   - Si no funciona, ve a "Settings" → "Deploy"
   - Start Command: `bash start.sh` o deja vacío para usar el Procfile
   
   **Nota:** El proyecto incluye `nixpacks.toml`, `start.sh` y `Procfile` para que Railway detecte automáticamente cómo construir y ejecutar la app.

8. **Generar Secret Key:**
   ```bash
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```

9. **Desplegar:**
   - Railway desplegará automáticamente
   - Obtendrás una URL pública como: `https://tu-proyecto.up.railway.app`

---

### 2. **Render** (Alternativa gratuita)

**Ventajas:**
- Plan gratuito disponible
- PostgreSQL gratuito (90 días)
- Fácil configuración

**Limitaciones:**
- El servicio se "duerme" después de 15 min de inactividad
- PostgreSQL se pausa después de 90 días

**Pasos:**

1. **Crear cuenta en Render:**
   - Ve a [render.com](https://render.com)
   - Inicia sesión con GitHub

2. **Crear Base de Datos PostgreSQL:**
   - Dashboard → "New +" → "PostgreSQL"
   - Nombre: `tuky-db`
   - Plan: Free
   - Guarda las credenciales

3. **Crear Servicio Web (Django):**
   - Dashboard → "New +" → "Web Service"
   - Conecta tu repositorio
   - Configuración:
     - **Build Command:** `cd backend/core-service-ms && pip install -r requirements.txt && python manage.py collectstatic --noinput`
     - **Start Command:** `cd backend/core-service-ms && gunicorn server.wsgi:application --bind 0.0.0.0:$PORT`

4. **Variables de Entorno en Render:**
   Estas son las variables que usa tu proyecto (según `core/my_base.py`):
   
   ```env
   DEBUG=False
   SECRET_KEY=tu-secret-key-generada
   DB_NAME=nombre-de-tu-db
   DB_USER=usuario-postgres
   DB_PASSWORD=password-postgres
   DB_HOST=dbs-xxxxx.render.com
   DB_PORT=5432
   REDIS_HOST=tu-redis-host.upstash.io
   REDIS_PORT=6379
   REDIS_DB=0
   REDIS_PASSWORD=tu-redis-password
   ALLOWED_HOSTS=tu-app.onrender.com
   ```
   
   **Nota:** Para Redis en Render, puedes usar Upstash (gratis) o crear un servicio Redis en Render.

---

### 3. **Supabase (PostgreSQL Gratuito)**

Si solo necesitas PostgreSQL:

1. Ve a [supabase.com](https://supabase.com)
2. Crea un proyecto gratuito
3. Obtén las credenciales de conexión
4. Usa estas credenciales en Railway o Render

**Límites gratuitos:**
- 500 MB de base de datos
- 2 GB de ancho de banda
- API REST incluida

---

### 4. **Upstash (Redis Gratuito)**

Para Redis:

1. Ve a [upstash.com](https://upstash.com)
2. Crea una cuenta gratuita
3. Crea una base de datos Redis
4. Obtén la URL de conexión
5. Usa esta URL en tus variables de entorno

**Límites gratuitos:**
- 10,000 comandos/día
- 256 MB de memoria

---

## 🔧 Configuración del Frontend (React Native)

Para probar tu app móvil sin estar localmente:

### Opción 1: **Expo (Recomendado)**

1. **Instalar Expo CLI:**
   ```bash
   npm install -g expo-cli
   ```

2. **Crear build de prueba:**
   ```bash
   cd frontend
   expo build:android
   # o
   expo build:ios
   ```

3. **O usar EAS Build (más moderno):**
   ```bash
   npm install -g eas-cli
   eas build --platform android --profile preview
   ```

4. **Actualizar URL del API:**
   En tu código React Native, cambia la URL base del API:
   ```javascript
   // En tu archivo de configuración (ej: config.js)
   const API_URL = __DEV__ 
     ? 'http://localhost:8000' 
     : 'https://tu-backend.railway.app';
   ```

### Opción 2: **APK de Prueba (Android)**

1. Genera un APK de desarrollo:
   ```bash
   cd frontend/android
   ./gradlew assembleDebug
   ```

2. El APK estará en: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

3. Comparte este APK para pruebas

---

## 📝 Checklist de Despliegue

- [ ] Backend desplegado en Railway/Render
- [ ] Base de datos PostgreSQL configurada
- [ ] Redis configurado (opcional pero recomendado)
- [ ] Variables de entorno configuradas
- [ ] Migraciones ejecutadas (`python manage.py migrate`)
- [ ] URL del backend actualizada en el frontend
- [ ] CORS configurado para permitir tu dominio
- [ ] Secret Key generada y segura
- [ ] DEBUG=False en producción

---

## 🔗 URLs Importantes

Después del despliegue, tendrás:

- **Backend API:** `https://tu-proyecto.railway.app/api/`
- **Admin Django:** `https://tu-proyecto.railway.app/admin/`
- **Swagger Docs:** `https://tu-proyecto.railway.app/swagger/`

---

## 🐛 Solución de Problemas

### Error: "No module named 'gunicorn'"
**Solución:** Agrega `gunicorn==21.2.0` a `requirements.txt`

### Error: "Database connection failed"
**Solución:** 
- Verifica que las variables de entorno de la base de datos estén correctas
- Tu proyecto usa `python-decouple` que lee variables de entorno directamente
- Asegúrate de que todas las variables estén escritas exactamente como se muestran arriba (DB_NAME, DB_USER, etc.)
- En Railway, verifica que las referencias `${{Postgres.VARIABLE}}` funcionen, o usa los valores directos

### Error: "ALLOWED_HOSTS"
**Solución:** Agrega tu dominio a `ALLOWED_HOSTS` o usa `ALLOWED_HOSTS=*` para desarrollo

### El servicio se "duerme" (Render)
**Solución:** Usa Railway o configura un servicio de "ping" para mantenerlo activo

### Error: "Script start.sh not found" o "Railpack could not determine how to build"
**Solución:** 
- Asegúrate de que los archivos `nixpacks.toml`, `start.sh` y `Procfile` estén en la raíz del repositorio
- Si el error persiste, en Railway ve a "Settings" → "Build" y cambia el builder a "Dockerfile"
- O configura manualmente el "Start Command" en "Settings" → "Deploy"

---

## 💡 Consejos

1. **Usa Railway para desarrollo/pruebas** - Es más estable y fácil
2. **Guarda tus variables de entorno** - Útiles para futuros despliegues
3. **Monitorea el uso** - Railway te muestra cuánto crédito usas
4. **Usa .env.local** - Para desarrollo local, nunca subas `.env` a Git
5. **Haz backups** - Exporta tu base de datos periódicamente

---

## 📚 Recursos

- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Expo Docs](https://docs.expo.dev)
- [Django Deployment](https://docs.djangoproject.com/en/4.2/howto/deployment/)

---

¿Necesitas ayuda? Revisa los logs en Railway/Render para ver errores específicos.
