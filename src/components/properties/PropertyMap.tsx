import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Property } from '@/types/property';

interface PropertyMapProps {
  properties: Property[];
  selectedPropertyId?: string | null;
}

const PropertyMap = ({ properties, selectedPropertyId }: PropertyMapProps) => {
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

    // Iconos personalizados
    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      shadowSize: [41, 41],
    });
    const selectedIcon = L.icon({
      iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      shadowSize: [41, 41],
    });

    properties.forEach((property) => {
      if (!property.latitude || !property.longitude) return;
      try {
        const isSelected = selectedPropertyId && property.id === selectedPropertyId;
        const marker = L.marker([property.latitude, property.longitude], {
          title: property.title || undefined,
          icon: isSelected ? selectedIcon : defaultIcon,
        }).addTo(map);
        markersRef.current.push(marker);
        // Si está seleccionado, abre popup y centra
        if (isSelected) {
          marker.bindPopup(property.title || 'Propiedad seleccionada').openPopup();
          map.setView([property.latitude, property.longitude], 14);
        }
      } catch (e) {
        // Silenciar errores de marcadores
      }
    });
    if (markersRef.current.length > 0 && !selectedPropertyId) {
      const group = L.featureGroup(markersRef.current);
      try {
        map.fitBounds(group.getBounds().pad(0.2));
      } catch (e) {}
    }
  }, [properties, selectedPropertyId]);

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
