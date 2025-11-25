from django.urls import re_path, include, path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

from api.version import VersionView

schema_view_v1_0_0 = get_schema_view(
    openapi.Info(
        title="core-service-ms API v1.0.0",
        default_version='v1.0.0',
        description="API para el microservicio seguridad - versión 1.0.0",
        contact=openapi.Contact(email="tic@no-repty.com"),
        # license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
    patterns=[
        path('api/security/v1.0.0/', include('api.v1_0_0.urls')),
    ],
)
api_version_views = [
    re_path(r'^v1.0.0/', include('api.v1_0_0.urls')),
]

urlpatterns = [
    re_path(r'^swagger/v1.0.0/$', schema_view_v1_0_0.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui-v1_0_0'),
    re_path('version/', VersionView.as_view(), name='api-version'),
    re_path(r'^', include((api_version_views, 'api_version_views'), namespace="api_version_views")),
]
