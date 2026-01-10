#!/bin/bash
set -e

# Detectar si estamos en Docker (código en /app) o Nixpacks (código en raíz)
if [ -f "/app/manage.py" ]; then
    # Estamos en Docker, el código ya está en /app
    cd /app
elif [ -f "backend/core-service-ms/manage.py" ]; then
    # Estamos en Nixpacks, necesitamos cambiar al directorio
    cd backend/core-service-ms
elif [ -f "manage.py" ]; then
    # Ya estamos en el directorio correcto
    echo "Ya en directorio correcto"
else
    echo "Error: No se encontró manage.py"
    exit 1
fi

# Ejecutar migraciones
echo "Ejecutando migraciones..."
python manage.py migrate --noinput

# Recolectar archivos estáticos
echo "Recolectando archivos estáticos..."
python manage.py collectstatic --noinput || true

# Iniciar el servidor con Gunicorn
echo "Iniciando servidor Gunicorn..."
exec gunicorn server.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120
