import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Property } from '@/types/property';

interface PropertyMapProps {
  properties: Property[];
}

const PropertyMap = ({ properties }: PropertyMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    const mapDiv = document.getElementById('map');
    if (!mapDiv) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapDiv).setView([40.416775, -3.703790], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }
    const map = mapRef.current;
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    if (!properties || properties.length === 0) return;
    properties.forEach((property) => {
      if (!property.latitude || !property.longitude) return;
      try {
        const marker = L.marker([property.latitude, property.longitude], {
          title: property.title || undefined,
        }).addTo(map);
        markersRef.current.push(marker);
      } catch (e) {
        // Silenciar errores de marcadores
      }
    });
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      try {
        map.fitBounds(group.getBounds().pad(0.2));
      } catch (e) {}
    }
  }, [properties]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div id="map" className="w-full h-full rounded-lg bg-gray-200" style={{ minHeight: '300px' }} />
  );
};

export default PropertyMap;
