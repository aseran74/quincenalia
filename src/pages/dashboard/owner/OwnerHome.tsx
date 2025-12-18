import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { AlertTriangle, Calendar, Home, MessageSquare, Star } from 'lucide-react';

const OwnerHome = () => {
  const { user, loading: authLoading } = useAuth();
  const [property, setProperty] = useState<{ id: string; title: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [ownerPoints, setOwnerPoints] = useState<number | null>(null);
  const [pointsLoading, setPointsLoading] = useState(true);

  useEffect(() => {
    const fetchOwnerPoints = async () => {
      if (!user?.id) {
        setPointsLoading(false);
        setOwnerPoints(null);
        return;
      }
      setPointsLoading(true);
      try {
        const { data, error } = await supabase
          .from('owner_points')
          .select('points')
          .eq('owner_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching owner points:', error);
          setOwnerPoints(0);
        } else if (data) {
          setOwnerPoints(typeof data.points === 'number' ? data.points : 0);
        } else {
          setOwnerPoints(0);
        }
      } catch (error) {
        console.error('Unexpected error fetching owner points:', error);
        setOwnerPoints(0);
      } finally {
        setPointsLoading(false);
      }
    };

    if (user && user.role === 'owner') {
      fetchOwnerPoints();
    }

  }, [user?.id, user?.role]);

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
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold">Panel de Propietario</h1>
        <p className="text-muted-foreground">
          Gestiona reservas, incidencias, mensajes y tus puntos de intercambio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Puntos disponibles
            </CardTitle>
            <CardDescription>Para intercambios</CardDescription>
          </CardHeader>
          <CardContent>
            {authLoading || pointsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-bold">
                {typeof ownerPoints === 'number' ? ownerPoints : 0}
              </div>
            )}
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link to="/dashboard/owner/exchange">Ir a intercambio</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Home className="h-4 w-4" />
              Tu propiedad
            </CardTitle>
            <CardDescription>Propiedad asignada (si existe)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {authLoading || loading ? (
              <>
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </>
            ) : (
              <div className="text-base font-semibold">
                {property ? property.title : 'Aún no tienes una propiedad asignada'}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button asChild variant="outline" className="w-full">
                <Link to="/dashboard/owner/reservations">
                  <Calendar className="h-4 w-4 mr-2" />
                  Reservas
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/dashboard/owner/incidents">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Incidencias
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/dashboard/owner/messages">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Mensajes
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>¿Qué puedes hacer?</CardTitle>
            <CardDescription>Accesos rápidos a tus tareas frecuentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>- Ver y gestionar tus reservas de semanas</li>
              <li>- Crear y dar seguimiento a incidencias</li>
              <li>- Consultar tus facturas</li>
              <li>- Ver mensajes del administrador</li>
              <li>- Intercambiar estancias mediante puntos</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>¿Necesitas ayuda?</CardTitle>
            <CardDescription>Soporte y resolución de problemas</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              Si tienes alguna duda o problema, crea una incidencia o contacta con el administrador.
            </p>
            <Button asChild className="w-full">
              <Link to="/dashboard/owner/incidents">Crear / ver incidencias</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OwnerHome; 