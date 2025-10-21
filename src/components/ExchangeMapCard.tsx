import React from 'react';
import { MapPin, Bed, Bath, Square, Home, Star } from 'lucide-react';

interface ExchangeMapCardProps {
  property: {
    id: string;
    title: string;
    location?: string;
    images?: string[] | null;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    zona?: string;
  };
  pointsPerDay?: number;
  currentImageIndex?: number;
  isMobile?: boolean;
}

const ExchangeMapCard: React.FC<ExchangeMapCardProps> = ({
  property,
  pointsPerDay,
  currentImageIndex = 0,
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
        
        {/* Badge de puntos por día */}
        {pointsPerDay && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-sm px-3 py-1.5 rounded-full shadow-lg">
            {pointsPerDay} pts/día
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
        
        {/* Botón de acción */}
        <a
          href={`${window.location.origin}/properties/${property.id}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-center py-2 px-4 rounded-lg font-semibold text-sm transition-colors"
          onClick={(e) => { e.stopPropagation(); }}
        >
          <Star className="h-4 w-4 inline mr-1" />
          Ver intercambio
        </a>
      </div>
    </div>
  );
};

export default ExchangeMapCard;
