import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineArrowLeft,
  HiOutlinePlus,
} from "react-icons/hi2";

interface RealEstateAgent {
  id: string;
  agency_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  photo_url: string | null;
  bio: string;
  specialization: string;
  license_number: string;
  created_at: string;
  updated_at: string;
}

interface RealEstateAgency {
  id: string;
  name: string;
}

const AgentsList = () => {
  const { agencyId } = useParams<{ agencyId: string }>();
  const navigate = useNavigate();
  const [agents, setAgents] = useState<RealEstateAgent[]>([]);
  const [agency, setAgency] = useState<RealEstateAgency | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (agencyId) {
      fetchAgencyAndAgents();
    }
  }, [agencyId]);

  const fetchAgencyAndAgents = async () => {
    try {
      // Obtener la agencia
      const { data: agencyData, error: agencyError } = await supabase
        .from('real_estate_agencies')
        .select('id, name')
        .eq('id', agencyId)
        .single();

      if (agencyError) throw agencyError;
      setAgency(agencyData);

      // Obtener los agentes
      const { data: agentsData, error: agentsError } = await supabase
        .from('real_estate_agents')
        .select('*')
        .eq('agency_id', agencyId)
        .order('first_name');

      if (agentsError) throw agentsError;
      setAgents(agentsData || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar los agentes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este agente?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('real_estate_agents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAgents(agents.filter(agent => agent.id !== id));
      toast({
        title: 'Éxito',
        description: 'Agente eliminado correctamente',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Error al eliminar el agente',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Agencia no encontrada</h1>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/agencies')}
            className="mt-4"
          >
            <HiOutlineArrowLeft className="h-5 w-5 mr-2" />
            Volver a Agencias
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/dashboard/agencies')}>
            <HiOutlineArrowLeft className="h-5 w-5 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{agency.name}</h1>
            <p className="text-gray-600">Agentes Inmobiliarios</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/dashboard/agencies/${agencyId}/agents/new`)}>
          <HiOutlinePlus className="h-5 w-5 mr-2" />
          Nuevo Agente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {agent.first_name} {agent.last_name}
                    </h2>
                    <p className="text-gray-600 text-sm">{agent.specialization}</p>
                  </div>
                  {agent.photo_url && (
                    <img
                      src={agent.photo_url}
                      alt={`${agent.first_name} ${agent.last_name}`}
                      className="w-16 h-16 object-cover rounded-full"
                    />
                  )}
                </div>

                <p className="text-gray-700 line-clamp-2">{agent.bio}</p>

                <div className="text-sm space-y-1">
                  <p>📞 {agent.phone}</p>
                  <p>✉️ {agent.email}</p>
                  <p>🪪 {agent.license_number}</p>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dashboard/agencies/${agencyId}/agents/edit/${agent.id}`)}
                  >
                    <HiOutlinePencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(agent.id)}
                  >
                    <HiOutlineTrash className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AgentsList; 