import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Property } from '../../../lib/supabase';

interface PropertyMapProps {
  properties: Property[];
  onMarkerClick?: (property: Property) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: -34.603722,  // Coordenadas de Buenos Aires como centro por defecto
  lng: -58.381592
};

export const PropertyMap: React.FC<PropertyMapProps> = ({ properties, onMarkerClick }) => {
  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={center}
      >
        {properties.map((property) => (
          <Marker
            key={property.id}
            position={{
              lat: property.latitude || center.lat,
              lng: property.longitude || center.lng
            }}
            onClick={() => onMarkerClick?.(property)}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
}; 