import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import PropertyFilters from '@/components/properties/PropertyFilters';
import PropertyMap from '@/components/properties/PropertyMap';
import { PropertyForMap, PropertySupabaseRow } from '@/types/properties';
import Properties from '@/pages/dashboard/properties/Properties'; // Para la card admin

interface FiltersState {
  bedrooms: string;
  minSize: number | string;
  priceRange: [number, number];
  features: {
    pool: boolean;
    garden: boolean;
    garage: boolean;
    terrace: boolean;
    airConditioning: boolean;
    elevator: boolean;
    storage: boolean;
    seaView: boolean;
    accessible: boolean;
    luxury: boolean;
  };
}

const PropertiesMapViewPage = () => {
  const [allProperties, setAllProperties] = useState<PropertyForMap[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyForMap[]>([]);
  const [currentFilters, setCurrentFilters] = useState<FiltersState | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyForMap | null>(null);
  const [previewMode, setPreviewMode] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await supabase
          .from('properties')
          .select('*');
        if (supabaseError) throw supabaseError;
        if (data) {
          const mappedProperties: PropertyForMap[] = data
            .map((p: PropertySupabaseRow) => {
              let coordinates: [number, number] = [0, 0];
              if (typeof (p as any).latitude === 'number' && typeof (p as any).longitude === 'number') {
                coordinates = [(p as any).latitude, (p as any).longitude];
              }
              return {
                ...p,
                coordinates,
                images: Array.isArray(p.images) ? p.images : [],
                image_url: (p as any).image_url || '',
              };
            })
            .filter(p => p.coordinates[0] !== 0 && p.coordinates[1] !== 0);
          setAllProperties(mappedProperties);
          setFilteredProperties(mappedProperties);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load properties.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllProperties();
  }, []);

  useEffect(() => {
    if (!currentFilters) {
      setFilteredProperties(allProperties);
      return;
    }
    const newFilteredProperties = allProperties.filter(property => {
      const { bedrooms, minSize, priceRange, features } = currentFilters;
      if (bedrooms && (property.bedrooms ?? 0) < parseInt(bedrooms)) return false;
      const propertyArea = property.area ?? 0;
      if (minSize && propertyArea < Number(minSize)) return false;
      const propertyPrice = property.price ?? 0;
      if (propertyPrice < priceRange[0] || propertyPrice > priceRange[1]) return false;
      if (features.pool && !(property as any).pool) return false;
      if (features.garden && !(property as any).garden) return false;
      if (features.garage && !(property as any).garage) return false;
      if (features.terrace && !(property as any).terrace) return false;
      if (features.airConditioning && !(property as any).air_conditioning) return false;
      if (features.elevator && !(property as any).elevator) return false;
      if (features.storage && !(property as any).storage_room) return false;
      if (features.seaView && !(property as any).sea_view) return false;
      if (features.accessible && !(property as any).accessible) return false;
      if (features.luxury && !(property as any).luxury) return false;
      return true;
    });
    setFilteredProperties(newFilteredProperties);
  }, [currentFilters, allProperties]);

  const handleFiltersChange = useCallback((filters: FiltersState) => {
    setCurrentFilters(filters);
  }, []);

  // Responsive: lateral en escritorio, arriba en móvil
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando propiedades...</div>;
  }
  if (error) {
    return <div className="text-red-500 text-center p-4">Error: {error}</div>;
  }
  return (
    <div className="flex flex-col md:flex-row h-screen max-h-screen overflow-hidden relative">
      <div className="w-full md:w-1/4 xl:w-1/5 p-4 bg-gray-50 border-r border-gray-200 overflow-y-auto">
        <PropertyFilters onFiltersChange={handleFiltersChange} />
      </div>
      <div className="flex-1 h-1/2 md:h-full bg-gray-200 relative">
        <PropertyMap properties={filteredProperties} onPropertyClick={setSelectedProperty} selectedPropertyId={selectedProperty?.id ?? null} />
      </div>
    </div>
  );
};

export default PropertiesMapViewPage; 