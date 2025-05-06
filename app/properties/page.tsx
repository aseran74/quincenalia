import React, { useState, useEffect } from 'react'
import { PropertiesList } from '../components/properties/PropertiesList'
import { PropertyFilter, PropertyFilters } from '../components/properties/PropertyFilter'
import PropertyMap from '@/components/properties/PropertyMap'
import { Property, getProperties } from '../../lib/supabase'

export default function PropertiesPage() {
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, [filters]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const data = await getProperties(filters);
      setProperties(data);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Propiedades Disponibles</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filtros - 1 columna */}
        <div className="lg:col-span-1">
          <PropertyFilter onFilterChange={handleFilterChange} />
        </div>

        {/* Mapa y Listado - 3 columnas */}
        <div className="lg:col-span-3 space-y-8">
          {/* Mapa */}
          <div className="w-full h-[400px] rounded-lg overflow-hidden">
            <PropertyMap 
              properties={properties}
              onMarkerClick={setSelectedProperty}
            />
          </div>

          {/* Listado de propiedades */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando propiedades...</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">{properties.length} propiedades encontradas</p>
              <PropertiesList properties={properties} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 