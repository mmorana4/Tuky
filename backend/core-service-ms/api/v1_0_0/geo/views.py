from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .services import photon_service, nominatim_service, osrm_service


class GeoAutocompleteView(APIView):
    """
    GET /api/v1.0.0/geo/autocomplete?q=<texto>&countrycodes=ec&limit=5
    Retorna sugerencias de lugares usando Photon (OpenStreetMap).
    Mismo formato de respuesta que Google Places Autocomplete.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        countrycodes = request.query_params.get("countrycodes", "ec")
        limit = int(request.query_params.get("limit", 5))

        if not query or len(query) < 2:
            return Response(
                {"status": "ZERO_RESULTS", "predictions": []},
                status=status.HTTP_200_OK,
            )

        try:
            suggestions = photon_service.autocomplete(query, countrycodes, limit)
            return Response(
                {
                    "status": "OK",
                    "predictions": suggestions,
                },
                status=status.HTTP_200_OK,
            )
        except RuntimeError as e:
            return Response(
                {"status": "ERROR", "error_message": str(e)},
                status=status.HTTP_502_BAD_GATEWAY,
            )


class GeoGeocodeView(APIView):
    """
    GET /api/v1.0.0/geo/geocode?q=<direccion>&countrycodes=ec
    Geocodifica una dirección usando Nominatim (OpenStreetMap).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        countrycodes = request.query_params.get("countrycodes", "ec")

        if not query:
            return Response(
                {"status": "INVALID_REQUEST", "error_message": "El parámetro 'q' es requerido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = nominatim_service.geocode(query, countrycodes)
            return Response(
                {"status": "OK", "result": result},
                status=status.HTTP_200_OK,
            )
        except ValueError as e:
            return Response(
                {"status": "ZERO_RESULTS", "error_message": str(e)},
                status=status.HTTP_200_OK,
            )
        except RuntimeError as e:
            return Response(
                {"status": "ERROR", "error_message": str(e)},
                status=status.HTTP_502_BAD_GATEWAY,
            )


class GeoReverseGeocodeView(APIView):
    """
    GET /api/v1.0.0/geo/reverse?lat=<lat>&lng=<lng>
    Geocodificación inversa usando Nominatim.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            lat = float(request.query_params.get("lat"))
            lng = float(request.query_params.get("lng"))
        except (TypeError, ValueError):
            return Response(
                {"status": "INVALID_REQUEST", "error_message": "Parámetros 'lat' y 'lng' requeridos y deben ser numéricos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = nominatim_service.reverse_geocode(lat, lng)
            return Response(
                {"status": "OK", "result": result},
                status=status.HTTP_200_OK,
            )
        except RuntimeError as e:
            return Response(
                {"status": "ERROR", "error_message": str(e)},
                status=status.HTTP_502_BAD_GATEWAY,
            )


class GeoRouteView(APIView):
    """
    GET /api/v1.0.0/geo/route?origin=lat,lng&destination=lat,lng
    Calcula una ruta usando OSRM (OpenStreetMap Routing Machine).
    Retorna GeoJSON + polyline lista para react-native-maps.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        origin_str = request.query_params.get("origin", "")
        dest_str = request.query_params.get("destination", "")

        try:
            origin_lat, origin_lng = [float(x) for x in origin_str.split(",")]
            dest_lat, dest_lng = [float(x) for x in dest_str.split(",")]
        except (ValueError, AttributeError):
            return Response(
                {
                    "status": "INVALID_REQUEST",
                    "error_message": "Formato requerido: origin=lat,lng&destination=lat,lng",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            route = osrm_service.get_route(origin_lat, origin_lng, dest_lat, dest_lng)
            return Response(
                {"status": "OK", "route": route},
                status=status.HTTP_200_OK,
            )
        except ValueError as e:
            return Response(
                {"status": "ZERO_RESULTS", "error_message": str(e)},
                status=status.HTTP_200_OK,
            )
        except RuntimeError as e:
            return Response(
                {"status": "ERROR", "error_message": str(e)},
                status=status.HTTP_502_BAD_GATEWAY,
            )
