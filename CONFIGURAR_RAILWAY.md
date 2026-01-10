# 🔧 Guía Rápida: Configurar Variables de Entorno en Railway

## ❌ NO hagas esto:
- ❌ NO pongas las claves directamente en el código
- ❌ NO modifiques los archivos `.py` con valores de producción
- ❌ NO subas las claves al repositorio

## ✅ SÍ haz esto:
Configura las variables de entorno en Railway (en la interfaz web)

---

## 📋 Pasos Detallados:

### Paso 1: Obtener las Variables de PostgreSQL

1. **Ve a Railway** → Tu proyecto → Servicio PostgreSQL
2. **Haz clic en la pestaña "Variables"** (o "Variables" en el menú lateral)
3. **Copia estas variables:**
   - `PGDATABASE` → Lo usarás como `DB_NAME`
   - `PGUSER` → Lo usarás como `DB_USER`
   - `PGPASSWORD` → Lo usarás como `DB_PASSWORD`
   - `PGHOST` → Lo usarás como `DB_HOST`
   - `PGPORT` → Lo usarás como `DB_PORT`

### Paso 2: Configurar Variables en el Servicio Django

1. **Ve a tu servicio Django** (el que ejecuta tu aplicación)
2. **Haz clic en "Variables"** (en el menú lateral o en la parte superior)
3. **Haz clic en "New Variable"** o el botón "+" para agregar variables
4. **Agrega cada variable una por una:**

   ```
   Variable: DB_NAME
   Valor: [pega el valor de PGDATABASE]
   ```

   ```
   Variable: DB_USER
   Valor: [pega el valor de PGUSER]
   ```

   ```
   Variable: DB_PASSWORD
   Valor: [pega el valor de PGPASSWORD]
   ```

   ```
   Variable: DB_HOST
   Valor: [pega el valor de PGHOST]
   ```

   ```
   Variable: DB_PORT
   Valor: [pega el valor de PGPORT]
   ```

### Paso 3: Agregar las Otras Variables Necesarias

También agrega estas variables:

```
Variable: DEBUG
Valor: False
```

```
Variable: SECRET_KEY
Valor: [genera uno con: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"]
```

```
Variable: ALLOWED_HOSTS
Valor: *
```

### Paso 4: Variables de Redis (si tienes Redis)

Si tienes un servicio Redis, obtén sus variables y agrega:

```
Variable: REDIS_HOST
Valor: [valor de tu Redis]
```

```
Variable: REDIS_PORT
Valor: [valor de tu Redis, normalmente 6379]
```

```
Variable: REDIS_DB
Valor: 0
```

---

## 🎯 Método Alternativo: Referencias Automáticas

Railway puede generar referencias automáticas. Si ves opciones como:

- `${{Postgres.DATABASE}}`
- `${{Postgres.USER}}`
- etc.

Puedes usar estas en lugar de copiar valores manualmente. Son más seguras porque se actualizan automáticamente.

---

## ✅ Verificación

Después de configurar las variables:

1. **Haz un nuevo deploy** (Railway lo hará automáticamente o haz clic en "Redeploy")
2. **Revisa los logs** para verificar que se conecta correctamente
3. **Si ves errores de conexión**, verifica que las variables estén escritas exactamente como se muestra arriba (DB_NAME, DB_USER, etc.)

---

## 🔍 Cómo Verificar que las Variables Están Configuradas

1. Ve a tu servicio Django → Variables
2. Deberías ver todas las variables listadas:
   - ✅ DB_NAME
   - ✅ DB_USER
   - ✅ DB_PASSWORD
   - ✅ DB_HOST
   - ✅ DB_PORT
   - ✅ SECRET_KEY
   - ✅ DEBUG
   - ✅ ALLOWED_HOSTS

---

## ⚠️ Importante

- Las variables de entorno se configuran **SOLO en Railway**, no en el código
- El código lee estas variables automáticamente usando `python-decouple`
- Si no configuras las variables, el código usará los valores por defecto (localhost, etc.) que NO funcionarán en Railway

---

## 🆘 Si Sigue Usando Valores Locales

Si después de configurar las variables sigue usando valores locales:

1. Verifica que las variables estén escritas **exactamente** como se muestra (DB_NAME, no db_name)
2. Asegúrate de que estás agregando las variables en el **servicio correcto** (Django, no PostgreSQL)
3. Haz un **nuevo deploy** después de agregar las variables
4. Revisa los logs para ver qué valores está usando
