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
        attributionControl: false // Cleaner look, optional
      }).setView([14.0583, 108.2772], 6); // Center of Vietnam

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
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
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Clear existing route layer
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    if (items.length === 0 && !navigationPath) return;

    // Add Markers
    const bounds = L.latLngBounds([]);
    
    items.forEach((item) => {
      if (item.coordinates) {
        // Create custom icon based on type
        const colorClass = getCategoryColor(item.type).replace('bg-', '');
        const colorMap: Record<string, string> = {
          'orange-500': '#f97316',
          'emerald-500': '#10b981',
          'pink-500': '#ec4899',
          'indigo-500': '#6366f1',
          'blue-500': '#3b82f6',
          'gray-500': '#6b7280'
        };
        const color = colorMap[colorClass] || '#3b82f6';

        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12]
        });

        const marker = L.marker([item.coordinates.lat, item.coordinates.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`<b>${item.title}</b><br>${item.locationName}`);
        
        markersRef.current.push(marker);
        bounds.extend([item.coordinates.lat, item.coordinates.lng]);
      }
    });

    // Draw Detailed Navigation Line if requested
    const fetchAndDrawRoute = async () => {
      if (navigationPath && navigationPath.length >= 2) {
        const start = navigationPath[0].coordinates;
        const end = navigationPath[1].coordinates;
        
        if (start && end) {
          try {
            // Using OSRM public API for driving directions
            const response = await fetch(
              `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
            );
            
            const data = await response.json();
            
            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
              const geometry = data.routes[0].geometry;
              
              // Draw the route shape
              routeLayerRef.current = L.geoJSON(geometry, {
                style: {
                  color: '#3b82f6', // blue-500
                  weight: 5,
                  opacity: 0.8,
                  lineCap: 'round',
                  lineJoin: 'round'
                }
              }).addTo(map);

              // Fit bounds to the route
              const routeBounds = routeLayerRef.current.getBounds();
              map.fitBounds(routeBounds, { padding: [50, 50] });
            } 
          } catch (err) {
            console.error("Failed to fetch route geometry", err);
             const latlngs = [
              [start.lat, start.lng],
              [end.lat, end.lng]
            ] as L.LatLngExpression[];

            routeLayerRef.current = (L.polyline(latlngs, {
              color: '#2563eb',
              weight: 4,
              opacity: 0.5,
              dashArray: '10, 10'
            }) as any).addTo(map);
          }
        }
      } else if (items.length > 0) {
        // Only fit bounds to markers if we aren't navigating specifically
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    };

    fetchAndDrawRoute();

  }, [items, navigationPath]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default Map;