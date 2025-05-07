import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import { Bed, Bath, SquareArrowUp, MapPin, ChevronDown, Home } from 'lucide-react';

type Property = Database['public']['Tables']['properties']['Row'];

const formatPriceSimple = (price: number) => {
  return price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

function getMinSharePrice(property: any): number | null {
  const shares = [property.share1_price, property.share2_price, property.share3_price, property.share4_price].filter((p: any): p is number => typeof p === 'number');
  if (shares.length === 0) return null;
  return Math.min(...shares);
}

const calculateMonthlyPayment = (sharePrice: number): number => {
  if (!sharePrice || sharePrice <= 0) return 0;
  const downPayment = sharePrice * 0.3;
  const loanAmount = sharePrice - downPayment;
  if (loanAmount <= 0) return 0;
  const interestRate = 2.1 / 100 / 12;
  const numberOfPayments = 20 * 12;
  if (interestRate === 0) return loanAmount / numberOfPayments;
  const monthlyPayment = loanAmount * interestRate * Math.pow(1 + interestRate, numberOfPayments) /
    (Math.pow(1 + interestRate, numberOfPayments) - 1);
  return isFinite(monthlyPayment) ? Math.round(monthlyPayment) : 0;
};

const PropertyCard = ({ property }: { property: any }) => {
  const imageUrl = property.images && property.images.length > 0 ? property.images[0] : '/placeholder-property.jpg';
  const minShare = getMinSharePrice(property);
  const monthly = minShare ? calculateMonthlyPayment(minShare) : null;
  return (
    <Link to={`/properties/${property.id}`} className="group block h-full">
      <Card className="overflow-hidden h-80 flex flex-col border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 bg-card p-0">
        <div className="relative w-full h-full flex-1">
          <img
            src={imageUrl}
            alt={`Imagen de ${property.title}`}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 z-0"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-property.jpg'; }}
          />
          {/* Overlay translúcido gris */}
          <div className="absolute inset-0 z-10 flex flex-col justify-between">
            {/* Badge minShare y precio total */}
            <div className="flex justify-between items-start p-4">
              {minShare && (
                <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full shadow z-20">
                  Desde {formatPriceSimple(minShare)}
                </span>
              )}
              <span className="bg-white/80 text-xs text-muted-foreground px-2 py-1 rounded shadow z-20 ml-auto">
                Precio total: {formatPriceSimple(property.price)}
              </span>
            </div>
            {/* Contenido principal sobre la imagen */}
            <div className="flex-1 flex flex-col justify-center items-start px-6 pb-6 pt-2 z-20">
              {/* Bloque de info abajo a la derecha en escritorio, centrado abajo en móvil */}
              <div
                className="bg-gray-900/70 rounded-lg px-4 py-2 drop-shadow flex flex-col gap-1 max-w-[90%] absolute right-4 bottom-4 sm:right-4 sm:bottom-4 z-20"
                style={{ minWidth: '180px' }}
              >
                <h3 className="text-lg font-bold mb-2 text-white drop-shadow truncate w-full" title={property.title}>
                  {property.title}
                </h3>
                <div className="flex flex-wrap sm:flex-nowrap items-center text-xs text-primary space-x-0 sm:space-x-6 mb-2 gap-y-2">
                  {/* Tipo de vivienda */}
                  {property.type && (
                    <span className="flex items-center gap-1 border-r border-primary/30 pr-3 sm:pr-6 last:border-none" title={property.type}>
                      <Home className="w-4 h-4 text-white" />
                      <span className="font-medium text-white">{property.type}</span>
                    </span>
                  )}
                  {/* Habitaciones */}
                  <span className="flex items-center gap-1 border-r border-primary/30 pr-3 sm:pr-6 last:border-none" title={`${property.bedrooms} habitaciones`}>
                    <Bed className="w-4 h-4 text-white" />
                    <span className="font-medium text-white">{property.bedrooms}</span>
                  </span>
                  {/* Baños */}
                  <span className="flex items-center gap-1 border-r border-primary/30 pr-3 sm:pr-6 last:border-none" title={`${property.bathrooms} baños`}>
                    <Bath className="w-4 h-4 text-white" />
                    <span className="font-medium text-white">{property.bathrooms}</span>
                  </span>
                  {/* Metros cuadrados */}
                  <span className="flex items-center gap-1" title={`${property.area} m²`}>
                    <SquareArrowUp className="w-4 h-4 text-white" />
                    <span className="font-medium text-white">{property.area}m²</span>
                  </span>
                </div>
                {property.location && (
                  <p className="text-xs text-gray-200 mb-1 flex items-center">
                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0"/>
                    <span className="truncate">{property.location}</span>
                  </p>
                )}
              </div>
            </div>
            {/* Footer sobre la imagen */}
            {monthly && (
              <div className="px-6 pb-4 pt-2">
                <span className="inline-block bg-primary/90 text-white font-semibold text-base px-4 py-2 rounded-lg shadow">
                  {monthly.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span className="text-xs text-gray-200 font-normal">/mes*</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

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
          .eq('destacada', true)
          .limit(4);
        
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}; 