import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Plus, Clock, CheckCircle, Home, MessageSquare } from 'lucide-react';

const CAUSAS = [
  { value: 'limpieza', label: 'Incidencia limpieza' },
  { value: 'piscina', label: 'Incidencia piscina' },
  { value: 'pagos', label: 'Incidencia pagos' },
  { value: 'otros', label: 'Otros' },
];

const ESTADOS = [
    { value: 'recibida', label: 'Recibida' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'revisada', label: 'Revisada' },
    { value: 'resuelta', label: 'Resuelta' },
];

interface Incident {
  id: string;
  property_id: string | null;
  owner_id: string | null;
  subject: string;
  cause: string;
  description: string;
  status: 'pendiente' | 'revisada' | 'resuelta' | 'recibida';
  created_at: string;
  property_title?: string;
  owner_name?: string;
  attachments?: string[];
}

interface OwnerProfile {
    id: string;
    name: string;
}

interface Property {
    id: string;
    title: string;
}

const IncidenciasPanel = () => {
  const { user, loading: authLoading } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const navigate = useNavigate();
  const [owners, setOwners] = useState<OwnerProfile[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    if (authLoading) return;
    const fetchRelatedData = async () => {
        try {
            const { data: ownersData, error: ownersError } = await supabase
                .from('profiles')
                .select('id, name')
                .in('role', ['owner', 'admin']);
            if (ownersError) throw ownersError;
            setOwners(ownersData || []);

            const { data: propertiesData, error: propertiesError } = await supabase
                .from('properties')
                .select('id, title');
            if (propertiesError) throw propertiesError;
            setProperties(propertiesData || []);

        } catch (error: any) {
             console.error("Error fetching related data:", error);
             toast({
                title: "Error",
                description: "No se pudieron cargar datos relacionados (propietarios/propiedades). " + error.message,
                variant: "destructive",
            });
        }
    };
    fetchRelatedData();
  }, [user, authLoading]);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoadingIncidents(true);
      let query = supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      setIncidents(data || []);
    } catch (error: any) {
      console.error("Error fetching incidents:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las incidencias: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingIncidents(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resuelta':
        return 'bg-green-500 text-green-700 border-green-500';
      case 'revisada':
        return 'bg-yellow-500 text-yellow-700 border-yellow-500';
      case 'pendiente':
      case 'recibida':
        return 'bg-red-500 text-red-700 border-red-500';
      default:
        return 'bg-gray-500 text-gray-700 border-gray-500';
    }
  };

 const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resuelta':
        return <CheckCircle className="h-6 w-6 md:h-7 md:w-7" />;
      case 'revisada':
        return <Clock className="h-6 w-6 md:h-7 md:w-7" />;
      case 'pendiente':
      case 'recibida':
        return <AlertTriangle className="h-6 w-6 md:h-7 md:w-7" />;
      default:
        return <AlertTriangle className="h-6 w-6 md:h-7 md:w-7" />;
    }
  };

  const getCauseLabel = (causeValue: string) => {
    return CAUSAS.find(c => c.value === causeValue)?.label || causeValue;
  };

  const getOwnerName = (ownerId: string | null) => {
      if (!ownerId) return 'N/A';
      return owners.find(o => o.id === ownerId)?.name || 'Desconocido';
  }

  const getPropertyTitle = (propertyId: string | null) => {
       if (!propertyId) return 'N/A';
      return properties.find(p => p.id === propertyId)?.title || 'Desconocida';
  }

  if (authLoading || loadingIncidents) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className='ml-2'>Cargando incidencias...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Incidencias</h1>
        <Button
          onClick={() => navigate('/dashboard/admin/incidents/new')}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Incidencia
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {incidents.length === 0 && !loadingIncidents ? (
             <p className="col-span-full text-center text-gray-500 mt-8">No hay incidencias para mostrar.</p>
        ) : (
            incidents.slice(0, 20).map((incident) => {
                const statusClasses = getStatusColor(incident.status);
                return (
                    <Card
                        key={incident.id}
                        className="group cursor-pointer hover:shadow-lg transition-shadow duration-300 overflow-hidden border rounded-lg flex flex-col"
                        onClick={() => navigate(`/dashboard/admin/incidents/${incident.id}`)}
                    >
                        <CardContent className="p-4 md:p-5 flex flex-col items-center text-center space-y-3 flex-grow">
                             <div className={`p-3 rounded-full ${statusClasses.split(' ')[0]} bg-opacity-10 group-hover:bg-opacity-20 transition-colors duration-300`}>
                               <div className={`rounded-full text-white ${statusClasses.split(' ')[0]} p-2`}>
                                    {getStatusIcon(incident.status)}
                                </div>
                            </div>
                            <div className="flex-grow">
                                <CardTitle className="text-lg md:text-xl font-semibold mb-2 text-gray-800">
                                    {incident.subject}
                                </CardTitle>
                                <div className="space-y-1.5 text-gray-600 text-sm">
                                    {incident.property_id && (
                                        <div className="flex items-center justify-center gap-1.5">
                                            <Home className="h-4 w-4 text-gray-500" />
                                            <span>{getPropertyTitle(incident.property_id)}</span>
                                        </div>
                                    )}
                                    {incident.owner_id && (
                                        <div className="flex items-center justify-center gap-1.5">
                                            <span className="font-medium">Propietario:</span>
                                            <span>{getOwnerName(incident.owner_id)}</span>
                                        </div>
                                     )}
                                    <div className="flex items-center justify-center gap-1.5">
                                        <MessageSquare className="h-4 w-4 text-gray-500" />
                                        <span>{getCauseLabel(incident.cause)}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(incident.created_at).toLocaleDateString()} - {new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                             <p className="text-sm text-gray-500 line-clamp-2 mt-2 px-2 w-full">
                                {incident.description}
                            </p>
                             <div className={`mt-auto pt-4 w-full`}>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${statusClasses.split(' ')[0]} bg-opacity-10 ${statusClasses.split(' ')[1]} ${statusClasses.split(' ')[2]}`}>
                                    {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                                </span>
                             </div>
                        </CardContent>
                    </Card>
                 );
            })
        )}
      </div>
    </div>
  );
};

export default IncidenciasPanel; 