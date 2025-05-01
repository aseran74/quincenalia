import { useState } from 'react';
import { Button } from '@/components/ui/button';
import PropertyFilters from '@/components/properties/PropertyFilters';
import PropertyMap from '@/components/properties/PropertyMap';
import { Card } from '@/components/ui/card';
import { MapIcon, ListBulletIcon } from '@heroicons/react/24/outline';

const PropertiesSearch = () => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [filters, setFilters] = useState({});
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);

  // Datos de ejemplo con coordenadas
  const properties = [
    {
      id: 1,
      title: 'Villa con vistas al mar',
      price: 450000,
      bedrooms: 3,
      bathrooms: 2,
      size: 180,
      location: 'Costa del Sol, Málaga',
      coordinates: [36.7213, -4.4367], // Málaga
      image: '/property-1.jpg',
    },
    {
      id: 2,
      title: 'Ático de lujo en el centro',
      price: 650000,
      bedrooms: 4,
      bathrooms: 3,
      size: 200,
      location: 'Salamanca, Madrid',
      coordinates: [40.4168, -3.7038], // Madrid
      image: '/property-2.jpg',
    },
    {
      id: 3,
      title: 'Casa con jardín',
      price: 380000,
      bedrooms: 3,
      bathrooms: 2,
      size: 150,
      location: 'L\'Eixample, Barcelona',
      coordinates: [41.3851, 2.1734], // Barcelona
      image: '/property-3.jpg',
    },
  ];

  const handlePropertyClick = (property: any) => {
    setSelectedProperty(property.id);
    if (viewMode === 'map') {
      setViewMode('list');
    }
  };

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
              >
                <ListBulletIcon className="h-5 w-5 mr-1" />
                Lista
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <MapIcon className="h-5 w-5 mr-1" />
                Mapa
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filtros */}
          <div className="w-80 flex-shrink-0">
            <PropertyFilters onFiltersChange={setFilters} />
          </div>

          {/* Contenido principal */}
          <div className="flex-1">
            {viewMode === 'map' ? (
              // Vista de mapa
              <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-200px)]">
                <div className="h-full rounded-lg overflow-hidden">
                  <PropertyMap 
                    properties={properties.map(property => ({
                      ...property,
                      coordinates: [property.coordinates[0], property.coordinates[1]]
                    }))}
                    onPropertyClick={handlePropertyClick}
                  />
                </div>
              </div>
            ) : (
              // Vista de lista
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Card 
                    key={property.id} 
                    className={`overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] ${
                      selectedProperty === property.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handlePropertyClick(property)}
                  >
                    <div className="aspect-video relative">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {property.price.toLocaleString()}€
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold">{property.title}</h3>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>{property.bedrooms} habitaciones • {property.bathrooms} baños</p>
                        <p>{property.size}m² • {property.location}</p>
                      </div>
                      <Button className="w-full mt-4">Ver detalles</Button>
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