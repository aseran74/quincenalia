import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Property {
  id: number;
  title: string;
  price: number;
  location: string;
  coordinates: [number, number]; // [latitude, longitude]
}

interface PropertyMapProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
}

const PropertyMap = ({ properties, onPropertyClick }: PropertyMapProps) => {
  useEffect(() => {
    // Crear el mapa
    const map = L.map('map').setView([40.416775, -3.703790], 6); // Centro en España

    // Añadir el tile layer de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Añadir marcadores para cada propiedad
    properties.forEach(property => {
      const marker = L.marker(property.coordinates)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold">${property.title}</h3>
            <p class="text-primary font-bold">${property.price.toLocaleString()}€</p>
            <p class="text-sm text-gray-600">${property.location}</p>
          </div>
        `)
        .addTo(map);

      if (onPropertyClick) {
        marker.on('click', () => onPropertyClick(property));
      }
    });

    // Limpiar al desmontar
    return () => {
      map.remove();
    };
  }, [properties, onPropertyClick]);

  return (
    <div id="map" className="w-full h-full rounded-lg" />
  );
};

export default PropertyMap; 