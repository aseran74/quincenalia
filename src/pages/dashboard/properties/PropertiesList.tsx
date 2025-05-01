import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiOutlineHome, HiOutlineUser, HiOutlineDocumentText, HiOutlineMapPin } from "react-icons/hi2";
import { FaSwimmingPool, FaHotTub, FaChild, FaGamepad, FaUmbrellaBeach, FaParking } from 'react-icons/fa';

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
  share1_price?: number;
  share2_price?: number;
  share3_price?: number;
  share4_price?: number;
  features?: string[];
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

const FEATURES = [
  { key: 'piscina_privada', icon: <FaSwimmingPool className="text-blue-500" title="Piscina privada" /> },
  { key: 'jacuzzi', icon: <FaHotTub className="text-pink-500" title="Jacuzzi" /> },
  { key: 'juegos_ninos', icon: <FaChild className="text-yellow-500" title="Juegos para niños" /> },
  { key: 'videoconsolas', icon: <FaGamepad className="text-green-500" title="Videoconsolas" /> },
  { key: 'acceso_playa', icon: <FaUmbrellaBeach className="text-cyan-500" title="Acceso playa" /> },
  { key: 'parking_gratuito', icon: <FaParking className="text-gray-700" title="Parking gratuito" /> },
];

export const PropertiesList: React.FC<PropertiesListProps> = ({ properties, onDelete }) => {
  const navigate = useNavigate();

  const shareLabels = [
    '1º quincena Julio + 10 sem',
    '2ª quincena Julio + 10 sem',
    '1º quincena Agosto + 10 sem',
    '2ª quincena Agosto + 10 sem',
  ];

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-1 sm:px-2 font-poppins">
      {properties.map((property) => {
        const shareStatus = [
          property.share1_status,
          property.share2_status,
          property.share3_status,
          property.share4_status,
        ];
        const sharePrices = [property.share1_price, property.share2_price, property.share3_price, property.share4_price];
        const firstAvailableIdx = [property.share1_status, property.share2_status, property.share3_status, property.share4_status].findIndex(s => s === 'disponible');
        const mainShareIdx = firstAvailableIdx !== -1 ? firstAvailableIdx : 0;
        const mainSharePrice = sharePrices[mainShareIdx] ?? property.price/4;

        // Slide automático de imágenes
        const [imgIdx, setImgIdx] = useState(0);
        useEffect(() => {
          if (!property.images || property.images.length <= 1) return;
          const interval = setInterval(() => {
            setImgIdx(idx => (idx + 1) % property.images.length);
          }, 2500);
          return () => clearInterval(interval);
        }, [property.images]);
        const currentImg = property.images && property.images.length > 0 ? property.images[imgIdx] : '/placeholder-property.jpg';

        return (
          <Card
            key={property.id}
            className="relative w-full max-w-md self-center h-[170px] sm:h-[200px] lg:h-[220px] bg-[#333] rounded-xl outline outline-1 outline-white/50 outline-offset-[-12px] shadow-lg overflow-hidden mx-auto group cursor-pointer font-poppins"
            onClick={() => navigate(`/dashboard/properties/${property.id}`)}
          >
            <img
              src={currentImg}
              alt={property.title}
              className="absolute inset-0 w-full h-full object-cover opacity-60 transition-all duration-1000 group-hover:scale-110 group-hover:opacity-70"
            />
            <h3 className="absolute left-4 bottom-3 text-lg sm:text-xl md:text-2xl text-white font-semibold drop-shadow-lg">
              {property.title}
            </h3>
            <div className="absolute left-3 top-3 flex flex-col gap-1 z-10">
              <Badge className={getStatusColor(property.status)}>
                {formatStatus(property.status)}
              </Badge>
              <span className="bg-blue-700 text-white px-1 py-0.5 rounded text-xs font-bold shadow">€{mainSharePrice.toLocaleString()}</span>
            </div>
            <div className="absolute right-3 top-3 flex flex-col gap-1 z-10">
              <Button
                variant="outline"
                size="sm"
                onClick={e => { e.stopPropagation(); navigate(`/dashboard/properties/${property.id}/edit`); }}
              >
                <HiOutlinePencil className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={e => { e.stopPropagation(); onDelete(property.id); }}
              >
                <HiOutlineTrash className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={e => { e.stopPropagation(); navigate(`/dashboard/properties/${property.id}`); }}
              >
                <HiOutlineEye className="h-5 w-5" />
              </Button>
            </div>
            <div className="absolute left-3 bottom-14 flex flex-col gap-0.5 z-10 bg-black/50 rounded-lg px-2 py-1 text-white text-xs min-w-[110px]">
              <div className="flex items-center gap-2">
                <HiOutlineHome className="w-4 h-4 sm:w-7 sm:h-7" />
                <span>{property.bedrooms || 0} hab.</span>
                <HiOutlineUser className="w-4 h-4 ml-3 sm:w-7 sm:h-7 sm:ml-4" />
                <span>{property.bathrooms || 0} baños</span>
              </div>
              <div className="flex items-center gap-2">
                <HiOutlineDocumentText className="w-4 h-4 sm:w-7 sm:h-7" />
                <span>{property.area || 0} m²</span>
              </div>
              <div className="flex items-center gap-2">
                <HiOutlineMapPin className="w-4 h-4 sm:w-7 sm:h-7" />
                <span className="truncate max-w-[120px]">{property.location}</span>
              </div>
            </div>
            <CardContent className="pt-[120px] sm:pt-[140px] md:pt-[160px] pb-2 px-4 font-poppins" />
          </Card>
        );
      })}
    </div>
  );
};

export default PropertiesList; 