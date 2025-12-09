from .controllers.auth_controller import SignInController, SignOutController, RefreshTokenController
from .controllers.oauth_controller import GoogleOAuthController
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from security.models import User, Profile, Company


# Las views ahora son simples wrappers de los controllers
class SignInView(SignInController):
    """View para login - delega toda la lógica al controller"""
    pass


class SignOutView(SignOutController):
    """View para logout - delega toda la lógica al controller"""
    pass


class RegisterView(APIView):
    """View para registro de usuarios"""
    permission_classes = []  # Permitir acceso sin autenticación
    
    def post(self, request):
        try:
            data = request.data
            
            # Validar campos requeridos
            required_fields = ['username', 'password', 'email', 'first_name', 'last_name']
            for field in required_fields:
                if not data.get(field):
                    return Response({
                        'is_success': False,
                        'message': f'El campo {field} es requerido'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verificar si el usuario ya existe
            if User.objects.filter(username=data['username']).exists():
                return Response({
                    'is_success': False,
                    'message': 'El nombre de usuario ya existe'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=data['email']).exists():
                return Response({
                    'is_success': False,
                    'message': 'El email ya está registrado'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Crear usuario con todos los campos requeridos
            from django.contrib.auth.hashers import make_password
            import random
            
            # Generar documento único si no se proporciona
            document = data.get('document')
            if not document or document == '0000000000':
                # Generar documento único basado en timestamp
                import time
                document = str(int(time.time()))[-10:]
            
            # Crear usuario
            user = User.objects.create(
                username=data['username'],
                email=data['email'],
                password=make_password(data['password']),  # Hash la contraseña
                first_name=data['first_name'],
                last_name=data['last_name'],
                document=document,
                type_document=1,
                is_active=True,
                is_staff=False,
                is_superuser=False
            )
            
            # Obtener company, branch y role necesarios para Profile
            company = Company.objects.filter(is_active=True).first()
            
            from security.models import CompanyBranch, Role
            
            # Obtener o crear branch principal
            branch = CompanyBranch.objects.filter(company=company, is_main=True, is_active=True).first()
            if not branch:
                branch = CompanyBranch.objects.filter(company=company, is_active=True).first()
            
            # Obtener role de usuario estándar (no admin)
            role = Role.objects.filter(code='USER', is_active=True).first()
            if not role:
                # Si no existe role USER, usar el primero disponible
                role = Role.objects.filter(is_active=True).first()
            
            # Crear perfil con todos los campos requeridos
            Profile.objects.create(
                user=user,
                role=role,
                branch=branch,
                is_current=True,
            )
            
            return Response({
                'is_success': True,
                'message': 'Usuario registrado exitosamente'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'is_success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TokenRefreshView(RefreshTokenController):
    """View para refresh token - delega toda la lógica al controller"""
    pass


class GoogleOAuthView(GoogleOAuthController):
    """View para inicio de OAuth2"""
    pass


class GoogleOAuthCallbackView(GoogleOAuthController):
    """View para callback de OAuth2"""

    def get(self, request):
        return self.get_callback(request)
