import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageSquare, Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ProfilePanel: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [ownerPoints, setOwnerPoints] = useState<number | null>(null);
  const [pointsLoading, setPointsLoading] = useState(true);

  // Estados para interesados
  const [favoriteProperties, setFavoriteProperties] = useState<any[]>([]);
  const [contactRequests, setContactRequests] = useState<any[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [userRoleFromDB, setUserRoleFromDB] = useState<string | null>(null);

  useEffect(() => {
    const fetchOwnerPoints = async () => {
      if (!user?.id || user.role !== 'owner') {
        setPointsLoading(false);
        setOwnerPoints(null);
        return;
      }
      setPointsLoading(true);
      try {
        const { data, error } = await supabase
          .from('owner_points')
          .select('points')
          .eq('user_id', user.id)
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

    if (user?.id && user.role === 'owner') {
      fetchOwnerPoints();
    } else {
       setPointsLoading(false);
       setOwnerPoints(null);
    }

  }, [user?.id, user?.role]);

  // Obtener el rol directamente de la base de datos como respaldo
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setUserRoleFromDB(data.role);
          console.log('ProfilePanel - Role from DB:', data.role);
        }
      } catch (error) {
        console.error('Error fetching role from DB:', error);
      }
    };

    if (user?.id) {
      fetchUserRole();
    }
  }, [user?.id]);

  // Fetch favoritos y solicitudes de contacto para interesados
  useEffect(() => {
    // Verificar si el usuario es interesado (usar rol del contexto o de la DB)
    const currentRole = user?.role || userRoleFromDB;
    const isInterested = currentRole === 'interested' || currentRole?.toLowerCase() === 'interested';

    if (isInterested && user?.id) {
      fetchFavorites();
      fetchContactRequests();
    }
  }, [user, userRoleFromDB]);

  const fetchFavorites = async () => {
    if (!user?.id) return;
    setFavoritesLoading(true);
    try {
      // Primero obtener los IDs de propiedades favoritas
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);

      if (favoritesError) {
        // Si la tabla no existe o hay error de permisos, simplemente retornar vacío
        if (favoritesError.code === 'PGRST116' || favoritesError.code === '42P01' || favoritesError.message?.includes('permission')) {
          console.warn('Favorites table not accessible:', favoritesError.message);
          setFavoriteProperties([]);
          return;
        }
        throw favoritesError;
      }

      if (!favoritesData || favoritesData.length === 0) {
        setFavoriteProperties([]);
        return;
      }

      // Luego obtener las propiedades usando los IDs
      const propertyIds = favoritesData.map((fav: any) => fav.property_id).filter(Boolean);

      if (propertyIds.length === 0) {
        setFavoriteProperties([]);
        return;
      }

      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .in('id', propertyIds);

      if (propertiesError) {
        console.warn('Error fetching properties for favorites:', propertiesError.message);
        setFavoriteProperties([]);
        return;
      }
      setFavoriteProperties(propertiesData || []);
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      setFavoriteProperties([]);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const fetchContactRequests = async () => {
    if (!user?.email) return;
    setRequestsLoading(true);
    try {
      // Obtener las solicitudes de contacto
      const { data: requestsData, error: requestsError } = await supabase
        .from('contact_requests')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false });

      if (requestsError) {
        // Si la tabla no existe o hay error de permisos, simplemente retornar vacío
        if (requestsError.code === 'PGRST116' || requestsError.code === '42P01' || requestsError.message?.includes('permission')) {
          console.warn('Contact requests table not accessible:', requestsError.message);
          setContactRequests([]);
          return;
        }
        throw requestsError;
      }

      if (!requestsData || requestsData.length === 0) {
        setContactRequests([]);
        return;
      }

      // Obtener información de propiedades si hay property_id
      const requestsWithProperties = await Promise.all(
        requestsData.map(async (request: any) => {
          if (request.property_id) {
            try {
              const { data: propertyData, error: propertyError } = await supabase
                .from('properties')
                .select('id, title, location')
                .eq('id', request.property_id)
                .single();

              if (propertyError) {
                console.warn('Error fetching property for request:', propertyError.message);
                return {
                  ...request,
                  properties: null
                };
              }

              return {
                ...request,
                properties: propertyData || null
              };
            } catch (error: any) {
              console.warn('Error fetching property for request:', error?.message || error);
              return {
                ...request,
                properties: null
              };
            }
          }
          return {
            ...request,
            properties: null
          };
        })
      );

      setContactRequests(requestsWithProperties);
    } catch (error: any) {
      console.error('Error fetching contact requests:', error?.message || error);
      setContactRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    let photoUrl = user?.profileImage || '';
    try {
      if (photo) {
        const { data, error } = await supabase.storage
          .from('profile')
          .upload(`profile_${user.id}_${Date.now()}`, photo, { upsert: true });
        if (error) throw error;
        const { data: publicData } = supabase.storage.from('profile').getPublicUrl(data.path);
        photoUrl = publicData.publicUrl;
      }
      // Actualizar datos en la tabla de perfiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ name, profile_image: photoUrl })
        .eq('id', user.id);
      if (updateError) throw updateError;
      toast.success('Perfil actualizado');
    } catch (err: any) {
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Mi perfil</h1>

      {user && user.role === 'owner' && !pointsLoading && (
         <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <h2 className="text-lg font-semibold mb-2 text-blue-800">Tus Puntos</h2>
            <p className="text-blue-700 text-xl font-bold">
               {typeof ownerPoints === 'number' ? `${ownerPoints} Puntos` : 'Cargando...'}
            </p>
         </Card>
      )}

      {user && user.role === 'owner' && pointsLoading && <p>Cargando puntos...</p>}

      <div className="max-w-lg mx-auto mt-10 bg-white p-8 rounded shadow">
        <div className="flex flex-col items-center mb-6">
          <img
            src={photo ? URL.createObjectURL(photo) : user?.profileImage || '/default-avatar.png'}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover mb-2"
          />
          <input type="file" accept="image/*" onChange={handlePhotoChange} className="mb-2" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <Input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input value={user?.email || ''} disabled />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Rol</label>
          <Input value={user?.role || ''} disabled />
        </div>
        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>


      {/* Sección especial para interesados */}
      {user && (user.role === 'interested' ||
                user.role?.toLowerCase() === 'interested' ||
                userRoleFromDB === 'interested') && (
        <div className="max-w-6xl mx-auto mt-8">
          <Tabs defaultValue="favorites" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Mis Favoritos ({favoriteProperties.length})
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Solicitudes de Contacto ({contactRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="favorites" className="mt-6">
              {favoritesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : favoriteProperties.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Heart className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No tienes propiedades favoritas</p>
                    <p className="text-gray-400 text-sm">Las propiedades que marques como favoritas aparecerán aquí</p>
                    <Button asChild variant="outline" className="mt-4">
                      <Link to="/properties">Explorar Propiedades</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteProperties.map((property: any) => (
                    <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {property.image_url && (
                        <div className="aspect-video w-full overflow-hidden bg-gray-200">
                          <img
                            src={property.image_url}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-lg line-clamp-2">{property.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          <p className="text-sm text-gray-600">{property.location}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{property.bedrooms} hab.</span>
                            <span>{property.bathrooms} baños</span>
                            <span>{property.area} m²</span>
                          </div>
                          <p className="text-lg font-semibold text-blue-600">
                            €{property.price?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate(`/properties/${property.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="requests" className="mt-6">
              {requestsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : contactRequests.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No has enviado solicitudes de contacto</p>
                    <p className="text-gray-400 text-sm">Las solicitudes que envíes aparecerán aquí</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {contactRequests.map((request: any) => (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-lg">{request.name}</CardTitle>
                              <Badge
                                variant={
                                  request.status === 'pendiente'
                                    ? 'default'
                                    : request.status === 'contactado'
                                    ? 'secondary'
                                    : request.status === 'enviado_documentacion'
                                    ? 'outline'
                                    : 'destructive'
                                }
                              >
                                {request.status === 'pendiente'
                                  ? 'Pendiente'
                                  : request.status === 'contactado'
                                  ? 'Contactado'
                                  : request.status === 'enviado_documentacion'
                                  ? 'Documentación Enviada'
                                  : 'No Interesado'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(request.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", {
                                locale: es,
                              })}
                            </div>
                            {request.properties && (
                              <div className="text-sm text-gray-600 mb-2">
                                <strong>Propiedad:</strong> {request.properties.title} - {request.properties.location}
                              </div>
                            )}
                            {request.message && (
                              <p className="text-sm text-gray-700 mt-2 whitespace-pre-line bg-gray-50 p-3 rounded">
                                {request.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default ProfilePanel; 