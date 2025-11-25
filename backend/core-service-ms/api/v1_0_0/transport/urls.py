from django.urls import re_path, include
from .solicitud.views import SolicitudViajeView
from .viaje.views import ViajeView
from .conductor.views import ConductorView
from .moto.views import MotoView
from .calificacion.views import CalificacionView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'solicitudes', SolicitudViajeView, basename='api_v1_0_0_transport_solicitudes')
router.register(r'viajes', ViajeView, basename='api_v1_0_0_transport_viajes')
router.register(r'conductores', ConductorView, basename='api_v1_0_0_transport_conductores')
router.register(r'motos', MotoView, basename='api_v1_0_0_transport_motos')
router.register(r'calificaciones', CalificacionView, basename='api_v1_0_0_transport_calificaciones')

urlpatterns = [
    re_path(r'^', include(router.urls)),
]

