import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { TimelineItem } from '../types';
import { getCategoryColor } from './Icons';

interface MapProps {
  items: TimelineItem[];
  navigationPath: TimelineItem[] | null; // [Origin, Destination] to draw line
}

const Map: React.FC<MapProps> = ({ items, navigationPath }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLayerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not already
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false, // We add it manually to position it better
        attributionControl: false, // Cleaner look, optional
      }).setView([14.0583, 108.2772], 6); // Center of Vietnam

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      // Add zoom control to bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);

      // Force map to recalculate size after a short delay to handle container rendering
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 100);
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Clear existing route layer
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    const validItems = items.filter((i) => i.coordinates);
    if (validItems.length === 0 && !navigationPath) return;

    // Add Markers
    const bounds = L.latLngBounds([]);

    validItems.forEach((item) => {
      if (item.coordinates) {
        // Create custom icon based on type
        const colorClass = getCategoryColor(item.type).replace('bg-', '');
        const colorMap: Record<string, string> = {
          'orange-500': '#f97316',
          'emerald-500': '#10b981',
          'pink-500': '#ec4899',
          'indigo-500': '#6366f1',
          'blue-500': '#3b82f6',
          'gray-500': '#6b7280',
        };
        const color = colorMap[colorClass] || '#3b82f6';

        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12],
        });

        const marker = L.marker([item.coordinates.lat, item.coordinates.lng], {
          icon: customIcon,
        })
          .addTo(map)
          .bindPopup(`<b>${item.title}</b><br>${item.locationName}`);

        markersRef.current.push(marker);
        bounds.extend([item.coordinates.lat, item.coordinates.lng]);
      }
    });

    // Determine points to draw route
    // Priority: NavigationPath (2 points) > Full Itinerary (N points)
    let routePoints: TimelineItem[] = [];
    if (navigationPath && navigationPath.length >= 2) {
      routePoints = navigationPath;
    } else if (validItems.length >= 2) {
      routePoints = validItems;
    }

    // Draw Detailed Line
    const fetchAndDrawRoute = async () => {
      if (routePoints.length >= 2) {
        // Construct OSRM coordinate string: lon,lat;lon,lat...
        // OSRM expects {longitude},{latitude}
        const coordsString = routePoints
          .map((p) => `${p.coordinates!.lng},${p.coordinates!.lat}`)
          .join(';');

        try {
          // Using OSRM public API for driving directions
          // Note: OSRM public demo server has limits on URL length and complexity.
          // If coordsString is too long, we might need to sample or split.
          // For typical itinerary (6-10 points), it should be fine.
          const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`
          );

          const data = await response.json();

          if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const geometry = data.routes[0].geometry;

            // Draw the route shape
            routeLayerRef.current = L.geoJSON(geometry, {
              style: {
                color: navigationPath ? '#ef4444' : '#3b82f6', // Red for navigation, Blue for itinerary
                weight: 5,
                opacity: 0.8,
                lineCap: 'round',
                lineJoin: 'round',
              },
            }).addTo(map);

            // Fit bounds to the route
            const routeBounds = routeLayerRef.current.getBounds();
            map.fitBounds(routeBounds, { padding: [50, 50] });
          }
        } catch (err) {
          console.error('Failed to fetch route geometry', err);
          // Fallback: Draw polyline connecting points
          const latlngs = routePoints.map((p) => [
            p.coordinates!.lat,
            p.coordinates!.lng,
          ]) as L.LatLngExpression[];

          routeLayerRef.current = (
            L.polyline(latlngs, {
              color: navigationPath ? '#ef4444' : '#3b82f6',
              weight: 4,
              opacity: 0.5,
              dashArray: '10, 10',
            }) as any
          ).addTo(map);

          // Fit bounds fallback
          if (markersRef.current.length > 0) {
            const group = L.featureGroup(markersRef.current);
            map.fitBounds(group.getBounds(), { padding: [50, 50] });
          }
        }
      } else if (markersRef.current.length > 0) {
        // No route to draw but we have markers, fit to markers
        const group = L.featureGroup(markersRef.current);
        map.fitBounds(group.getBounds(), { padding: [50, 50] });
      }
    };

    fetchAndDrawRoute();
  }, [items, navigationPath]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default Map;
