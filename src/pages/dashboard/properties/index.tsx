import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import ReservationCalendar from './ReservationCalendar';
import PropertyDetail from './PropertyDetail';
import { Card } from '@/components/ui/card';
import { GeocodeProperties } from '@/components/GeocodeProperties';
import type { Property } from '@/types/property';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  status: 'disponible' | 'reservado' | 'vendido';
  copropiedad: string;
  features: string[];
  images: string[];
}

const STATUS_COLORS: Record<string, string> = {
  disponible: 'bg-green-500',
  reservado: 'bg-yellow-500',
  vendido: 'bg-red-500',
};

const PropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar las propiedades',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const PropertyCard: React.FC<{ property: Property }> = ({ property }) => (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
      onClick={() => navigate(`/dashboard/properties/${property.id}`)}
    >
      <div className="relative h-48">
        <img
          src={property.images[0] || '/placeholder-property.jpg'}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <Badge 
          className={`absolute top-2 right-2 ${STATUS_COLORS[property.status]}`}
        >
          {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
        </Badge>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
        <p className="text-blue-600 font-bold mb-2">
          ${property.price.toLocaleString()}
        </p>
        <p className="text-gray-600 text-sm mb-2">
          {property.description.length > 100
            ? `${property.description.substring(0, 100)}...`
            : property.description}
        </p>
        <div className="text-sm text-blue-700 font-semibold">
          {property.copropiedad ? `Asignada: ${property.copropiedad}` : 'Sin copropiedad asignada'}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-96">Cargando...</div>;
  }

  return (
    <Routes>
      <Route path="reservas" element={<ReservationCalendar />} />
      <Route index element={
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Propiedades</h1>
            <div className="flex space-x-4">
              <Button onClick={() => navigate('/dashboard/properties/copropiedades')}>
                Gestionar Copropiedades
              </Button>
              <Button onClick={() => navigate('/dashboard/properties/bulk-upload')}>
                Carga Masiva
              </Button>
              <Button onClick={() => navigate('/dashboard/properties/new')}>
                <Plus className="h-5 w-5 mr-2" />
                Nueva Propiedad
              </Button>
            </div>
          </div>

          {properties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No hay propiedades registradas</p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => navigate('/dashboard/properties/new')}>
                  Agregar Primera Propiedad
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard/properties/bulk-upload')}
                >
                  Importar Propiedades
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      } />
      <Route path=":id" element={<PropertyDetail />} />
    </Routes>
  );
};

export default PropertiesPage; 