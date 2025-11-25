from .controllers.auth_controller import SignInController, SignOutController, RefreshTokenController
from .controllers.oauth_controller import GoogleOAuthController


# Las views ahora son simples wrappers de los controllers
class SignInView(SignInController):
    """View para login - delega toda la lógica al controller"""
    pass


class SignOutView(SignOutController):
    """View para logout - delega toda la lógica al controller"""
    pass


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
