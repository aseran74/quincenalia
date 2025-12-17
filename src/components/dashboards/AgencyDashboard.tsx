import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Users, Calendar, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface Agent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  photo_url?: string;
}

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
}

const AgencyDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [agencyAgents, setAgencyAgents] = useState<Agent[]>([]);
  const [agencyProperties, setAgencyProperties] = useState<Property[]>([]);
  const [propertiesCount, setPropertiesCount] = useState(0);

  useEffect(() => {
    fetchAgencyData();
  }, [user]);

  const fetchAgencyData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Obtener el agency_id del perfil del usuario
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
        .select('id, first_name, last_name, email, phone, photo_url')
        .eq('role', 'agent')
        .eq('agency_id', profile.agency_id)
        .order('first_name');

      if (agentsError) throw agentsError;
      setAgencyAgents(agents || []);

      // Obtener propiedades gestionadas por la agencia
      // Buscar por agency_id directo O por agent_id de los agentes
      let propertiesQuery = supabase
        .from('properties')
        .select('id, title, location, price')
        .order('created_at', { ascending: false })
        .limit(10);

      if (agents && agents.length > 0) {
        const agentIds = agents.map(a => a.id);
        propertiesQuery = propertiesQuery.or(
          `agency_id.eq.${profile.agency_id},agent_id.in.(${agentIds.join(',')})`
        );
      } else {
        propertiesQuery = propertiesQuery.eq('agency_id', profile.agency_id);
      }

      const { data: properties, error: propertiesError } = await propertiesQuery;

      if (propertiesError) throw propertiesError;
      setAgencyProperties(properties || []);
      
      // Contar todas las propiedades (no solo las 10 primeras)
      let countQuery = supabase
        .from('properties')
        .select('id', { count: 'exact', head: true });

      if (agents && agents.length > 0) {
        const agentIds = agents.map(a => a.id);
        countQuery = countQuery.or(
          `agency_id.eq.${profile.agency_id},agent_id.in.(${agentIds.join(',')})`
        );
      } else {
        countQuery = countQuery.eq('agency_id', profile.agency_id);
      }

      const { count } = await countQuery;
      setPropertiesCount(count || 0);

    } catch (error: any) {
      console.error('Error fetching agency data:', error);
      toast({
        title: 'Error',
        description: `No se pudieron cargar los datos: ${error.message}`,
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
        <h1 className="text-3xl font-bold mb-2">Dashboard de Agencia</h1>
        <p className="text-muted-foreground">Gestión de agentes y propiedades</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Agentes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agencyAgents.length}</div>
            <p className="text-xs text-muted-foreground">
              agentes en la agencia
            </p>
            {agencyId && (
              <Button 
                asChild 
                className="w-full mt-4" 
                variant="outline"
                onClick={() => navigate(`/dashboard/agencies/${agencyId}/agents`)}
              >
                <Link to={`/dashboard/agencies/${agencyId}/agents`}>Ver agentes</Link>
              </Button>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Propiedades</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propertiesCount}</div>
            <p className="text-xs text-muted-foreground">
              propiedades gestionadas
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/dashboard/agencies/properties">Ver propiedades</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              reservas activas
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/dashboard/reservations">Ver reservas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mis Agentes</CardTitle>
            <CardDescription>Agentes registrados en la agencia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agencyAgents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay agentes registrados</p>
              ) : (
                agencyAgents.map(agent => (
                  <div key={agent.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {agent.photo_url ? (
                        <img 
                          src={agent.photo_url} 
                          alt={`${agent.first_name} ${agent.last_name}`}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{agent.first_name} {agent.last_name}</div>
                        <div className="text-sm text-muted-foreground">{agent.email}</div>
                      </div>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/dashboard/agents/${agent.id}`}>Ver</Link>
                    </Button>
                  </div>
                ))
              )}
              {agencyId && (
                <Button 
                  className="w-full mt-2" 
                  variant="outline"
                  onClick={() => navigate(`/dashboard/agencies/${agencyId}/agents/new`)}
                >
                  Añadir Agente
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Propiedades Destacadas</CardTitle>
            <CardDescription>Propiedades gestionadas por la agencia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agencyProperties.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay propiedades gestionadas</p>
              ) : (
                agencyProperties.slice(0, 3).map(property => (
                  <div key={property.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{property.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {property.location} - {property.price.toLocaleString('es-ES')}€
                      </div>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/dashboard/agencies/properties`}>Ver</Link>
                    </Button>
                  </div>
                ))
              )}
              <Button asChild className="w-full mt-2" variant="outline">
                <Link to="/dashboard/agencies/properties">Ver todas</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgencyDashboard;
