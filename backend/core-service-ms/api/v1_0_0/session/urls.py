from django.urls import re_path, include
from .views import BranchView, RolView

urlpatterns = [
    re_path(r'^branches$', BranchView.as_view(), name="api_v1_0_0_view_session_branches"),
    re_path(r'^roles$', RolView.as_view(), name="api_v1_0_0_view_session_roles"),
]
