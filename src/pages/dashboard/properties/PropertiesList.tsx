import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BedDouble, Bath, Users, MapPin, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    images?: string[];
    price_weekday?: number;
    price?: number;
    beds?: number;
    bathrooms?: number;
    guests?: number;
    address: string;
    location?: string;
  };
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onDelete, onEdit }) => {
  const navigate = useNavigate();
  const imageUrl = property.images && property.images.length > 0 ? property.images[0] : '/public/images/cards/card-01.jpg';
  const price = property.price_weekday ?? property.price ?? 0;

  return (
    <div className="block rounded-lg shadow-lg overflow-hidden bg-white dark:bg-gray-800 transform hover:-translate-y-1 transition-transform duration-300 relative">
      <div className="relative h-56 cursor-pointer" onClick={() => navigate(`/dashboard/admin/properties/${property.id}`)}>
        <img className="w-full h-full object-cover" src={imageUrl} alt={property.title} />
        <div className="absolute top-2 right-2 bg-primary text-white text-sm font-bold px-3 py-1 rounded-full">
          <span className="flex items-center">
            {'€' + price + ' / Copropiedad'}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 truncate text-gray-900 dark:text-white">{property.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center mb-3">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="truncate">{property.address || property.location || '-'}</span>
        </p>
        <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
          <div className="flex items-center space-x-3">
            <span className="flex items-center text-sm"><BedDouble className="w-5 h-5 mr-1 text-primary" /> {property.beds || 0}</span>
            <span className="flex items-center text-sm"><Bath className="w-5 h-5 mr-1 text-primary" /> {property.bathrooms || 0}</span>
            <span className="flex items-center text-sm"><Users className="w-5 h-5 mr-1 text-primary" /> {property.guests || 0}</span>
          </div>
          <div className="flex space-x-2">
            <Button size="icon" variant="outline" onClick={e => { e.stopPropagation(); onEdit(property.id); }}><Pencil className="w-4 h-4" /></Button>
            <Button size="icon" variant="destructive" onClick={e => { e.stopPropagation(); onDelete(property.id); }}><Trash2 className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PropertiesListProps {
  properties: Array<{
    id: string;
    title: string;
    images?: string[];
    price_weekday?: number;
    price?: number;
    beds?: number;
    bathrooms?: number;
    guests?: number;
    address: string;
    location?: string;
  }>;
  onDelete: (id: string) => void;
}

const PropertiesList: React.FC<PropertiesListProps> = ({ properties, onDelete }) => {
  const navigate = useNavigate();
  const handleEdit = (id: string) => {
    navigate(`/dashboard/admin/properties/${id}/edit`);
  };

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-1 sm:px-2">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onDelete={onDelete}
          onEdit={handleEdit}
        />
      ))}
    </div>
  );
};

export default PropertiesList;
export { PropertiesList };