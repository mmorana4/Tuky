# Dockerfile alternativo para Railway (si Nixpacks no funciona)
FROM python:3.11-slim

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    postgresql-client \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements y instalar dependencias Python
COPY backend/core-service-ms/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el proyecto
COPY backend/core-service-ms /app

# Recolectar archivos estáticos
RUN python manage.py collectstatic --noinput || true

# Exponer puerto
EXPOSE $PORT

# Script de inicio
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Comando por defecto
CMD ["/app/start.sh"]
