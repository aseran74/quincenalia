import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Property {
  id: number;
  title: string;
  price: number;
  location: string;
  coordinates: [number, number]; // [latitude, longitude]
  images: string[]; // Añadido para la foto
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

    // Guardar los marcadores para poder eliminarlos después
    const markers: L.Marker[] = [];

    // Añadir marcadores para cada propiedad
    properties.forEach(property => {
      const marker = L.marker(property.coordinates)
        .bindPopup(`
          <div class="p-2" style="min-width:180px;max-width:220px;">
            <img src="https://via.placeholder.com/200x90?text=Foto" alt="test" style="width:100%;height:90px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />
            <h3 class="font-semibold">${property.title}</h3>
            <p class="text-primary font-bold">${property.price.toLocaleString()}€</p>
            <p class="text-sm text-gray-600">${property.location}</p>
            <a href="/properties/${property.id}" style="display:block;margin-top:8px;color:#2563eb;font-weight:600;text-align:center;">Ver detalles</a>
          </div>
        `)
        .addTo(map);

      if (onPropertyClick) {
        marker.on('click', () => onPropertyClick(property));
      }
      markers.push(marker);
    });

    // Limpiar marcadores y el mapa al desmontar
    return () => {
      markers.forEach(marker => marker.remove());
      map.remove();
    };
  }, [properties, onPropertyClick]);

  return (
    <div id="map" className="w-full h-full rounded-lg" />
  );
};

export default PropertyMap; 