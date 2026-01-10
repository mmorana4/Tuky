# Dockerfile alternativo para Railway (si Nixpacks no funciona)
FROM python:3.11-slim

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    postgresql-client \
    build-essential \
    libpq-dev \
    bash \
    && rm -rf /var/lib/apt/lists/*

# Establecer directorio de trabajo
WORKDIR /app

# Establecer PYTHONPATH para que Python encuentre los módulos
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Copiar requirements y instalar dependencias Python
COPY backend/core-service-ms/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el proyecto completo
COPY backend/core-service-ms /app

# Verificar que los archivos se copiaron correctamente
RUN echo "=== Verificando estructura del proyecto ===" && \
    ls -la /app && \
    echo "=== Verificando directorio server ===" && \
    ls -la /app/server && \
    echo "=== Verificando que settings.py existe ===" && \
    test -f /app/server/settings.py && echo "✓ settings.py encontrado" || (echo "✗ ERROR: settings.py NO encontrado" && exit 1) && \
    echo "=== Verificando que manage.py existe ===" && \
    test -f /app/manage.py && echo "✓ manage.py encontrado" || (echo "✗ ERROR: manage.py NO encontrado" && exit 1)

# Recolectar archivos estáticos (solo si el módulo server existe)
RUN python manage.py collectstatic --noinput || echo "Error en collectstatic, continuando..."

# Exponer puerto
EXPOSE $PORT

# Script de inicio
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Comando por defecto - usar bash explícitamente
CMD ["bash", "/app/start.sh"]
