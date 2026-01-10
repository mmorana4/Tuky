import os
from pathlib import Path
from datetime import datetime, timedelta
from core.my_base import (MY_EMAIL_DOMAIN, MY_EMAIL_HOST, MY_EMAIL_HOST_USER, MY_EMAIL_PORT, MY_EMAIL_USE_TLS, \
                          MY_EMAIL_HOST_PASSWORD, MY_EMAIL_ACTIVE, MY_INSTALLED_APPS, MY_MIDDLEWARE, MY_REST_FRAMEWORK,
                          MY_SIMPLE_JWT, MY_SECRET_KEY, MY_MANAGERS, MY_DEBUG, MY_ALLOWED_HOSTS, MY_DB_HOST,
                          MY_DB_PASSWORD, MY_DB_PORT, MY_DB_NAME, MY_DB_USER, MY_SERVER_RESPONSE,
                          MY_GOOGLE_OAUTH2_CONFIG, MY_OAUTH2_PROVIDER, MY_REDIS_CACHE_CONFIG)
import django

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE_ROOT = os.path.dirname(os.path.realpath("settings.py"))
DJANGO_ROOT = os.path.dirname(os.path.realpath(django.__file__))

SECRET_KEY = MY_SECRET_KEY

DEBUG = MY_DEBUG

ALLOWED_HOSTS = MY_ALLOWED_HOSTS

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    # 'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.postgres',
    'django.contrib.humanize',
    *MY_INSTALLED_APPS
]

MIDDLEWARE = MY_MIDDLEWARE

ROOT_URLCONF = 'server.urls'

REST_FRAMEWORK = MY_REST_FRAMEWORK

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(SITE_ROOT, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'debug': DEBUG,
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

DB_DEFAULTS_ENABLE_ALL_MODELS = True

WSGI_APPLICATION = 'server.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': MY_DB_NAME,
        'HOST': MY_DB_HOST,
        'USER': MY_DB_USER,
        'PASSWORD': MY_DB_PASSWORD,
        'PORT': MY_DB_PORT,
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-EC'

TIME_ZONE = 'America/Guayaquil'

USE_I18N = True

USE_L10N = True

USE_TZ = False

DECIMAL_SEPARATOR = '.'

# Archivos subidos por los usuarios
MEDIA_URL = '/media/security/'
MEDIA_ROOT = os.path.join(SITE_ROOT, 'media')

SITE_STORAGE = BASE_DIR

SUMMERNOTE_CONFIG = {}

# Carpeta donde Django almacenará los archivos recolectados con collectstatic
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# URL base para archivos estáticos
STATIC_URL = '/static/security/'

# Prefijo para los assets del admin
ADMIN_MEDIA_PREFIX = '/static/admin/'

# Carpeta donde tú mantienes los archivos estáticos del proyecto
STATICFILES_DIRS = (
    os.path.join(SITE_ROOT, 'static'),
)

DEFAULT_AUTO_FIELD = 'django.db.models.AutoField'

CACHES = {
    'default': MY_REDIS_CACHE_CONFIG
}

USER_AGENTS_CACHE = 'default'

SERVER_RESPONSE = MY_SERVER_RESPONSE

SESSION_ENGINE = "django.contrib.sessions.backends.cache"
TEST_RUNNER = 'django.test.runner.DiscoverRunner'  # If you wish to delay updates to your test suite
SESSION_SERIALIZER = 'django.contrib.sessions.serializers.PickleSerializer'

# CORS: En producción (Railway) permitir todos los orígenes, en desarrollo solo localhost
CORS_ALLOW_ALL_ORIGINS = not DEBUG if DEBUG is not None else True  # Permitir todos si DEBUG=False (producción)
CORS_ALLOW_CREDENTIALS = True

# Si DEBUG está activo, solo permitir localhost; si no, permitir todos
if DEBUG:
    CORS_ALLOWED_ORIGINS = [
        'http://127.0.0.1:8000',
        'http://localhost:8000',
        'http://192.168.1.101:8000',
    ]
    CORS_ORIGIN_WHITELIST = [
        'http://127.0.0.1:8000',
        'http://localhost:8000',
        'http://192.168.1.101:8000',
    ]
    CSRF_TRUSTED_ORIGINS = [
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'http://192.168.1.101:8000',
    ]
else:
    # En producción, permitir todos los orígenes (Railway)
    CORS_ALLOWED_ORIGINS = ['*']  # Se ignora si CORS_ALLOW_ALL_ORIGINS=True
    CORS_ORIGIN_WHITELIST = []
    CSRF_TRUSTED_ORIGINS = ['*']  # Django no acepta '*', pero se manejará dinámicamente

# Permitir IPs locales de la red (192.168.x.x) y dominios de Railway
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^http://127\.0\.0\.1(:\d+)?$',
    r'^http://localhost(:\d+)?$',
    r'^http://192\.168\.\d+\.\d+(:\d+)?$',
    r'^http://10\.0\.2\.2(:\d+)?$',  # Emulador Android
    r'^https?://.*\.railway\.app$',  # Dominios de Railway
    r'^https?://.*\.up\.railway\.app$',  # Dominios de Railway (formato alternativo)
]

CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

SIMPLE_JWT = MY_SIMPLE_JWT

LOGIN_URL = '/api/'
# Configuración de URLs para redirección después de login
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/'

# Google OAuth2 Configuration
GOOGLE_OAUTH2_CONFIG = MY_GOOGLE_OAUTH2_CONFIG

# Para que mi sistema sirva como un servicio oAuth2
# OAUTH2_PROVIDER = MY_OAUTH2_PROVIDER

# Carpeta temporal (ya la tienes definida)
TMP_ROOT = os.path.join(SITE_ROOT, 'tmp')
TMP_URL = 'tmp'

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# In-memory backend (locmem)
# EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
# Dummy backend (---)
# EMAIL_BACKEND = 'django.core.mail.backends.dummy.EmailBackend'
EMAIL_ACTIVE = MY_EMAIL_ACTIVE
EMAIL_HOST = MY_EMAIL_HOST
EMAIL_PORT = MY_EMAIL_PORT
EMAIL_HOST_USER = MY_EMAIL_HOST_USER
EMAIL_HOST_PASSWORD = MY_EMAIL_HOST_PASSWORD
EMAIL_USE_TLS = MY_EMAIL_USE_TLS
EMAIL_DOMAIN = MY_EMAIL_DOMAIN

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
)

MANAGERS = MY_MANAGERS

AUTH_USER_MODEL = 'security.User'
