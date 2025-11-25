from rest_framework_simplejwt.authentication import JWTAuthentication
from security.models import CompanyBranch, Role
from helpers.session_cache_helper import HelperSessionCache


class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        result = super(CustomJWTAuthentication, self).authenticate(request)
        if not result:
            return None

        user, token = result

        # Get session data from cache
        session_data = HelperSessionCache.get_session(token.get('jti'))

        if not session_data:
            # Create new session if it doesn't exist
            self._set_request_attributes_from_token(request, token)
            HelperSessionCache.create_session(user, token)
            # Obtener los datos de sesión recién creados
            session_data = HelperSessionCache.get_session(token.get('jti'))
        else:
            # Check if cached data needs to be updated
            if self._session_needs_update(session_data, token):
                # Update session with new token data
                HelperSessionCache.delete_session(token.get('jti'))
                self._set_request_attributes_from_token(request, token)
                HelperSessionCache.create_session(user, token)
                # Obtener los datos de sesión actualizados
                session_data = HelperSessionCache.get_session(token.get('jti'))
            else:
                # Use cached session data
                self._set_request_attributes_from_session(request, session_data)

            # Extend session timeout
            HelperSessionCache.extend_session(token.get('jti'))

        request.user = user
        request.session_data = session_data or {}

        return (user, token)

    def _set_request_attributes_from_token(self, request, token):
        """Set request attributes from token data"""
        branch_id = token.get("branch_id")
        role_id = token.get("role_id")

        request.branch = CompanyBranch.objects.filter(id=branch_id).first() if branch_id else None
        request.role = Role.objects.filter(id=role_id).first() if role_id else None

    def _set_request_attributes_from_session(self, request, session_data):
        """Set request attributes from session data"""
        branch_data = session_data.get('branch')
        role_data = session_data.get('role')

        request.branch = CompanyBranch.objects.filter(id=branch_data.get('id')).first() if branch_data else None
        request.role = Role.objects.filter(id=role_data.get('id')).first() if role_data else None

    def _session_needs_update(self, session_data, token):
        """Check if session data needs to be updated based on token"""
        # Compare critical fields that might change
        cached_branch_id = session_data.get('branch', {}).get('id') if session_data.get('branch') else None
        cached_role_id = session_data.get('role', {}).get('id') if session_data.get('role') else None

        token_branch_id = token.get('branch_id')
        token_role_id = token.get('role_id')

        # Debug logging (puedes remover esto después)
        print(f"Cache - Branch: {cached_branch_id}, Role: {cached_role_id}")
        print(f"Token - Branch: {token_branch_id}, Role: {token_role_id}")
        print(f"Needs update: {cached_branch_id != token_branch_id or cached_role_id != token_role_id}")

        # Check if any critical field has changed
        return (cached_branch_id != token_branch_id or
                cached_role_id != token_role_id)

    def authenticate_header(self, request):
        return super().authenticate_header(request)