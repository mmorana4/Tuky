#!/bin/bash
set -e

# Cambiar al directorio del proyecto Django
cd backend/core-service-ms

# Ejecutar migraciones
echo "Ejecutando migraciones..."
python manage.py migrate --noinput

# Recolectar archivos estáticos
echo "Recolectando archivos estáticos..."
python manage.py collectstatic --noinput || true

# Iniciar el servidor con Gunicorn
echo "Iniciando servidor Gunicorn..."
exec gunicorn server.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120
