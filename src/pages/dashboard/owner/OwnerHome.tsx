import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Owner } from '@/types/user';

const OwnerHome = () => {
  const { user, loading: authLoading } = useAuth();
  const [property, setProperty] = useState<{ id: string; title: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('User object in OwnerHome:', user);
  }, [user]);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!user?.id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('id, title')
        .or(`share1_owner_id.eq.${user.id},share2_owner_id.eq.${user.id},share3_owner_id.eq.${user.id},share4_owner_id.eq.${user.id}`)
        .order('title')
        .limit(1)
        .single();
      if (!error && data) {
        setProperty(data);
      } else {
        setProperty(null);
      }
      setLoading(false);
    };
    if (user?.id) fetchProperty();
  }, [user?.id]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Bienvenido a tu Panel de Propietario</h1>
      
      {/* Display user points here */}
      {/* Check if auth is not loading, user exists, is owner, and points property exists */}
      {!authLoading && user && user.role === 'owner' && 'points' in user && (
         <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <h2 className="text-lg font-semibold mb-2 text-blue-800">Tus Puntos</h2>
            {/* Access points using Owner type assertion, ensuring it's a number */}
            <p className="text-blue-700 text-xl font-bold">{(user as Owner).points} Puntos</p> 
         </Card>
      )}

      {/* Show loading message while auth is loading */}
      {authLoading && <p>Cargando información del usuario...</p>}

      <Card className="p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Tu Propiedad</h2>
        <p className="text-gray-600">
          {loading ? 'Cargando...' : property ? property.title : 'No tienes ninguna propiedad asignada'}
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">¿Qué puedes hacer?</h2>
          <ul className="space-y-2 text-gray-600">
            <li>• Ver y gestionar tus reservas de semanas</li>
            <li>• Crear y dar seguimiento a incidencias</li>
            <li>• Consultar tus facturas</li>
            <li>• Ver mensajes del administrador</li>
            <li>• Intercambiar estancias mdaiante Guest points</li>
          </ul>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">Necesitas ayuda?</h2>
          <p className="text-gray-600">
            Si tienes alguna duda o problema, puedes crear una incidencia
            o contactar directamente con el administrador.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default OwnerHome; 