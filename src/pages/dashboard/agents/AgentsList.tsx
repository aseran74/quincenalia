import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Link, Navigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { HiOutlineUserCircle } from 'react-icons/hi2';

interface AgentProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_image?: string;
}

interface AgentsListProps {
  adminMode?: boolean;
}

const AgentsList = ({ adminMode = false }: AgentsListProps) => {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const { user } = useAuth();

  const basePath = adminMode ? '/dashboard/admin/agents' : '/dashboard/agents';

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, phone, profile_image')
      .eq('role', 'agent')
      .order('first_name');
    setAgents(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar este agente?')) return;
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    if (!error) {
      setAgents(agents.filter(a => a.id !== id));
      toast({ title: 'Éxito', description: 'Elemento eliminado correctamente' });
    } else {
      toast({ title: 'Error', description: 'Error al realizar la acción', variant: 'destructive' });
    }
  };

  if (user?.role === 'admin' && !adminMode) {
    return <Navigate to="/dashboard/admin/agents" replace />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agentes Inmobiliarios {adminMode && <span className="ml-2 px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">Admin</span>}</h1>
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
          <Link to={`${basePath}/new`}>
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
                  {agent.profile_image ? (
                    <img src={agent.profile_image} alt={agent.first_name} className="w-16 h-16 object-cover rounded-full" />
                  ) : (
                    <HiOutlineUserCircle className="w-16 h-16 text-gray-300" />
                  )}
                  <div>
                    <Link to={`${basePath}/${agent.id}`} className="hover:underline">
                      <h2 className="text-xl font-semibold">{agent.first_name} {agent.last_name}</h2>
                    </Link>
                    <p className="text-gray-600 text-sm">{agent.email}</p>
                    <p className="text-gray-600 text-sm">{agent.phone}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 justify-end">
                  <Link to={`${basePath}/${agent.id}/edit`}>
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
                <th className="px-4 py-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id}>
                  <td className="px-4 py-2 border flex items-center gap-2">
                    {agent.profile_image ? (
                      <img src={agent.profile_image} alt={agent.first_name} className="w-8 h-8 object-cover rounded-full" />
                    ) : (
                      <HiOutlineUserCircle className="w-8 h-8 text-gray-300" />
                    )}
                    <Link to={`${basePath}/${agent.id}`} className="hover:underline">
                      {agent.first_name} {agent.last_name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 border">{agent.email}</td>
                  <td className="px-4 py-2 border">{agent.phone}</td>
                  <td className="px-4 py-2 border flex gap-2">
                    <Link to={`${basePath}/${agent.id}/edit`}>
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