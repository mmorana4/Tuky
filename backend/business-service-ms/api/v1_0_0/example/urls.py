from django.urls import path
from .views import ExampleProtectedView

urlpatterns = [
    path('protected/', ExampleProtectedView.as_view(), name='protected-view'),
]