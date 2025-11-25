from django.urls import re_path, include
from .company.views import CompanyView
from .carrera.views import CarreraView
from .branch.views import CompanyBranchView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'companies', CompanyView, basename='api_v1_0_0_view_security_companies')
router.register(r'branches', CompanyBranchView, basename='api_v1_0_0_view_security_branches')
router.register(r'carreras', CarreraView, basename='api_v1_0_0_view_security_carreras')
urlpatterns = [
    re_path(r'^', include(router.urls)),
]
