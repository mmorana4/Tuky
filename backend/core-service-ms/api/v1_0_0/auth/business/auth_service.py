from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from helpers.response_helper import HelperResponse


User = get_user_model()

class AuthService:

    def authenticate(self, username_field, password, request=None):
        """Autenticación JWT tradicional con username/email"""
        from ..serializers import SignInSerializer
        response = HelperResponse()
        try:
            # Si el input parece email -> obtener el username real
            user = User.objects.filter(Q(username=username_field) | Q(email=username_field)).first()
            if not user:
                raise Exception("Usuario no encontrado")

            data = {
                SignInSerializer.username_field: user.username,
                "password": password,
            }
            serializer = SignInSerializer(data=data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            response.set_success(is_success=True)
            response.set_message('Login exitoso')
            response.set_data(data=serializer.validated_data)
            response.set_status(code=status.HTTP_200_OK)
        except Exception as e:
            response.set_success(is_success=False)
            response.set_message(message=str(e))
            response.set_status(code=status.HTTP_401_UNAUTHORIZED)
        return response.to_dict()

    def refresh_token(self, refresh_token):
        """Refrescar token JWT"""
        from ..serializers import MyTokenRefreshSerializer
        response = HelperResponse()
        try:
            serializer = MyTokenRefreshSerializer(data={'refresh': refresh_token})
            serializer.is_valid(raise_exception=True)
            response.set_success(is_success=True)
            response.set_data(data=serializer.validated_data)
            response.set_status(code=status.HTTP_200_OK)
        except Exception as e:
            response.set_success(is_success=False)
            response.set_message(message=str(e))
            response.set_status(code=status.HTTP_401_UNAUTHORIZED)
        return response.to_dict()

    def logout(self, refresh_token, user):
        """Cerrar sesión"""
        from rest_framework_simplejwt.tokens import RefreshToken
        response = HelperResponse()
        try:

            token = RefreshToken(refresh_token)
            token.blacklist()
            response.set_success(is_success=True)
            response.set_message(message="Sesión cerrada exitosamente")
            response.set_status(code=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            response.set_success(is_success=False)
            response.set_message(message=str(e))
            response.set_status(code=status.HTTP_400_BAD_REQUEST)
        return response.to_dict()
