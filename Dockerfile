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

# Copiar requirements y instalar dependencias Python
COPY backend/core-service-ms/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el proyecto
COPY backend/core-service-ms /app

# Recolectar archivos estáticos
RUN python manage.py collectstatic --noinput || true

# Exponer puerto
EXPOSE $PORT

# Script de inicio (ya no necesita cd porque estamos en /app)
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Comando por defecto - usar bash explícitamente
CMD ["bash", "/app/start.sh"]
