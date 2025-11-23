import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const { user, isAuthenticated } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      setLoading(true);
      // Obtener los favoritos del usuario y las propiedades asociadas
      const { data, error } = await supabase
        .from('favorites')
        .select('property_id, properties(*)')
        .eq('user_id', user.id);
      if (!error && data) {
        // Extraer las propiedades asociadas
        setProperties(data.map((fav: any) => fav.properties));
      }
      setLoading(false);
    };
    if (user) fetchFavorites();
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-6">Favoritos</h1>
        <p>Debes iniciar sesión para ver tus favoritos.</p>
        <Button asChild className="mt-4">
          <Link to="/login">Iniciar sesión</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Mis favoritos</h1>
      {loading ? (
        <p>Cargando favoritos...</p>
      ) : properties.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">No tienes propiedades guardadas como favoritas.</Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites; 