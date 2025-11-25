from django.urls import path, include

urlpatterns = [
    path('v1.0.0/', include('api.v1_0_0.urls')),
]