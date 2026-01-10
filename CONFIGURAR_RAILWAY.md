# 🔧 Guía Rápida: Configurar Variables de Entorno en Railway

## ❌ NO hagas esto:
- ❌ NO pongas las claves directamente en el código
- ❌ NO modifiques los archivos `.py` con valores de producción
- ❌ NO subas las claves al repositorio

## ✅ SÍ haz esto:
Configura las variables de entorno en Railway (en la interfaz web)

---

## 📋 Pasos Detallados:

### Paso 1: Obtener los Valores de las Variables Existentes

1. **En Railway, en la pestaña "Variables"** (donde estás ahora)
2. **Haz clic en el ícono del ojo 👁️** para ver cada valor (o cópialos con el ícono de copiar 📋)
3. **Anota estos valores:**
   - `POSTGRES_DB` → Lo usarás para crear `DB_NAME`
   - `POSTGRES_USER` → Lo usarás para crear `DB_USER`
   - `POSTGRES_PASSWORD` → Lo usarás para crear `DB_PASSWORD`
   - `PGHOST` → Lo usarás para crear `DB_HOST`
   - `PGPORT` → Lo usarás para crear `DB_PORT`

### Paso 2: Crear las Variables que el Código Espera

**⚠️ IMPORTANTE:** El código busca variables con nombres específicos (`DB_NAME`, `DB_USER`, etc.), pero Railway tiene nombres diferentes (`POSTGRES_DB`, `POSTGRES_USER`, etc.). Necesitas crear nuevas variables con los nombres correctos.

1. **En la misma pantalla de Variables** (donde estás ahora)
2. **Haz clic en "New Variable"** o el botón "+" para agregar variables
3. **Crea estas nuevas variables usando los valores que ya tienes:**

   **Variable 1:**
   ```
   Nombre: DB_NAME
   Valor: [Copia el valor de POSTGRES_DB - haz clic en el ojo 👁️ para verlo]
   ```

   **Variable 2:**
   ```
   Nombre: DB_USER
   Valor: [Copia el valor de POSTGRES_USER]
   ```

   **Variable 3:**
   ```
   Nombre: DB_PASSWORD
   Valor: [Copia el valor de POSTGRES_PASSWORD]
   ```

   **Variable 4:**
   ```
   Nombre: DB_HOST
   Valor: [Copia el valor de PGHOST]
   ```

   **Variable 5:**
   ```
   Nombre: DB_PORT
   Valor: [Copia el valor de PGPORT]
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

### Paso 4: Variables de Redis

Veo que ya tienes variables de Redis. Necesitas crear las que el código espera:

**Variable 1:**
```
Nombre: REDIS_HOST
Valor: [Copia el valor de REDISHOST - haz clic en el ojo 👁️ para verlo]
```

**Variable 2:**
```
Nombre: REDIS_PORT
Valor: [Copia el valor de REDISPORT]
```

**Variable 3:**
```
Nombre: REDIS_DB
Valor: [Ya tienes REDIS_DB, pero verifica que el valor sea 0]
```

**Variable 4 (si aplica):**
```
Nombre: REDIS_PASSWORD
Valor: [Copia el valor de REDIS_PASSWORD si existe]
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
