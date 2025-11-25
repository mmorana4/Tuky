import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from .auth_service import AuthService
from helpers.response_helper import HelperResponse

User = get_user_model()


class GoogleOAuthService:
    def __init__(self):
        self.config = getattr(settings, 'GOOGLE_OAUTH2_CONFIG', {})
        self.auth_service = AuthService()

    def get_authorization_url(self):
        """Genera URL de autorización de Google"""
        from urllib.parse import urlencode
        params = {
            'client_id': self.config.get('CLIENT_ID'),
            'redirect_uri': self.config.get('REDIRECT_URI'),
            'scope': ' '.join(self.config.get('SCOPE', [])),
            'response_type': 'code',
            'access_type': 'offline',
            'prompt': 'consent'
        }
        return f"{self.config.get('AUTHORIZATION_URL')}?{urlencode(params)}"

    def exchange_code_for_token(self, code):
        """Intercambia código de autorización por tokens"""
        try:
            data = {
                'client_id': self.config.get('CLIENT_ID'),
                'client_secret': self.config.get('CLIENT_SECRET'),
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': self.config.get('REDIRECT_URI')
            }

            response = requests.post(self.config.get('TOKEN_URL'), data=data)
            response.raise_for_status()
            token_data = response.json()

            return self._get_user_info_and_tokens(token_data)

        except requests.RequestException as e:
            response = HelperResponse()
            response.set_success(is_success=False)
            response.set_message(message=f"Error en autenticación OAuth2: {str(e)}")
            response.set_status(code=status.HTTP_400_BAD_REQUEST)
            return response.to_dict()

    def _get_user_info_and_tokens(self, token_data):
        """Obtiene información del usuario y genera tokens JWT"""
        from rest_framework_simplejwt.tokens import RefreshToken
        response = HelperResponse()
        try:
            # Obtener información del usuario de Google
            headers = {'Authorization': f"Bearer {token_data['access_token']}"}
            response = requests.get(self.config.get('USER_INFO_URL'), headers=headers)
            response.raise_for_status()
            user_info = response.json()

            # Buscar o crear usuario
            user, created = self._get_or_create_user(user_info)

            if not user.is_active:
                response.set_success(is_success=False)
                response.set_message(message=f"Usuario inactivo")
                response.set_status(code=status.HTTP_401_UNAUTHORIZED)
                return response.to_dict()

            # Generar tokens JWT (usamos JWT incluso con OAuth2 para consistencia)
            refresh = RefreshToken.for_user(user)
            tokens = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': user.to_dict(exclude_audit=True) if hasattr(user, 'to_dict') else {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            }

            # Combinar con tokens de OAuth2 si es necesario
            tokens.update({
                'oauth2_tokens': {
                    'access_token': token_data.get('access_token'),
                    'refresh_token': token_data.get('refresh_token'),
                    'expires_in': token_data.get('expires_in')
                }
            })

            response.set_success(is_success=True)
            response.set_data({'token': tokens})
            response.set_message(message="Usuario creado" if created else "Login exitoso")
            response.set_status(code=status.HTTP_200_OK)


        except Exception as e:
            response.set_success(is_success=False)
            response.set_message(message=str(e))
            response.set_status(code=status.HTTP_400_BAD_REQUEST)
        return response.to_dict()

    def _get_or_create_user(self, user_info):
        """Obtiene o crea un usuario basado en la información de Google"""
        email = user_info.get('email')
        defaults = {
            'first_name': user_info.get('given_name', ''),
            'last_name': user_info.get('family_name', ''),
            'is_active': True
        }

        user, created = User.objects.get_or_create(
            email=email,
            defaults=defaults
        )

        if not created:
            # Actualizar información del usuario si ya existe
            for key, value in defaults.items():
                setattr(user, key, value)
            user.save()

        return user, created
