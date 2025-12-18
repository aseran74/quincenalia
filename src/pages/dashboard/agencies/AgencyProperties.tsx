import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Eye } from 'lucide-react';
import { Property } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

const AgencyProperties: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [agencyId, setAgencyId] = useState<string | null>(null);

  useEffect(() => {
    fetchAgencyIdAndProperties();
  }, [user]);

  const fetchAgencyIdAndProperties = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Obtener agency_id del perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('agency_id')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile?.agency_id) {
        toast({
          title: 'Sin agencia asignada',
          description: 'Tu perfil no está asociado a ninguna agencia.',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      setAgencyId(profile.agency_id);

      // Obtener agentes de la agencia
      const { data: agents, error: agentsError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'agent')
        .eq('agency_id', profile.agency_id);

      if (agentsError) throw agentsError;

      const agentIds = agents?.map(a => a.id) || [];

      // Obtener propiedades: por agency_id directo O por agent_id de los agentes
      let propertiesQuery = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (agentIds.length > 0) {
        propertiesQuery = propertiesQuery.or(
          `agency_id.eq.${profile.agency_id},agent_id.in.(${agentIds.join(',')})`
        );
      } else {
        propertiesQuery = propertiesQuery.eq('agency_id', profile.agency_id);
      }

      const { data: propertiesData, error: propertiesError } = await propertiesQuery;

      if (propertiesError) throw propertiesError;
      setProperties(propertiesData || []);

    } catch (error: any) {
      console.error('Error fetching properties:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las propiedades.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mis Viviendas</h1>
        <p className="text-muted-foreground mt-1">
          Propiedades gestionadas por tu agencia
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Para dar de alta nuevas propiedades, contacta con el administrador.
        </p>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-2">No hay propiedades registradas</p>
            <p className="text-sm text-muted-foreground">
              Contacta con el administrador para dar de alta nuevas propiedades.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {property.image_url && (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={property.image_url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="line-clamp-2">{property.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">{property.location}</p>
                  <p className="text-2xl font-bold text-primary">
                    {property.price?.toLocaleString('es-ES')}€
                  </p>
                  <div className="flex gap-4 text-muted-foreground">
                    <span>{property.bedrooms} hab.</span>
                    <span>{property.bathrooms} baños</span>
                    <span>{property.area} m²</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/dashboard/agencies/properties/${property.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgencyProperties;
