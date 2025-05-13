import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import { Bed, Bath, SquareArrowUp, MapPin, Home } from 'lucide-react';

type Property = Database['public']['Tables']['properties']['Row'];

// --- Funciones auxiliares (sin cambios) ---
const formatPriceSimple = (price: number) => {
  return price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

function getMinSharePrice(property: any): number | null {
  const shares = [property.share1_price, property.share2_price, property.share3_price, property.share4_price].filter((p: any): p is number => typeof p === 'number' && p > 0);
  if (shares.length === 0) return null;
  return Math.min(...shares);
}

const calculateMonthlyPayment = (sharePrice: number): number => {
  if (!sharePrice || sharePrice <= 0) return 0;
  const downPayment = sharePrice * 0.3; // Ejemplo: 30% de entrada
  const loanAmount = sharePrice - downPayment;
  if (loanAmount <= 0) return 0; // No hay nada que financiar si la entrada cubre todo o más
  const annualInterestRate = 2.1; // Tasa de interés anual (ej. 2.1%)
  const interestRate = annualInterestRate / 100 / 12; // Tasa de interés mensual
  const numberOfPayments = 20 * 12; // Plazo en meses (ej. 20 años)

  // Si no hay interés o plazo, o el monto del préstamo es cero, el pago mensual es cero o indefinido.
  if (loanAmount === 0) return 0;
  if (interestRate === 0) return Math.round(loanAmount / numberOfPayments); // Préstamo sin interés

  const monthlyPayment = loanAmount * interestRate * Math.pow(1 + interestRate, numberOfPayments) /
    (Math.pow(1 + interestRate, numberOfPayments) - 1);

  return isFinite(monthlyPayment) ? Math.round(monthlyPayment) : 0;
};


// --- COMPONENTE PropertyCard CON PRECIO/MES ---
const PropertyCard = ({ property }: { property: any }) => {
  const imageUrl = property.images && property.images.length > 0 ? property.images[0] : '/placeholder-property.jpg';
  const minShare = getMinSharePrice(property);
  const monthly = minShare && minShare > 0 ? calculateMonthlyPayment(minShare) : null; // Calcular solo si hay minShare > 0

  return (
    <Link to={`/properties/${property.id}`} className="group block h-full">
      <Card className="overflow-hidden h-64 flex flex-col border border-border rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 bg-card p-0 group">
        <div className="relative w-full h-full flex-1">
          <img
            src={imageUrl}
            alt={`Imagen de ${property.title}`}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 z-0"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-property.jpg'; }}
          />
          <div className="absolute inset-0 z-10 flex flex-col justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 sm:p-3">
            {/* Badges superiores */}
            <div className="flex justify-between items-start w-full">
              {minShare && (
                <span className="bg-primary text-primary-foreground text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full shadow">
                  {formatPriceSimple(minShare)}
                </span>
              )}
              {/* Mostrar precio/mes en lugar de precio total */}
              {monthly !== null && monthly > 0 && (
                <span className="bg-secondary text-secondary-foreground text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full shadow ml-auto">
                  {formatPriceSimple(monthly)}<span className="font-normal">/mes*</span>
                </span>
              )}
            </div>

            {/* Contenido inferior sobre la imagen */}
            <div className="text-white mt-auto">
              <h3 className="text-sm sm:text-base font-bold mb-1 truncate" title={property.title}>
                {property.title}
              </h3>
              <div className="flex flex-wrap items-center text-xs gap-x-2 sm:gap-x-3 gap-y-0.5">
                {property.type && (
                  <span className="flex items-center gap-1" title={property.type}>
                    <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="text-[10px] sm:text-xs font-medium">{property.type.split(' ')[0]}</span>
                  </span>
                )}
                <span className="flex items-center gap-1" title={`${property.bedrooms} hab.`}>
                  <Bed className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="text-[10px] sm:text-xs font-medium">{property.bedrooms}</span>
                </span>
                <span className="flex items-center gap-1" title={`${property.bathrooms} baños`}>
                  <Bath className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="text-[10px] sm:text-xs font-medium">{property.bathrooms}</span>
                </span>
                <span className="flex items-center gap-1" title={`${property.area} m²`}>
                  <SquareArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="text-[10px] sm:text-xs font-medium">{property.area}m²</span>
                </span>
              </div>
              {property.location && (
                <p className="text-[10px] sm:text-xs text-gray-300 mt-1 flex items-center">
                  <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 flex-shrink-0"/>
                  <span className="truncate">{property.location}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

// El componente FeaturedProperties se mantiene igual que en la respuesta anterior.
export const FeaturedProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        // console.log('Fetching 8 featured properties from Supabase...');
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('destacada', true)
          .limit(8);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        // console.log('Properties received:', data);
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
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(8)].map((_, index) => (
          <Card key={index} className="overflow-hidden animate-pulse h-64">
            <div className="w-full h-3/5 bg-gray-300 dark:bg-gray-700" />
            <div className="p-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-1 w-3/4" />
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded mb-2 w-full" />
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No hay propiedades destacadas disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
};