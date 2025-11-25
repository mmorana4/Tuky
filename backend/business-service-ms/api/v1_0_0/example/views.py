from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.session_cache import SessionCache
from rest_framework_simplejwt.authentication import JWTAuthentication

class ExampleProtectedView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Obtener el token JWT del request
        auth = JWTAuthentication()
        validated_token = auth.get_validated_token(auth.get_raw_token(request))
        
        # Obtener datos de la sesión desde Redis
        session_data = SessionCache.get_session(validated_token.get('jti'))
        
        response_data = {
            'message': 'This is a protected endpoint',
            'user': {
                'username': request.user.username,
                'email': request.user.email
            }
        }
        
        if session_data:
            # Datos del usuario desde la sesión
            user_data = session_data.get('user', {})
            response_data['session_user'] = user_data
            
            # Datos de la sucursal desde la sesión
            branch_data = None
            if request.branch:
                branch_data = {
                    'id': str(request.branch.id),
                    'name': request.branch.name
                }
            response_data['branch'] = branch_data
            
            # Datos del rol desde la sesión
            role_data = None
            if request.role:
                role_data = {
                    'id': str(request.role.id),
                    'name': request.role.name
                }
            response_data['role'] = role_data
            
            # Permisos desde la sesión
            response_data['permissions'] = session_data.get('permissions', [])
            
            # Datos adicionales que podrían estar en la sesión
            response_data['additional_data'] = {
                key: value 
                for key, value in session_data.items() 
                if key not in ['user', 'branch_id', 'role_id', 'permissions', 'token']
            }
        
        return Response(response_data)