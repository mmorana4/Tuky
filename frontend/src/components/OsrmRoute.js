/**
 * OsrmRoute — Componente v2.0
 * Alternativa a <MapViewDirections> que usa OSRM (OpenStreetMap Routing Machine)
 * en lugar de Google Directions API.
 *
 * Props:
 *   origin       { latitude, longitude }  — punto de inicio
 *   destination  { latitude, longitude }  — punto de fin
 *   strokeColor  string                   — color de la línea (default: '#2196F3')
 *   strokeWidth  number                   — grosor (default: 4)
 *   onRouteReady ({ distance_km, duration_minutes }) → callback opcional
 */
import React, { useEffect, useState } from 'react';
import { Polyline } from 'react-native-maps';
import GeoService from '../services/geoService';

export default function OsrmRoute({
    origin,
    destination,
    strokeColor = '#2196F3',
    strokeWidth = 4,
    onRouteReady,
}) {
    const [polylineCoords, setPolylineCoords] = useState([]);

    useEffect(() => {
        if (
            !origin?.latitude || !origin?.longitude ||
            !destination?.latitude || !destination?.longitude
        ) {
            return;
        }

        let cancelled = false;

        const fetchRoute = async () => {
            try {
                const route = await GeoService.route(origin, destination);
                if (!cancelled) {
                    setPolylineCoords(route.polyline ?? []);
                    if (onRouteReady) {
                        onRouteReady({
                            distance_km: route.distance_km,
                            duration_minutes: route.duration_minutes,
                        });
                    }
                }
            } catch (error) {
                console.warn('⚠️ OsrmRoute: no se pudo obtener la ruta:', error.message);
            }
        };

        fetchRoute();
        return () => { cancelled = true; };
    }, [
        origin?.latitude,
        origin?.longitude,
        destination?.latitude,
        destination?.longitude,
    ]);

    if (polylineCoords.length < 2) return null;

    return (
        <Polyline
            coordinates={polylineCoords}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
        />
    );
}
