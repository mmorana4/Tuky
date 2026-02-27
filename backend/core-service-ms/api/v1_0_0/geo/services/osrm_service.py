import requests
from django.conf import settings


def get_route(origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float) -> dict:
    """
    Obtiene una ruta entre dos puntos usando OSRM.
    Devuelve { geometry (GeoJSON LineString), distance_meters, duration_seconds, polyline (lista de coords) }.
    """
    base_url = settings.GEO_SERVICES.get(
        "OSRM_URL", "https://router.project-osrm.org/route/v1/driving/"
    )

    # OSRM espera: /route/v1/{profile}/{lng,lat};{lng,lat}
    coordinates = f"{origin_lng},{origin_lat};{dest_lng},{dest_lat}"
    url = f"{base_url.rstrip('/')}/{coordinates}"

    params = {
        "overview": "full",
        "geometries": "geojson",
        "steps": "false",
    }

    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()

        if data.get("code") != "Ok" or not data.get("routes"):
            raise ValueError(f"OSRM no encontró ruta: {data.get('code', 'Unknown')}")

        route = data["routes"][0]
        geometry = route["geometry"]  # GeoJSON LineString

        # Convertir coordenadas GeoJSON [lng, lat] → [{latitude, longitude}] para el frontend
        polyline = [
            {"latitude": coord[1], "longitude": coord[0]}
            for coord in geometry["coordinates"]
        ]

        return {
            "geometry": geometry,
            "polyline": polyline,
            "distance_meters": route.get("distance", 0),
            "duration_seconds": route.get("duration", 0),
            "distance_km": round(route.get("distance", 0) / 1000, 2),
            "duration_minutes": round(route.get("duration", 0) / 60, 1),
        }

    except requests.RequestException as e:
        raise RuntimeError(f"Error al conectar con OSRM: {str(e)}")
