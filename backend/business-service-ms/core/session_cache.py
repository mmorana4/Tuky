from django.core.cache import cache
import json

class SessionCache:
    PREFIX = 'session:'
    TOKEN_PREFIX = 'token:'
    
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
            
        return json.loads(session_data)