import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import { Bed, Bath, SquareArrowUp, MapPin, ChevronDown } from 'lucide-react';

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
      <Card className="overflow-hidden h-full flex flex-col border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 bg-card">
        <div className="relative overflow-hidden h-48 flex-shrink-0">
          {minShare && (
            <span className="absolute top-2 left-2 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full shadow z-10">
              Desde {formatPriceSimple(minShare)}
            </span>
          )}
          <img
            src={imageUrl}
            alt={`Imagen de ${property.title}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-property.jpg'; }}
          />
          <span className="absolute bottom-2 left-2 bg-white/80 text-xs text-muted-foreground px-2 py-1 rounded shadow">
            Precio total: {formatPriceSimple(property.price)}
          </span>
        </div>
        <CardContent className="flex-1 flex flex-col">
          <h3 className="text-base font-semibold mb-1 text-card-foreground truncate" title={property.title}>
            {property.title}
          </h3>
          <div className="flex items-center text-xs text-muted-foreground space-x-3 mb-2">
            <span className="flex items-center" title={`${property.bedrooms} habitaciones`}>
              <Bed className="w-3.5 h-3.5 mr-1"/> {property.bedrooms}
            </span>
            <span className="flex items-center" title={`${property.bathrooms} baños`}>
              <Bath className="w-3.5 h-3.5 mr-1"/> {property.bathrooms}
            </span>
            <span className="flex items-center" title={`${property.area} m²`}>
              <SquareArrowUp className="w-3.5 h-3.5 mr-1"/> {property.area}m²
            </span>
          </div>
          {property.location && (
            <p className="text-xs text-muted-foreground mb-3 flex items-center mt-auto pt-2">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0"/>
              <span className="truncate">{property.location}</span>
            </p>
          )}
        </CardContent>
        {monthly && (
          <CardFooter className="bg-blue-50 border-t px-4 py-2 flex items-center justify-between">
            <span className="text-primary font-semibold text-base">{monthly.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span className="text-xs text-gray-500 font-normal">/mes*</span></span>
          </CardFooter>
        )}
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
          .limit(6);
        
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
    <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-8">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}; 