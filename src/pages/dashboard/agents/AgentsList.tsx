import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface RealEstateAgent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  photo_url?: string;
  agency_id?: string;
}

interface RealEstateAgency {
  id: string;
  name: string;
}

const AgentsList = () => {
  const [agents, setAgents] = useState<RealEstateAgent[]>([]);
  const [agencies, setAgencies] = useState<RealEstateAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: agentsData } = await supabase
      .from('real_estate_agents')
      .select('*')
      .order('first_name');
    const { data: agenciesData } = await supabase
      .from('real_estate_agencies')
      .select('id, name');
    setAgents(agentsData || []);
    setAgencies(agenciesData || []);
    setLoading(false);
  };

  const getAgencyName = (agency_id?: string) => {
    if (!agency_id) return 'Sin agencia';
    const agency = agencies.find(a => a.id === agency_id);
    return agency ? agency.name : 'Sin agencia';
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar este agente?')) return;
    const { error } = await supabase
      .from('real_estate_agents')
      .delete()
      .eq('id', id);
    if (!error) {
      setAgents(agents.filter(a => a.id !== id));
      toast({ title: 'Éxito', description: 'Elemento eliminado correctamente' });
    } else {
      toast({ title: 'Error', description: 'Error al realizar la acción', variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agentes Inmobiliarios</h1>
        <div className="flex gap-2">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            onClick={() => setView('grid')}
          >
            Grid
          </Button>
          <Button
            variant={view === 'table' ? 'default' : 'outline'}
            onClick={() => setView('table')}
          >
            Tabla
          </Button>
          <Link to="/dashboard/agents/new">
            <Button>Nuevo Agente</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Cargando agentes...</div>
      ) : agents.length === 0 ? (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">No hay agentes registrados</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Comienza agregando un nuevo agente inmobiliario.
            </p>
          </CardContent>
        </Card>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card key={agent.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-4">
                  {agent.photo_url && (
                    <img src={agent.photo_url} alt={agent.first_name} className="w-16 h-16 object-cover rounded-full" />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold">{agent.first_name} {agent.last_name}</h2>
                    <p className="text-gray-600 text-sm">{agent.email}</p>
                    <p className="text-gray-600 text-sm">{agent.phone}</p>
                    <p className="text-gray-600 text-sm">{getAgencyName(agent.agency_id)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 justify-end">
                  <Link to={`/dashboard/agents/${agent.id}/edit`}>
                    <Button size="icon" variant="ghost"><Pencil /></Button>
                  </Link>
                  {user?.role === 'admin' && (
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(agent.id)}><Trash2 color="#e11d48" /></Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Nombre</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Teléfono</th>
                <th className="px-4 py-2 border">Agencia</th>
                <th className="px-4 py-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id}>
                  <td className="px-4 py-2 border">{agent.first_name} {agent.last_name}</td>
                  <td className="px-4 py-2 border">{agent.email}</td>
                  <td className="px-4 py-2 border">{agent.phone}</td>
                  <td className="px-4 py-2 border">{getAgencyName(agent.agency_id)}</td>
                  <td className="px-4 py-2 border flex gap-2">
                    <Link to={`/dashboard/agents/${agent.id}/edit`}>
                      <Button size="icon" variant="ghost"><Pencil /></Button>
                    </Link>
                    {user?.role === 'admin' && (
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(agent.id)}><Trash2 color="#e11d48" /></Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AgentsList; 