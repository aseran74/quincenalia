import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, MapPin } from 'lucide-react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Property } from '@/types/property';

type Filters = {
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
};

const initialFilters: Filters = {
  minPrice: '',
  maxPrice: '',
  bedrooms: 'all',
  bathrooms: 'all',
  propertyType: 'all',
};

const propertyTypes = [
  'Apartamento',
  'Casa',
  'Chalet',
  'Ático',
  'Dúplex',
  'Local',
  'Oficina',
];

const getImageUrl = (path: string) => {
  if (!path) return '/placeholder.svg';
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/properties/${path}`;
};

export const PropertiesPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const applyFilters = (properties: Property[]) => {
    return properties.filter(property => {
      const matchesMinPrice = !filters.minPrice || property.price >= parseInt(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || property.price <= parseInt(filters.maxPrice);
      const matchesBedrooms = filters.bedrooms === 'all' || property.bedrooms === parseInt(filters.bedrooms);
      const matchesBathrooms = filters.bathrooms === 'all' || property.bathrooms === parseInt(filters.bathrooms);
      const matchesType = filters.propertyType === 'all' || property.type === filters.propertyType;

      return matchesMinPrice && matchesMaxPrice && matchesBedrooms && matchesBathrooms && matchesType;
    });
  };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        console.log('Fetching properties from Supabase...');
        const { data, error } = await supabase
          .from('properties')
          .select('*');
        
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        console.log('Properties received:', data);
        if (data) {
          console.log('Propiedades con coordenadas:', data.filter(p => p.latitude && p.longitude));
          data.forEach(property => {
            console.log('Propiedad:', property.id, {
              title: property.title,
              lat: property.latitude,
              lng: property.longitude,
              hasCoords: Boolean(property.latitude && property.longitude)
            });
          });
        }
        setProperties(data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const PropertyCard = ({ property }: { property: Property }) => {
    console.log('Images for property:', property.id, property.images);
    const imageUrl = property.images && property.images.length > 0 ? property.images[0] : '/placeholder.svg';
    console.log('Using image URL:', imageUrl);

    return (
      <Link to={`/properties/${property.id}`}>
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              console.error('Error loading image:', imageUrl);
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
            <p className="text-gray-600 mb-4">
              {property.bedrooms} habitaciones • {property.bathrooms} baños • {property.area}m²
            </p>
            <p className="text-lg font-bold mb-4">
              {property.price.toLocaleString()}€
            </p>
            <Button variant="outline" className="w-full">
              Ver detalles
            </Button>
          </div>
        </Card>
      </Link>
    );
  };

  const FilterSection = () => (
    <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
      <Input
        type="number"
        placeholder="Precio mínimo"
        value={filters.minPrice}
        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
      />
      <Input
        type="number"
        placeholder="Precio máximo"
        value={filters.maxPrice}
        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
      />
      <Select
        value={filters.bedrooms}
        onValueChange={(value) => setFilters({ ...filters, bedrooms: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Habitaciones" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {[1, 2, 3, 4, 5].map((num) => (
            <SelectItem key={num} value={num.toString()}>
              {num} {num === 1 ? 'habitación' : 'habitaciones'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.bathrooms}
        onValueChange={(value) => setFilters({ ...filters, bathrooms: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Baños" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {[1, 2, 3, 4].map((num) => (
            <SelectItem key={num} value={num.toString()}>
              {num} {num === 1 ? 'baño' : 'baños'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.propertyType}
        onValueChange={(value) => setFilters({ ...filters, propertyType: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {propertyTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-gray-200" />
              <div className="p-4">
                <div className="h-6 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded mb-4" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const filteredProperties = applyFilters(properties);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Propiedades</h1>
        <Tabs defaultValue={view} onValueChange={(v) => setView(v as 'grid' | 'map')}>
          <TabsList>
            <TabsTrigger value="grid">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="map">
              <MapPin className="h-4 w-4 mr-2" />
              Mapa
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <FilterSection />

      {view === 'grid' ? (
        <div className="grid md:grid-cols-3 gap-8">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
          <GoogleMap
            mapContainerClassName="h-[600px] w-full rounded-lg"
            center={{ lat: 40.4637, lng: -3.7492 }}
            zoom={6}
            options={{
              gestureHandling: 'greedy',
              minZoom: 5,
              maxZoom: 18,
              mapTypeControl: true,
              fullscreenControl: true,
              streetViewControl: true,
              zoomControl: true
            }}
          >
            {filteredProperties.map((property) => {
              console.log('Intentando renderizar marcador para:', property.id, {
                lat: property.latitude,
                lng: property.longitude,
                hasCoords: Boolean(property.latitude && property.longitude)
              });
              return property.latitude && property.longitude ? (
                <Marker
                  key={property.id}
                  position={{
                    lat: Number(property.latitude),
                    lng: Number(property.longitude)
                  }}
                  title={property.title}
                  onClick={() => window.location.href = `/properties/${property.id}`}
                />
              ) : null;
            })}
          </GoogleMap>
        </LoadScript>
      )}
    </div>
  );
};

export default PropertiesPage; 