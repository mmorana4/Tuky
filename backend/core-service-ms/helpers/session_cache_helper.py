from django.conf import settings
from django.core.cache import cache
from datetime import timedelta
import json
import uuid


class HelperSessionCache:
    PREFIX = 'session:'
    TOKEN_PREFIX = 'token:'
    DEFAULT_TIMEOUT = 60 * 60 * 24  # 24 hours in seconds

    @classmethod
    def generate_session_id(cls):
        return str(uuid.uuid4())

    @classmethod
    def create_session(cls, user_data, token_data, timeout=None):
        """
        Create a new session in Redis cache
        """
        from security.models import CompanyBranch, Role

        session_id = cls.generate_session_id()
        session_key = f"{cls.PREFIX}{session_id}"
        token_key = f"{cls.TOKEN_PREFIX}{token_data.get('jti', session_id)}"

        timeout = timeout or cls.DEFAULT_TIMEOUT
        branch_id = token_data.get('branch_id')
        role_id = token_data.get('role_id')
        branch = None
        if branch_id:
            branch = CompanyBranch.objects.filter(id=branch_id).first()

        role = None
        if role_id:
            role = Role.objects.filter(id=role_id).first()

        session_data = {
            'user': {
                'id': str(user_data.id),
                'username': user_data.username,
                'email': user_data.email,
                'first_name': user_data.first_name,
                'last_name': user_data.last_name,
            },
            'branch': branch.to_dict() if branch else None,
            'role': role.to_dict() if role else None,
            'permissions': token_data.get('permissions', []),
            'token': token_data
        }

        # Store session data
        # cache.set(session_key, json.dumps(session_data), timeout)
        cache.set(session_key, session_data, timeout)
        # Store token to session mapping
        cache.set(token_key, session_id, timeout)

        return session_id

    @classmethod
    def get_session(cls, token_jti):
        """
        Get session data by token JTI
        """
        token_key = f"{cls.TOKEN_PREFIX}{token_jti}"
        session_id = cache.get(token_key)

        if not session_id:
            return None

        session_key = f"{cls.PREFIX}{session_id}"
        session_data = cache.get(session_key)

        if not session_data:
            return None

        return session_data

    @classmethod
    def update_session_from_token(cls, token_jti, user_data, token_data, timeout=None):
        """
        Update session data based on new token data
        """
        from security.models import CompanyBranch, Role

        # Delete existing session
        cls.delete_session(token_jti)

        # Create new session with updated data
        return cls.create_session(user_data, token_data, timeout)

    @classmethod
    def delete_session(cls, token_jti):
        """
        Delete session data
        """
        token_key = f"{cls.TOKEN_PREFIX}{token_jti}"
        session_id = cache.get(token_key)

        if session_id:
            session_key = f"{cls.PREFIX}{session_id}"
            cache.delete(session_key)
            cache.delete(token_key)
            return True

        return False

    @classmethod
    def extend_session(cls, token_jti, timeout=None):
        """
        Extend session timeout
        """
        token_key = f"{cls.TOKEN_PREFIX}{token_jti}"
        session_id = cache.get(token_key)

        if not session_id:
            return False

        session_key = f"{cls.PREFIX}{session_id}"
        session_data = cache.get(session_key)

        if not session_data:
            return False

        timeout = timeout or cls.DEFAULT_TIMEOUT
        cache.set(session_key, session_data, timeout)
        cache.set(token_key, session_id, timeout)

        return True
