import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CalendarDays, CreditCard, MessageSquare, ShieldAlert, Sparkles, ArrowRight, Home } from 'lucide-react';

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
          .maybeSingle();

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
        .maybeSingle();
      if (!error && data) {
        setProperty(data);
      } else {
        setProperty(null);
      }
      setLoading(false);
    };
    if (user?.id) fetchProperty();
  }, [user?.id]);

  const displayName = useMemo(() => {
    if (!user) return 'Propietario';
    return user.name || (user.email ? user.email.split('@')[0] : 'Propietario');
  }, [user]);

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Hero */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-blue-700" />
            Panel de propietario
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Hola, {displayName}
          </h1>
          <p className="mt-1 text-slate-600">
            Gestiona tus semanas, incidencias, facturas y mensajes desde un único lugar.
          </p>
        </div>

        {/* Cards KPI */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Card className="relative overflow-hidden border-slate-200/60 bg-white/70 shadow-sm backdrop-blur">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-indigo-600/10" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center justify-between text-sm font-semibold text-slate-700">
                Tus puntos
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10 text-blue-700">
                  <Sparkles className="h-4 w-4" />
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {authLoading || pointsLoading ? (
                <div className="h-8 w-32 animate-pulse rounded bg-slate-200/70" />
              ) : (
                <div className="text-3xl font-bold text-slate-900">
                  {typeof ownerPoints === 'number' ? ownerPoints : 0}
                  <span className="ml-2 text-base font-semibold text-slate-500">pts</span>
                </div>
              )}
              <p className="mt-2 text-sm text-slate-600">
                Los puntos se usan para canjes y beneficios en la plataforma.
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-slate-200/60 bg-white/70 shadow-sm backdrop-blur">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-transparent to-teal-600/10" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center justify-between text-sm font-semibold text-slate-700">
                Tu propiedad
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-700">
                  <Home className="h-4 w-4" />
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-6 w-4/5 animate-pulse rounded bg-slate-200/70" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200/70" />
                </div>
              ) : property ? (
                <div>
                  <div className="text-lg font-semibold text-slate-900 line-clamp-2">{property.title}</div>
                  <div className="mt-3">
                    <Button asChild variant="outline" className="bg-white/60">
                      <Link to={`/properties/${property.id}`}>
                        Ver detalles <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-600">
                  No tienes ninguna propiedad asignada todavía.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-slate-200/60 bg-white/70 shadow-sm backdrop-blur">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-fuchsia-600/10 via-transparent to-rose-600/10" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center justify-between text-sm font-semibold text-slate-700">
                Acciones rápidas
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-600/10 text-fuchsia-700">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline" className="justify-start bg-white/60">
                  <Link to="/dashboard/owner/reservations">
                    <CalendarDays className="mr-2 h-4 w-4 text-blue-700" />
                    Reservas
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start bg-white/60">
                  <Link to="/dashboard/owner/incidents">
                    <ShieldAlert className="mr-2 h-4 w-4 text-amber-700" />
                    Incidencias
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start bg-white/60">
                  <Link to="/dashboard/owner/messages">
                    <MessageSquare className="mr-2 h-4 w-4 text-emerald-700" />
                    Mensajes
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start bg-white/60">
                  <Link to="/dashboard/owner/invoices">
                    <CreditCard className="mr-2 h-4 w-4 text-fuchsia-700" />
                    Facturas
                  </Link>
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild className="bg-blue-700 hover:bg-blue-800">
                  <Link to="/dashboard/owner/exchange">Intercambio</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link to="/dashboard/owner/explorar">Explorar intercambios</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info/guía */}
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Card className="border-slate-200/60 bg-white/70 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">¿Qué puedes hacer aquí?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>- Reservar semanas y ver disponibilidad.</li>
                <li>- Crear y hacer seguimiento de incidencias.</li>
                <li>- Consultar facturas y documentación.</li>
                <li>- Hablar con administración por mensajes.</li>
                <li>- Intercambiar estancias con tus puntos.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 bg-white/70 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">Consejo rápido</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Si ves un problema en una vivienda o con una reserva, crea una incidencia y adjunta
                la información importante para que podamos resolverlo más rápido.
              </p>
              <div className="mt-4">
                <Button asChild variant="outline" className="bg-white/60">
                  <Link to="/dashboard/owner/incidents">
                    Crear / ver incidencias <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OwnerHome;
