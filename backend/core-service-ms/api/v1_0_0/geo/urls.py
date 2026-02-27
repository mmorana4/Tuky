from django.urls import re_path
from .views import GeoAutocompleteView, GeoGeocodeView, GeoReverseGeocodeView, GeoRouteView

urlpatterns = [
    re_path(r'^autocomplete$', GeoAutocompleteView.as_view(), name='geo_autocomplete'),
    re_path(r'^geocode$', GeoGeocodeView.as_view(), name='geo_geocode'),
    re_path(r'^reverse$', GeoReverseGeocodeView.as_view(), name='geo_reverse'),
    re_path(r'^route$', GeoRouteView.as_view(), name='geo_route'),
]
