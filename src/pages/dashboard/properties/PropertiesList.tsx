import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from "react-icons/hi2";

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

interface PropertiesListProps {
  properties: Property[];
  onDelete: (id: string) => void;
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

export const PropertiesList: React.FC<PropertiesListProps> = ({ properties, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Card 
          key={property.id} 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate(`/dashboard/properties/${property.id}`)}
        >
          <div className="relative">
            <img
              src={property.images?.[0] || '/placeholder-property.jpg'}
              alt={property.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <div className="absolute top-2 right-2 flex flex-col gap-2">
              <Badge className={getStatusColor(property.status)}>
                {formatStatus(property.status)}
              </Badge>
            </div>
          </div>

          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-2">{property.title}</h2>
            <p className="text-2xl font-bold text-blue-600 mb-4">
              €{property.price?.toLocaleString() || '0'}
            </p>

            <div className="grid grid-cols-3 gap-2 text-sm text-gray-500 mb-4">
              <div className="text-center">
                <p className="font-semibold">{property.bedrooms || 0}</p>
                <p>Habitaciones</p>
              </div>
              <div className="text-center">
                <p className="font-semibold">{property.bathrooms || 0}</p>
                <p>Baños</p>
              </div>
              <div className="text-center">
                <p className="font-semibold">{property.area || 0}</p>
                <p>m²</p>
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <h3 className="text-sm font-semibold mb-2">Estado de Copropiedades</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(property.share1_status)} text-xs`}>
                    Share 1
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(property.share2_status)} text-xs`}>
                    Share 2
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(property.share3_status)} text-xs`}>
                    Share 3
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(property.share4_status)} text-xs`}>
                    Share 4
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/dashboard/properties/${property.id}/edit`);
                }}
              >
                <HiOutlinePencil className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(property.id);
                }}
              >
                <HiOutlineTrash className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/dashboard/properties/${property.id}`);
                }}
              >
                <HiOutlineEye className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PropertiesList; 