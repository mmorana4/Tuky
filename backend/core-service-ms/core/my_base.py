import os
from datetime import datetime, timedelta
from decouple import config, Csv

MY_DEBUG = config('DEBUG', default=True, cast=bool)
# SECRET_KEY: Si no está definido, usar uno temporal (DEBE ser configurado en producción)
MY_SECRET_KEY = config('SECRET_KEY', default='django-insecure-temporary-key-change-in-production-2025', cast=str)

MY_DB_NAME = config('DB_NAME', default='tuky', cast=str)
MY_DB_USER = config('DB_USER', default='postgres', cast=str)
MY_DB_PASSWORD = config('DB_PASSWORD', default='postgres', cast=str)
MY_DB_HOST = config('DB_HOST', default='localhost', cast=str)
# DB_PORT: Manejar valores vacíos o nulos, y también valores string
DB_PORT_STR = config('DB_PORT', default='5432', cast=str)
MY_DB_PORT = int(DB_PORT_STR) if DB_PORT_STR and DB_PORT_STR.strip() else 5432
MY_REDIS_HOST = config('REDIS_HOST', default='127.0.0.1', cast=str)
# REDIS_PORT: Manejar valores vacíos o nulos
REDIS_PORT_STR = config('REDIS_PORT', default='6379', cast=str)
MY_REDIS_PORT = int(REDIS_PORT_STR) if REDIS_PORT_STR and REDIS_PORT_STR.strip() else 6379
# REDIS_DB: Manejar valores vacíos o nulos
REDIS_DB_STR = config('REDIS_DB', default='0', cast=str)
MY_REDIS_DB = int(REDIS_DB_STR) if REDIS_DB_STR and REDIS_DB_STR.strip() else 0
MY_REDIS_PASSWORD = config('REDIS_PASSWORD', default=None, cast=str)

# Redis Cache Configuration
MY_REDIS_CACHE_CONFIG = {
    "BACKEND": "django_redis.cache.RedisCache",
    "LOCATION": f"redis://{MY_REDIS_HOST}:{MY_REDIS_PORT}/{MY_REDIS_DB}",
    "OPTIONS": {
        "CLIENT_CLASS": "django_redis.client.DefaultClient",
        "PASSWORD": MY_REDIS_PASSWORD,
        "SOCKET_CONNECT_TIMEOUT": 5,
        "SOCKET_TIMEOUT": 5,
        "RETRY_ON_TIMEOUT": True,
        "MAX_CONNECTIONS": 1000,
        "CONNECTION_POOL_KWARGS": {"max_connections": 100},
    }
}

MY_IP_LOAD_BALANCED_INTERNAL = config('IP_LOAD_BALANCED_INTERNAL', default='127.0.0.1', cast=str)
COOKIE_SESSION_NAME = config('COOKIE_SESSION_NAME', default='123456', cast=str)
MY_ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='*', cast=Csv())
MY_TITLE_SYSTEM = 'core-service-ms'
MY_TITLE_SYSTEM_KEY = ''
MY_SERVER_RESPONSE = '211'

SESSION_ENGINE = "django.contrib.sessions.backends.cache"
TEST_RUNNER = 'django.test.runner.DiscoverRunner'  # If you wish to delay updates to your test suite
SESSION_SERIALIZER = 'django.contrib.sessions.serializers.PickleSerializer'

# CLAVE POR DEFECTO
DEFAULT_PASSWORD = '2025*2025'
# CEDULA COMO CLAVE DE USUARIO
PASSWORD_USER_DOCUMENT = True

VAR_API = {
    "api": f"API {MY_TITLE_SYSTEM}",
    "version": "1.0.0",
    "dependencies": {
    },
    "author": "--",
}

DATETIME_INPUT_FORMATS = ['%Y-%m-%d %H:%M:%S', '%d-%m-%Y %H:%M:%S']
DATETIME_FORMAT = '%Y-%m-%d %H:%M:%S'
DATE_INPUT_FORMATS = ['%Y-%m-%d', '%d-%m-%Y']
DATE_FORMAT = '%Y-%m-%d'
TIME_INPUT_FORMATS = ['%H:%M:%S', '%I:%M:%S']
TIME_FORMAT = '%H:%M:%S'

MY_EMAIL_HOST = 'smtp.sendgrid.net'
MY_EMAIL_HOST_USER = 'apikey'
MY_EMAIL_HOST_PASSWORD = 'xxxxx'
MY_EMAIL_PORT = 465
MY_EMAIL_ACTIVE = True
MY_EMAIL_USE_TLS = True
MY_EMAIL_DOMAIN = 'xxxxx.com'

FLAG_SUCCESSFUL = 1
FLAG_FAILED = 2
FLAG_UNKNOWN = 3

MY_INSTALLED_APPS = [
    # 'django_user_agents',
    # 'oauth2_provider',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_yasg',
    'security',
]

MY_MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

MY_REST_FRAMEWORK = {
    'DATETIME_INPUT_FORMATS': ['%Y-%m-%d %H:%M:%S', '%d-%m-%Y %H:%M:%S'],
    'DATETIME_FORMAT': '%Y-%m-%d %H:%M:%S',
    'DATE_INPUT_FORMATS': ['%Y-%m-%d', '%d-%m-%Y'],
    'DATE_FORMAT': '%Y-%m-%d',
    'TIME_INPUT_FORMATS': ['%H:%M:%S', '%I:%M:%S'],
    'TIME_FORMAT': '%H:%M:%S',
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ),
    'DEFAULT_METADATA_CLASS': (
        'rest_framework.metadata.SimpleMetadata'
    ),
    'DEFAULT_PARSER_CLASSES': (
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        # 'rest_framework_simplejwt.authentication.JWTAuthentication',  # Para JWT
        'core.my_authentication.CustomJWTAuthentication', # Para controlar el request (Session)
        # 'oauth2_provider.contrib.rest_framework.OAuth2Authentication',  # Para OAuth2
        'rest_framework.authentication.SessionAuthentication',  # Para admin y debug
        # 'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
        # 'rest_framework.authentication.TokenAuthentication',
        # 'rest_framework.authentication.BasicAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 25
}

MY_SIMPLE_JWT = {
    # Tokens principales
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,

    # Algoritmo y llaves
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': MY_SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,
    # Cabeceras
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',

    # Claims (lo que va dentro del token)
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'TOKEN_TYPE_CLAIM': 'token_type',
    'JTI_CLAIM': 'jti',

    # Clases
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',

    # Sliding tokens (opcional, no lo necesitas si usas access/refresh normal)
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

# Configuración específica para Google OAuth2
MY_GOOGLE_OAUTH2_CONFIG = {
    'CLIENT_ID': 'tu-google-client-id.apps.googleusercontent.com',
    'CLIENT_SECRET': 'tu-google-client-secret',
    'REDIRECT_URI': 'http://localhost:8000/api/v1.0.0/auth/oauth2/google/callback',
    'SCOPE': [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'openid'
    ],
    'AUTHORIZATION_URL': 'https://accounts.google.com/o/oauth2/auth',
    'TOKEN_URL': 'https://oauth2.googleapis.com/token',
    'USER_INFO_URL': 'https://www.googleapis.com/oauth2/v1/userinfo',
}

"""
En Django, el paquete oauth2_provider generalmente se refiere a la app Django OAuth Toolkit (DOT)
.

Su función principal es permitir que tu proyecto Django actúe como un servidor OAuth2, es decir:

✅ Maneja el flujo de autorización OAuth2 (Authorization Code, Implicit, Password, Client Credentials).
✅ Genera y valida access tokens y refresh tokens.
✅ Te permite proteger tus endpoints de API con scopes y permisos basados en OAuth2.
✅ Es compatible con Django Rest Framework (DRF), por lo que se usa mucho para APIs seguras.
"""
MY_OAUTH2_PROVIDER = {
    # Tiempo de vida de los tokens de acceso (en segundos)
    'ACCESS_TOKEN_EXPIRE_SECONDS': 3600,  # 1 hora

    # Scopes disponibles
    'SCOPES': {
        'read': 'Permiso de lectura',
        'write': 'Permiso de escritura',
        'groups': 'Acceso a los grupos',
        'openid': 'Acceso al ID abierto',
        'profile': 'Acceso al perfil',
        'email': 'Acceso al email',
    },

    # Clase para generar client IDs
    'CLIENT_ID_GENERATOR_CLASS': 'oauth2_provider.generators.ClientIdGenerator',

    # Clase para generar client secrets
    'CLIENT_SECRET_GENERATOR_CLASS': 'oauth2_provider.generators.ClientSecretGenerator',

    # Configuración específica para OAuth2
    'PKCE_REQUIRED': False,  # Puedes activar PKCE para mayor seguridad

    # Configuración de aplicaciones
    'APPLICATION_MODEL': 'oauth2_provider.Application',

    # Configuración para flujo implícito (si lo necesitas)
    'ALLOWED_GRANT_TYPES': [
        'authorization_code',
        'password',
        'client_credentials',
        'refresh_token',
    ],
}

# Configuración de URLs para redirección después de login
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/'

MY_MANAGERS = (
    ('admin', 'admin@soport.com'),
)

MY_SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'firebase': {
            'type': "oauth2",
            'authorizationUrl': "https://accounts.google.com/o/oauth2/auth",
            'flow': "implicit",
            'x-google-issuer': "https://www.googleapis.com/unemi-transformacion-digital",
            'x-google-jwks_uri': "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-1eh1w%40unemi-transformacion-digital.iam.gserviceaccount.com",
            'x-google-audiences': "ube-transformacion-digital",
        }
    }
}

MY_DECIMAL_PLACES = 4

MY_USER_SYSTEM_ID = 1
MY_CACHE_LIFETIME = 3600

MY_FIELDS_AUDIT = ['created_by', 'created_at', 'updated_by', 'updated_at', 'is_active']
MY_ADMIN_URL = 'console/'
