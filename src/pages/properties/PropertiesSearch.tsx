import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import PropertyFilters from '@/components/properties/PropertyFilters';
import PropertyMapXYZ from '@/components/properties/PropertyMap';
import { Card } from '@/components/ui/card';
import { MapIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import type { Libraries } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_LIBRARIES: Libraries = ['places'];

const PropertiesSearch = () => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [filters, setFilters] = useState({});
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [zone, setZone] = useState('');
  const [zoneInput, setZoneInput] = useState('');
  const autocompleteRef = useRef<any>(null);
  const { isLoaded } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY, libraries: GOOGLE_MAPS_LIBRARIES });

  useEffect(() => {
    setLoading(true);
    supabase
      .from('properties')
      .select('*')
      .then(({ data }) => {
        setProperties(data || []);
        setLoading(false);
      });
  }, []);

  const handlePropertyClick = (property: any) => {
    setSelectedProperty(property.id);
    if (viewMode === 'map') {
      setViewMode('list');
    }
  };

  const filteredProperties = zone
    ? properties.filter((p) =>
        p.location && p.location.toLowerCase().includes(zone.toLowerCase())
      )
    : properties;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con toggle de vista */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Buscar Propiedades
            </h1>
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="text-[16px]"
              >
                <ListBulletIcon className="h-4 w-4 mr-1" style={{ fontSize: 16, width: 16, height: 16 }} />
                <span className="text-[16px]">Lista</span>
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewMode('map');
                  setSelectedProperty(null);
                }}
                className="text-[16px]"
              >
                <MapIcon className="h-4 w-4 mr-1" style={{ fontSize: 16, width: 16, height: 16 }} />
                <span className="text-[16px]">Mapa</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filtros */}
          <div className="w-80 flex-shrink-0">
            <div className="mb-6">
              <label className="block font-medium mb-2 text-[16px]">Buscar por zona</label>
              {isLoaded ? (
                <Autocomplete
                  onLoad={ref => (autocompleteRef.current = ref)}
                  onPlaceChanged={() => {
                    const place = autocompleteRef.current?.getPlace();
                    if (place && place.formatted_address) {
                      setZone(place.formatted_address);
                      setZoneInput(place.formatted_address);
                    }
                  }}
                >
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 text-[16px]"
                    placeholder="Introduce una ciudad, zona o dirección..."
                    value={zoneInput}
                    onChange={e => {
                      setZoneInput(e.target.value);
                      if (!e.target.value) setZone('');
                    }}
                  />
                </Autocomplete>
              ) : (
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-[16px]"
                  placeholder="Introduce una ciudad, zona o dirección..."
                  value={zoneInput}
                  onChange={e => {
                    setZoneInput(e.target.value);
                    if (!e.target.value) setZone('');
                  }}
                  disabled
                />
              )}
            </div>
            <PropertyFilters onFiltersChange={setFilters} />
          </div>

          {/* Contenido principal */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Cargando propiedades...</div>
            ) : viewMode === 'map' ? (
              // Vista de mapa
              <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-200px)]">
                <div className="h-full rounded-lg overflow-hidden">
                  <PropertyMapXYZ 
                    properties={filteredProperties.map(p => ({
                      ...p,
                      images: Array.isArray(p.images)
                        ? p.images
                        : p.image_url
                          ? [p.image_url]
                          : p.image
                            ? [p.image]
                            : [],
                    }))}
                  />
                </div>
              </div>
            ) : (
              // Vista de lista
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <Card 
                    key={property.id} 
                    className={`overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] ${
                      selectedProperty === property.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handlePropertyClick(property)}
                  >
                    <div className="aspect-video relative">
                      <img
                        src={property.image_url || property.image || '/placeholder.svg'}
                        alt={property.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {property.price?.toLocaleString?.() || ''}€
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold">{property.title}</h3>
                      <div className="mt-2 text-sm text-gray-600">
                        {property.zona && (
                          <div className="flex items-center gap-2 text-gray-700 text-xs">
                            <span className="font-semibold">Zona:</span> {property.zona}
                          </div>
                        )}
                        {typeof property.lavabos === 'number' && (
                          <div className="flex items-center gap-2 text-gray-700 text-xs">
                            <span className="font-semibold">Lavabos:</span> {property.lavabos}
                          </div>
                        )}
                        <p>{property.bedrooms} habitaciones • {property.bathrooms} baños</p>
                        <p>{property.area || property.size}m² • {property.location}</p>
                      </div>
                      <Link to={`/properties/${property.id}`}>
                        <Button className="w-full mt-4">Ver detalles</Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesSearch; 