import requests
from django.conf import settings
from functools import wraps
from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import Token
from security.models import CompanyBranch, Role
import jwt
from django.contrib.auth.models import User

class CoreServiceClient:
    @staticmethod
    def get_or_create_user(user_data):
        """Get or create a local user based on core service data"""
        username = user_data.get('username')
        if not username:
            return None
            
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': user_data.get('email', ''),
                'first_name': user_data.get('first_name', ''),
                'last_name': user_data.get('last_name', '')
            }
        )
        return user

    @staticmethod
    def sync_branch_data(branch_id):
        """Sync branch data from core service"""
        try:
            response = requests.get(
                f"{settings.CORE_SERVICE_URL}/api/v1.0.0/security/branch/{branch_id}/",
                headers={'Authorization': f'Bearer {settings.CORE_SERVICE_TOKEN}'}
            )
            if response.status_code == 200:
                data = response.json()
                branch, _ = CompanyBranch.objects.update_or_create(
                    id=branch_id,
                    defaults={'name': data.get('name')}
                )
                return branch
        except Exception:
            pass
        return None

    @staticmethod
    def sync_role_data(role_id):
        """Sync role data from core service"""
        try:
            response = requests.get(
                f"{settings.CORE_SERVICE_URL}/api/v1.0.0/security/role/{role_id}/",
                headers={'Authorization': f'Bearer {settings.CORE_SERVICE_TOKEN}'}
            )
            if response.status_code == 200:
                data = response.json()
                role, _ = Role.objects.update_or_create(
                    id=role_id,
                    defaults={'name': data.get('name')}
                )
                return role
        except Exception:
            pass
        return None

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return None

            token = auth_header.split(' ')[1]
            
            # Validate token with core service
            response = requests.post(
                f"{settings.CORE_SERVICE_URL}/api/v1.0.0/session/validate/",
                headers={'Authorization': f'Bearer {token}'}
            )
            
            if response.status_code != 200:
                return None

            # Decode token to get claims
            token_data = jwt.decode(token, options={"verify_signature": False})
            user_data = response.json().get('data', {})
            
            # Get or create local user
            user = CoreServiceClient.get_or_create_user(user_data)
            if not user:
                return None

            # Set branch and role information
            request.branch = None
            request.role = None
            
            branch_id = token_data.get('branch_id')
            role_id = token_data.get('role_id')

            if branch_id:
                request.branch = CompanyBranch.objects.filter(id=branch_id).first()
                if not request.branch:
                    request.branch = CoreServiceClient.sync_branch_data(branch_id)

            if role_id:
                request.role = Role.objects.filter(id=role_id).first()
                if not request.role:
                    request.role = CoreServiceClient.sync_role_data(role_id)

            return (user, token_data)
            
        except Exception as e:
            return None

def jwt_required(view_func):
    """Decorator to use CustomJWTAuthentication"""
    @wraps(view_func)
    def wrapped_view(request, *args, **kwargs):
        auth = CustomJWTAuthentication()
        result = auth.authenticate(request)
        
        if not result:
            return JsonResponse({'error': 'Authentication failed'}, status=401)
        
        user, token = result
        request.user = user
        request.token = token
        return view_func(request, *args, **kwargs)
    
    return wrapped_view