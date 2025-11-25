from django.urls import re_path, include
from .views import SignInView, SignOutView, TokenRefreshView, GoogleOAuthView, GoogleOAuthCallbackView

urlpatterns = [
    # Autenticación tradicional
    re_path(r'^sign-in$', SignInView.as_view(), name="api_v1_0_0_view_auth_sign_in"),
    re_path(r'^sign-out$', SignOutView.as_view(), name="api_v1_0_0_view_auth_sign_out"),
    re_path(r'^refresh$', TokenRefreshView.as_view(), name="api_v1_0_0_view_auth_refresh"),

    # OAuth2 Google
    re_path(r'^oauth2/google$', GoogleOAuthView.as_view(), name="api_v1_0_0_view_auth_google_oauth"),
    re_path(r'^oauth2/google/callback$', GoogleOAuthCallbackView.as_view(),
            name="api_v1_0_0_view_auth_google_oauth_callback"),
]
