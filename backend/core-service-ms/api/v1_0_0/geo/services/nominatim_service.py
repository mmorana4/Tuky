import requests
from django.conf import settings


def geocode(query: str, countrycodes: str = "ec") -> dict:
    """
    Geocodifica una dirección usando Nominatim (OpenStreetMap).
    Devuelve { latitude, longitude, address }.
    """
    base_url = settings.GEO_SERVICES.get("NOMINATIM_URL", "https://nominatim.openstreetmap.org/")
    user_agent = settings.GEO_SERVICES.get("NOMINATIM_USER_AGENT", "tuky-app/1.0")

    params = {
        "q": query,
        "format": "json",
        "limit": 1,
        "addressdetails": 1,
    }
    if countrycodes:
        params["countrycodes"] = countrycodes

    headers = {
        "User-Agent": user_agent,
        "Accept-Language": "es",
    }

    try:
        response = requests.get(
            f"{base_url.rstrip('/')}/search",
            params=params,
            headers=headers,
            timeout=10,
        )
        response.raise_for_status()
        results = response.json()

        if not results:
            raise ValueError("No se encontraron resultados para la dirección indicada.")

        result = results[0]
        return {
            "latitude": float(result["lat"]),
            "longitude": float(result["lon"]),
            "address": result.get("display_name", query),
        }

    except requests.RequestException as e:
        raise RuntimeError(f"Error al conectar con Nominatim: {str(e)}")


def reverse_geocode(lat: float, lng: float) -> dict:
    """
    Geocodificación inversa: convierte lat/lng en dirección legible usando Nominatim.
    """
    base_url = settings.GEO_SERVICES.get("NOMINATIM_URL", "https://nominatim.openstreetmap.org/")
    user_agent = settings.GEO_SERVICES.get("NOMINATIM_USER_AGENT", "tuky-app/1.0")

    params = {
        "lat": lat,
        "lon": lng,
        "format": "json",
        "addressdetails": 1,
    }

    headers = {
        "User-Agent": user_agent,
        "Accept-Language": "es",
    }

    try:
        response = requests.get(
            f"{base_url.rstrip('/')}/reverse",
            params=params,
            headers=headers,
            timeout=10,
        )
        response.raise_for_status()
        result = response.json()

        if "error" in result:
            raise ValueError(result["error"])

        return {
            "latitude": lat,
            "longitude": lng,
            "address": result.get("display_name", f"{lat}, {lng}"),
        }

    except requests.RequestException as e:
        raise RuntimeError(f"Error al conectar con Nominatim (reverse): {str(e)}")
