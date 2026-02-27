import requests
from django.conf import settings


def autocomplete(query: str, countrycodes: str = "ec", limit: int = 5) -> list[dict]:
    """
    Llama a la API de Photon (Komoot) para autocompletado de lugares.
    Devuelve lista de sugerencias con id, description, lat, lng.
    """
    base_url = settings.GEO_SERVICES.get("PHOTON_URL", "https://photon.komoot.io/api/")
    params = {
        "q": query,
        "limit": limit,
        "lang": "es",
    }
    if countrycodes:
        params["osm_tag"] = "place"
        # Photon usa bbox o countrycode query param (no estándar, usamos filtrado post-respuesta)

    try:
        response = requests.get(base_url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        suggestions = []
        for feature in data.get("features", []):
            props = feature.get("properties", {})
            coords = feature.get("geometry", {}).get("coordinates", [None, None])

            country_code = props.get("countrycode", "").lower()
            if countrycodes and country_code not in countrycodes.lower().split(","):
                continue

            name = props.get("name", "")
            city = props.get("city", "")
            state = props.get("state", "")
            country = props.get("country", "")

            parts = [p for p in [name, city, state, country] if p]
            description = ", ".join(parts)

            osm_id = props.get("osm_id", "")
            osm_type = props.get("osm_type", "")
            feature_id = f"{osm_type}:{osm_id}" if osm_id else str(description)[:40]

            suggestions.append({
                "id": feature_id,
                "description": description,
                "mainText": name or description,
                "secondaryText": ", ".join([p for p in [city, state, country] if p]),
                "latitude": coords[1],
                "longitude": coords[0],
            })

        return suggestions

    except requests.RequestException as e:
        raise RuntimeError(f"Error al conectar con Photon: {str(e)}")
