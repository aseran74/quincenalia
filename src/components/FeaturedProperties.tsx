import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Property = Database['public']['Tables']['properties']['Row'];

export const FeaturedProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        console.log('Fetching properties from Supabase...');
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .limit(3);
        
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        console.log('Properties received:', data);
        setProperties(data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return (
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
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {properties.map((property) => (
        <Card key={property.id} className="overflow-hidden">
          <img
            src={property.image_url}
            alt={property.title}
            className="w-full h-48 object-cover"
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
      ))}
    </div>
  );
}; 