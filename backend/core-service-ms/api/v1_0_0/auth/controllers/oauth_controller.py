from rest_framework.views import APIView
from django.shortcuts import redirect
from rest_framework import status
from ..business.oauth_service import GoogleOAuthService
from helpers.response_helper import HelperResponse


class GoogleOAuthController(APIView):

    def get(self, request):
        """Inicia el flujo OAuth2 redirigiendo a Google"""
        oauth_service = GoogleOAuthService()
        auth_url = oauth_service.get_authorization_url()
        return redirect(auth_url)

    def get_callback(self, request):
        """Maneja el callback de Google OAuth2"""
        code = request.GET.get('code')
        error = request.GET.get('error')
        response = HelperResponse()
        if error:
            response.set_success(is_success=False)
            response.set_message(message=f'Error de autenticación: {error}')
            response.set_status(code=status.HTTP_400_BAD_REQUEST)
            return response.to_dict()

        if not code:
            response.set_success(is_success=False)
            response.set_message(message='Código de autorización no proporcionado')
            response.set_status(code=status.HTTP_400_BAD_REQUEST)
            return response.to_dict()
        oauth_service = GoogleOAuthService()
        return oauth_service.exchange_code_for_token(code)
