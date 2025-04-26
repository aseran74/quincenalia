import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { HiOutlineArrowLeft, HiOutlinePencil } from "react-icons/hi2";

type ShareStatus = 'disponible' | 'reservado' | 'vendido';

interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  status?: ShareStatus;
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  location?: string;
  share1_status?: ShareStatus;
  share2_status?: ShareStatus;
  share3_status?: ShareStatus;
  share4_status?: ShareStatus;
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'disponible':
      return 'bg-green-500';
    case 'reservado':
      return 'bg-yellow-500';
    case 'vendido':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const formatStatus = (status?: string) => {
  if (!status) return 'No definido';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar los detalles de la propiedad',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Propiedad no encontrada</h1>
          <Button onClick={() => navigate('/dashboard/properties')}>
            <HiOutlineArrowLeft className="h-5 w-5 mr-2" />
            Volver a propiedades
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard/properties')}
        >
          <HiOutlineArrowLeft className="h-5 w-5 mr-2" />
          Volver
        </Button>
        <Button
          onClick={() => navigate(`/dashboard/properties/${id}/edit`)}
        >
          <HiOutlinePencil className="h-5 w-5 mr-2" />
          Editar
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
              <p className="text-gray-500">{property.location}</p>
            </div>
            <Badge className={getStatusColor(property.status)}>
              {formatStatus(property.status)}
            </Badge>
          </div>

          <div className="mb-8">
            <div className="relative h-96 mb-4">
              {property.images && property.images.length > 0 ? (
                <>
                  <img
                    src={property.images[currentImageIndex]}
                    alt={`${property.title} - Imagen ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {property.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {property.images.map((_, index) => (
                        <button
                          key={index}
                          className={`w-3 h-3 rounded-full ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">No hay imágenes disponibles</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Detalles</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500">Precio</p>
                  <p className="text-xl font-semibold">€{property.price?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Área</p>
                  <p className="text-xl font-semibold">{property.area} m²</p>
                </div>
                <div>
                  <p className="text-gray-500">Habitaciones</p>
                  <p className="text-xl font-semibold">{property.bedrooms}</p>
                </div>
                <div>
                  <p className="text-gray-500">Baños</p>
                  <p className="text-xl font-semibold">{property.bathrooms}</p>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Estado de Copropiedades</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 mb-2">Share 1</p>
                    <Badge className={getStatusColor(property.share1_status)}>
                      {formatStatus(property.share1_status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-2">Share 2</p>
                    <Badge className={getStatusColor(property.share2_status)}>
                      {formatStatus(property.share2_status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-2">Share 3</p>
                    <Badge className={getStatusColor(property.share3_status)}>
                      {formatStatus(property.share3_status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-2">Share 4</p>
                    <Badge className={getStatusColor(property.share4_status)}>
                      {formatStatus(property.share4_status)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Descripción</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{property.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyDetail; 