from django.urls import re_path, include

urlpatterns = [
    re_path(r'^auth/', include('api.v1_0_0.auth.urls')),
    re_path(r'^session/', include('api.v1_0_0.session.urls')),
    re_path(r'^transport/', include('api.v1_0_0.transport.urls')),
    re_path(r'^geo/', include('api.v1_0_0.geo.urls')),  # v2.0 — Geo OSS (Photon/Nominatim/OSRM)
    re_path(r'^', include('api.v1_0_0.security.urls')),
    # re_path(r'^mantenimiento/', include('api.v1_0_0.mantenimiento.urls')),
]