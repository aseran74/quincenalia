import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Calendar, Eye, Heart, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

type FavoriteRow = {
  property_id: string | null;
};

type PropertyLite = {
  id: string;
  title: string;
  location: string;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  image_url: string | null;
};

type ContactRequestRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: 'pendiente' | 'contactado' | 'enviado_documentacion' | 'no_interesado' | string;
  agent_id: string | null;
  property_id: string | null;
  created_at: string;
};

type ProfileLite = {
  id: string;
  name: string | null;
  profile_image: string | null;
  email?: string | null;
};

type AgentLite = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
};

function statusLabel(status: ContactRequestRow['status']) {
  switch (status) {
    case 'pendiente':
      return 'Pendiente';
    case 'contactado':
      return 'Contactado';
    case 'enviado_documentacion':
      return 'Documentación enviada';
    case 'no_interesado':
      return 'No interesado';
    default:
      return status;
  }
}

function statusVariant(status: ContactRequestRow['status']): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'pendiente':
      return 'default';
    case 'contactado':
      return 'secondary';
    case 'enviado_documentacion':
      return 'outline';
    case 'no_interesado':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default function InterestedDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'favorites' | 'requests'>('favorites');

  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [favoriteProperties, setFavoriteProperties] = useState<PropertyLite[]>([]);

  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requests, setRequests] = useState<ContactRequestRow[]>([]);
  const [propertiesById, setPropertiesById] = useState<Record<string, PropertyLite>>({});
  const [agentsById, setAgentsById] = useState<Record<string, ProfileLite>>({});

  const canQueryFavorites = Boolean(user?.id);
  const canQueryRequests = Boolean(user?.email);

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      // Favoritos
      setFavoritesLoading(true);
      try {
        const { data: favs, error: favsError } = await supabase
          .from('favorites')
          .select('property_id')
          .eq('user_id', user.id)
          .returns<FavoriteRow[]>();

        if (favsError) throw favsError;

        const ids = (favs || []).map((f) => f.property_id).filter((id): id is string => Boolean(id));
        if (ids.length === 0) {
          setFavoriteProperties([]);
        } else {
          const { data: props, error: propsError } = await supabase
            .from('properties')
            .select('id, title, location, price, bedrooms, bathrooms, area, image_url')
            .in('id', ids)
            .returns<PropertyLite[]>();

          if (propsError) throw propsError;
          setFavoriteProperties(props || []);
        }
      } catch (e: any) {
        console.error('Error cargando favoritos:', e);
        setFavoriteProperties([]);
        toast({
          title: 'No se pudieron cargar los favoritos',
          description: e?.message || 'Revisa permisos / conexión',
          variant: 'destructive',
        });
      } finally {
        setFavoritesLoading(false);
      }

      // Solicitudes
      setRequestsLoading(true);
      try {
        const { data: reqs, error: reqsError } = await supabase
          .from('contact_requests')
          .select('id, name, email, phone, message, status, agent_id, property_id, created_at')
          .eq('email', user.email)
          .order('created_at', { ascending: false })
          .returns<ContactRequestRow[]>();

        if (reqsError) throw reqsError;
        const safeReqs = reqs || [];
        setRequests(safeReqs);

        const propertyIds = Array.from(
          new Set(safeReqs.map((r) => r.property_id).filter((id): id is string => Boolean(id))),
        );
        const agentIds = Array.from(
          new Set(safeReqs.map((r) => r.agent_id).filter((id): id is string => Boolean(id))),
        );

        // Fetch propiedades en lote
        if (propertyIds.length > 0) {
          const { data: props, error: propsError } = await supabase
            .from('properties')
            .select('id, title, location, price, bedrooms, bathrooms, area, image_url')
            .in('id', propertyIds)
            .returns<PropertyLite[]>();

          if (propsError) throw propsError;
          const map: Record<string, PropertyLite> = {};
          (props || []).forEach((p) => {
            map[p.id] = p;
          });
          setPropertiesById(map);
        } else {
          setPropertiesById({});
        }

        // Fetch agentes/gestores en lote (primero profiles, luego fallback a tabla agents)
        if (agentIds.length > 0) {
          const { data: agents, error: agentsError } = await supabase
            .from('profiles')
            .select('id, name, profile_image')
            .in('id', agentIds)
            .returns<ProfileLite[]>();

          const map: Record<string, ProfileLite> = {};
          (agents || []).forEach((a) => {
            map[a.id] = a;
          });

          if (agentsError) {
            // Si falla por tipo/ids no-UUID o permisos, probamos con la tabla agents (schema legacy)
            console.warn('No se pudieron cargar gestores desde profiles:', agentsError);
          }

          // Fallback: tabla agents (si existe)
          try {
            const { data: agents2, error: agents2Error } = await supabase
              .from('agents')
              .select('id, name, email, phone')
              .in('id', agentIds)
              .returns<AgentLite[]>();

            if (agents2Error) {
              // Si no existe o no hay permisos, no bloqueamos
              console.warn('No se pudieron cargar gestores desde agents:', agents2Error);
            } else {
              (agents2 || []).forEach((a) => {
                // Si no hay perfil en profiles, rellenamos desde agents
                if (!map[a.id]) {
                  map[a.id] = {
                    id: a.id,
                    name: a.name,
                    profile_image: null,
                    email: a.email,
                  };
                }
              });
            }
          } catch (e) {
            console.warn('Fallback agents falló:', e);
          }

          setAgentsById(map);
        } else {
          setAgentsById({});
        }
      } catch (e: any) {
        console.error('Error cargando solicitudes:', e);
        setRequests([]);
        setPropertiesById({});
        setAgentsById({});
        toast({
          title: 'No se pudieron cargar las solicitudes',
          description: e?.message || 'Revisa permisos / conexión',
          variant: 'destructive',
        });
      } finally {
        setRequestsLoading(false);
      }
    };

    // Evitar disparar antes de tener datos mínimos
    if (user?.role === 'interested') {
      void load();
    }
  }, [user]);

  const favoritesCount = favoriteProperties.length;
  const requestsCount = requests.length;

  const warningText = useMemo(() => {
    if (!user) return 'Debes iniciar sesión.';
    if (user.role !== 'interested') return 'Este panel es para usuarios interesados.';
    if (!canQueryRequests) return 'No tenemos tu email cargado; no se pueden mostrar solicitudes.';
    if (!canQueryFavorites) return 'No tenemos tu ID; no se pueden mostrar favoritos.';
    return null;
  }, [user, canQueryFavorites, canQueryRequests]);

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="py-10 text-center text-gray-600">Debes iniciar sesión.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mi panel</h1>
        <p className="text-gray-600 mt-1">
          Gestiona tus <b>favoritos</b> y tus <b>solicitudes de contacto</b>.
        </p>
      </div>

      {warningText && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="py-4 text-sm text-yellow-800">{warningText}</CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'favorites' | 'requests')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Favoritos ({favoritesCount})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Solicitudes ({requestsCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="mt-6">
          {favoritesLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : favoriteProperties.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Heart className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-700 font-medium mb-1">No tienes favoritos</p>
                <p className="text-gray-500 text-sm text-center">
                  Marca propiedades con el corazón para verlas aquí.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/properties')}>
                  Explorar propiedades
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProperties.map((p) => (
                <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {p.image_url && (
                    <div className="aspect-video w-full overflow-hidden bg-gray-200">
                      <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{p.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">{p.location}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {typeof p.bedrooms === 'number' && <span>{p.bedrooms} hab.</span>}
                        {typeof p.bathrooms === 'number' && <span>{p.bathrooms} baños</span>}
                        {typeof p.area === 'number' && <span>{p.area} m²</span>}
                      </div>
                      <p className="text-lg font-semibold text-blue-600">
                        €{(p.price ?? 0).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => navigate(`/properties/${p.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver detalles
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          {requestsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : requests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-700 font-medium mb-1">No has enviado solicitudes</p>
                <p className="text-gray-500 text-sm text-center">
                  Cuando contactes con un gestor desde una propiedad, aparecerá aquí el estado.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((r) => {
                const property = r.property_id ? propertiesById[r.property_id] : undefined;
                const agent = r.agent_id ? agentsById[r.agent_id] : undefined;

                return (
                  <Card key={r.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <CardTitle className="text-lg truncate">{r.name}</CardTitle>
                            <Badge variant={statusVariant(r.status)}>{statusLabel(r.status)}</Badge>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(r.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                          </div>

                          {property && (
                            <div className="mt-2 text-sm text-gray-700">
                              <b>Propiedad:</b> {property.title} — {property.location}
                            </div>
                          )}

                          {agent?.name && (
                            <div className="mt-1 text-sm text-gray-700">
                              <b>Gestor:</b> {agent.name}
                            </div>
                          )}

                          {r.message && (
                            <p className="mt-3 text-sm text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded">
                              {r.message}
                            </p>
                          )}
                        </div>

                        {property && (
                          <div className="shrink-0">
                            <Button variant="outline" onClick={() => navigate(`/properties/${property.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver propiedad
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

