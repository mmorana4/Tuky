/**
 * Mapa OSM en WebView con Leaflet — para Android sin API key de Google.
 * Muestra OpenStreetMap y opcionalmente marcadores y soporta toque para elegir punto.
 */
import React, { useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

// Aproximar zoom de Leaflet desde latitudeDelta (react-native-maps)
function deltaToZoom(latitudeDelta) {
  if (!latitudeDelta || latitudeDelta <= 0) return 15;
  const zoom = Math.round(Math.log2(360 / (latitudeDelta * 2)) / 0.7);
  return Math.min(18, Math.max(2, zoom));
}

function buildHtml(region, markers) {
  const lat = region?.latitude ?? -2.170998;
  const lng = region?.longitude ?? -79.922359;
  const zoom = deltaToZoom(region?.latitudeDelta);
  const markersJson = JSON.stringify(
    (markers || []).map(m => ({
      lat: m.latitude ?? m.lat,
      lng: m.longitude ?? m.lng,
      title: m.title || '',
    }))
  );

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${lat}, ${lng}], ${zoom});
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19
    }).addTo(map);

    var markersLayer = L.layerGroup().addTo(map);
    function setMarkers(markers) {
      markersLayer.clearLayers();
      (markers || []).forEach(function(m) {
        if (m.lat == null || m.lng == null) return;
        var marker = L.marker([m.lat, m.lng]).addTo(markersLayer);
        if (m.title) marker.bindPopup(m.title);
      });
    }
    setMarkers(${markersJson});

    map.on('click', function(e) {
      var lat = e.latlng.lat;
      var lng = e.latlng.lng;
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'press', latitude: lat, longitude: lng }));
      }
    });
    map.on('moveend', function() {
      var c = map.getCenter();
      var z = map.getZoom();
      var bounds = map.getBounds();
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'region',
          latitude: c.lat,
          longitude: c.lng,
          latitudeDelta: bounds.getNorth() - bounds.getSouth(),
          longitudeDelta: bounds.getEast() - bounds.getWest()
        }));
      }
    });

    window.updateMap = function(region, markers) {
      if (region && region.latitude != null && region.longitude != null) {
        var z = region.latitudeDelta ? Math.round(Math.log2(360 / (region.latitudeDelta * 2)) / 0.7) : 15;
        z = Math.min(18, Math.max(2, z));
        map.setView([region.latitude, region.longitude], z);
      }
      if (markers) setMarkers(markers);
    };
  </script>
</body>
</html>
`;
}

export default function OSMMapWebView({
  region,
  markers = [],
  style,
  onMapPress,
  onRegionChangeComplete,
}) {
  const webRef = useRef(null);
  const lastRegionRef = useRef(null);
  const lastMarkersRef = useRef('');

  const handleMessage = useCallback(
    (event) => {
      try {
        const data = JSON.parse(event.nativeEvent?.data || '{}');
        if (data.type === 'press' && onMapPress && data.latitude != null && data.longitude != null) {
          onMapPress({
            nativeEvent: {
              coordinate: { latitude: data.latitude, longitude: data.longitude },
            },
          });
        }
        if (data.type === 'region' && onRegionChangeComplete) {
          const r = {
            latitude: data.latitude,
            longitude: data.longitude,
            latitudeDelta: data.latitudeDelta,
            longitudeDelta: data.longitudeDelta,
          };
          lastRegionRef.current = r;
          onRegionChangeComplete(r);
        }
      } catch (_) {}
    },
    [onMapPress, onRegionChangeComplete]
  );

  const initialHtml = buildHtml(region, markers);

  useEffect(() => {
    if (!webRef.current) return;
    const markersStr = JSON.stringify(markers);
    lastMarkersRef.current = markersStr;
    const script = `
      (function() {
        if (window.updateMap) {
          window.updateMap(${JSON.stringify(region)}, ${JSON.stringify(
      (markers || []).map(m => ({
        lat: m.latitude ?? m.lat,
        lng: m.longitude ?? m.lng,
        title: m.title || '',
      }))
    )});
        }
      })();
      true;
    `;
    webRef.current.injectJavaScript(script);
  }, [region, markers]);

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webRef}
        source={{ html: initialHtml }}
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        onMessage={handleMessage}
        mixedContentMode="compatibility"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    ...(Platform.OS === 'android' && { opacity: 0.99 }),
  },
});
