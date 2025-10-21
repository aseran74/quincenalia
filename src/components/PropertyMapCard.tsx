import React from 'react';
import { MapPin, Bed, Bath, Square, Home } from 'lucide-react';

interface PropertyMapCardProps {
  property: {
    id: string;
    title: string;
    location?: string;
    images?: string[] | null;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    price: number;
    zona?: string;
  };
  minSharePrice?: number | null;
  currentImageIndex?: number;
  formatPrice: (price: number) => string;
  isMobile?: boolean;
}

const PropertyMapCard: React.FC<PropertyMapCardProps> = ({
  property,
  minSharePrice,
  currentImageIndex = 0,
  formatPrice,
  isMobile = false
}) => {
  const imageUrl = property.images && property.images.length > 0 
    ? property.images[currentImageIndex] 
    : null;

  const cardWidth = isMobile ? 'w-[240px]' : 'w-[300px]';
  const imageHeight = isMobile ? 'h-[120px]' : 'h-[160px]';
  const padding = isMobile ? 'p-3' : 'p-4';

  return (
    <div className={`relative ${cardWidth} bg-white rounded-xl shadow-2xl overflow-hidden font-sans border border-gray-100`}>
      {/* Imagen con overlay de gradiente */}
      <div className={`relative ${imageHeight} overflow-hidden`}>
        <a
          href={`${window.location.origin}/properties/${property.id}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full h-full"
          aria-label={`Ver detalles de ${property.title}`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Imagen de ${property.title}`}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-property.jpg'; }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Home className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </a>
        
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        
        {/* Badge de precio mínimo */}
        {minSharePrice && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-primary font-bold text-sm px-3 py-1.5 rounded-full shadow-lg">
            {formatPrice(minSharePrice)}
          </div>
        )}
        
        {/* Badge de zona */}
        {property.zona && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-2 py-1 rounded-full shadow-md">
            {property.zona}
          </div>
        )}
      </div>
      
      {/* Contenido */}
      <div className={padding}>
        <a
          href={`${window.location.origin}/properties/${property.id}`}
          className="font-bold text-base text-gray-900 block hover:text-primary transition-colors line-clamp-2 mb-2"
          target="_blank" 
          rel="noopener noreferrer"
          onClick={(e) => { e.stopPropagation(); }}
        >
          {property.title}
        </a>
        
        {/* Ubicación */}
        {property.location && (
          <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="line-clamp-1">{property.location}</span>
          </div>
        )}
        
        {/* Características */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{property.bedrooms || '—'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{property.bathrooms || '—'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{property.area ? `${property.area}m²` : '—'}</span>
          </div>
        </div>
        
        {/* Precio total */}
        <div className="text-sm text-gray-500 mb-3">
          Total: {formatPrice(property.price)}
        </div>
        
        {/* Botón de acción */}
        <a
          href={`${window.location.origin}/properties/${property.id}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full bg-primary text-primary-foreground hover:bg-primary/90 text-center py-2 px-4 rounded-lg font-semibold text-sm transition-colors"
          onClick={(e) => { e.stopPropagation(); }}
        >
          Ver detalles
        </a>
      </div>
    </div>
  );
};

export default PropertyMapCard;
