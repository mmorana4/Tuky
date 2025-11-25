from rest_framework_simplejwt.views import TokenObtainPairView, TokenViewBase
from rest_framework.views import APIView
from helpers.response_helper import HelperResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from ..business.auth_service import AuthService


class SignInController(TokenObtainPairView):

    def __init__(self, **kwargs):
        super(SignInController, self).__init__(**kwargs)
        self.auth_service = AuthService()

    def post(self, request, **kwargs):
        username_field = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')

        if not username_field or not password:
            response = HelperResponse()
            response.set_success(is_success=False)
            response.set_status(code=status.HTTP_400_BAD_REQUEST)
            response.set_message(message='Username or email and password are required')
            response.set_status(status.HTTP_400_BAD_REQUEST)
            return response.to_dict()

        return self.auth_service.authenticate(username_field, password, request)


class SignOutController(APIView):
    permission_classes = (IsAuthenticated,)

    def __init__(self, **kwargs):
        super(SignOutController, self).__init__(**kwargs)
        self.auth_service = AuthService()

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            response = HelperResponse()
            response.set_success(is_success=False)
            response.set_message(message='Refresh token is required')
            response.set_status(code=status.HTTP_400_BAD_REQUEST)
            return response.to_dict()
        return self.auth_service.logout(refresh_token, request.user)


class RefreshTokenController(TokenViewBase):
    def __init__(self, **kwargs):
        super(RefreshTokenController, self).__init__(**kwargs)
        self.auth_service = AuthService()

    def post(self, request, **kwargs):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            response = HelperResponse()
            response.set_success(is_success=False)
            response.set_message(message='Refresh token is required')
            response.set_status(code=status.HTTP_400_BAD_REQUEST)
            return response.to_dict()
        return self.auth_service.refresh_token(refresh_token)
