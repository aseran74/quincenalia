import React, { useEffect, useState } from 'react';
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
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: 'pendiente' | 'contactado' | 'enviado_documentacion' | 'no_interesado';
  agent_id: string | null;
  created_at: string;
  updated_at: string;
}

const statusOptions = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'contactado', label: 'Contactado' },
  { value: 'enviado_documentacion', label: 'Enviado documentación' },
  { value: 'no_interesado', label: 'No interesado' },
];

const ContactRequestsTable = () => {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      let query = supabase
        .from('contact_requests')
        .select('*')
        .order('created_at', { ascending: false });

      // Si el usuario es un agente, solo mostrar sus solicitudes
      if (user?.role === 'agent') {
        query = query.eq('agent_id', user.id);
      }

      const { data, error } = await query;

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
            ? { ...req, status: newStatus as ContactRequest['status'] }
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

  if (loading) {
    return <div>Cargando solicitudes...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Solicitudes de contacto</h2>
      {/* Tabla solo visible en md+ */}
      <Table className="hidden md:table">
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Mensaje</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
              </TableCell>
              <TableCell>{request.name}</TableCell>
              <TableCell>{request.email}</TableCell>
              <TableCell>{request.phone || '-'}</TableCell>
              <TableCell>{request.message || '-'}</TableCell>
              <TableCell>
                <Select
                  value={request.status}
                  onValueChange={(value) => handleStatusChange(request.id, value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Vista móvil tipo tarjeta */}
      <div className="md:hidden space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="text-xs text-gray-400 mb-1">
              {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
            </div>
            <div className="font-semibold">{request.name}</div>
            <div className="text-sm text-gray-600">{request.email}</div>
            <div className="text-sm text-gray-600">{request.phone || '-'}</div>
            <div className="text-gray-800 mt-2 whitespace-pre-line">{request.message || '-'}</div>
            <div className="mt-2">
              <Select
                value={request.status}
                onValueChange={(value) => handleStatusChange(request.id, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactRequestsTable; 