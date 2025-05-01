import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ContactRequest {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  agent_id: string;
  agent: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const STATUS_OPTIONS = {
  ALL: 'all',
  PENDING: 'pendiente',
  CONTACTED: 'contactado',
  FINISHED: 'finalizado',
  CANCELLED: 'cancelado'
};

export const AgentRequests = () => {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAgent, setFilterAgent] = useState<string>(STATUS_OPTIONS.ALL);
  const [filterStatus, setFilterStatus] = useState<string>(STATUS_OPTIONS.ALL);
  const { user } = useAuth();

  useEffect(() => {
    console.log('Current user:', user);
    console.log('User role:', user?.role);
    if (user?.role !== 'admin') {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para ver esta página.",
        variant: "destructive"
      });
      return;
    }
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    try {
      console.log('Fetching requests...');
      const { data: userData } = await supabase.auth.getUser();
      console.log('Auth user data:', userData);
      
      const { data, error } = await supabase
        .from('contact_requests')
        .select(`
          *,
          agent:real_estate_agents(
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      console.log('Requests data:', data);
      console.log('Error if any:', error);

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las solicitudes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      setRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status: newStatus }
            : req
        )
      );

      toast({
        title: "Estado actualizado",
        description: "El estado de la solicitud se ha actualizado correctamente.",
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado.",
        variant: "destructive"
      });
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesAgent = filterAgent === STATUS_OPTIONS.ALL || 
      request.agent_id === filterAgent;
    const matchesStatus = filterStatus === STATUS_OPTIONS.ALL || 
      request.status === filterStatus;
    return matchesAgent && matchesStatus;
  });

  if (!user || user.role !== 'admin') {
    return <div className="p-4">No tienes permisos para ver esta página.</div>;
  }

  if (loading) {
    return <div className="p-4">Cargando solicitudes...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Solicitudes de Contacto - Vista Administrativa</h1>
      
      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Select
            value={filterStatus}
            onValueChange={setFilterStatus}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={STATUS_OPTIONS.ALL}>Todos los estados</SelectItem>
              <SelectItem value={STATUS_OPTIONS.PENDING}>Pendiente</SelectItem>
              <SelectItem value={STATUS_OPTIONS.CONTACTED}>Contactado</SelectItem>
              <SelectItem value={STATUS_OPTIONS.FINISHED}>Finalizado</SelectItem>
              <SelectItem value={STATUS_OPTIONS.CANCELLED}>Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <Select
            value={filterAgent}
            onValueChange={setFilterAgent}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por agente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={STATUS_OPTIONS.ALL}>Todos los agentes</SelectItem>
              {Array.from(new Set(requests.map(r => r.agent_id))).map(agentId => {
                const agent = requests.find(r => r.agent_id === agentId)?.agent;
                if (!agent || !agentId) return null;
                return (
                  <SelectItem key={agentId} value={agentId}>
                    {`${agent.first_name} ${agent.last_name}`}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla de solicitudes */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Agente</TableHead>
            <TableHead>Mensaje</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRequests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No hay solicitudes disponibles
              </TableCell>
            </TableRow>
          ) : (
            filteredRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                </TableCell>
                <TableCell>{request.name}</TableCell>
                <TableCell>
                  <div>
                    <a href={`mailto:${request.email}`} className="text-blue-600 hover:underline">
                      {request.email}
                    </a>
                  </div>
                  {request.phone && (
                    <div>
                      <a href={`tel:${request.phone}`} className="text-blue-600 hover:underline">
                        {request.phone}
                      </a>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {request.agent ? 
                    `${request.agent.first_name} ${request.agent.last_name}` : 
                    'No asignado'}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {request.message || '-'}
                </TableCell>
                <TableCell>
                  <Select
                    value={request.status}
                    onValueChange={(value) => handleStatusChange(request.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={STATUS_OPTIONS.PENDING}>Pendiente</SelectItem>
                      <SelectItem value={STATUS_OPTIONS.CONTACTED}>Contactado</SelectItem>
                      <SelectItem value={STATUS_OPTIONS.FINISHED}>Finalizado</SelectItem>
                      <SelectItem value={STATUS_OPTIONS.CANCELLED}>Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Próximamente",
                        description: "La vista detallada estará disponible pronto.",
                      });
                    }}
                  >
                    Ver detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AgentRequests; 