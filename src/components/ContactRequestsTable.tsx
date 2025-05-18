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
} from '@/components/ui/table'; // Asumo que estos son componentes de Shadcn/ui
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Asumo que estos son componentes de Shadcn/ui
import { toast } from '@/components/ui/use-toast'; // Asumo que es de Shadcn/ui
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
    setLoading(true); // Asegurarse de poner loading a true al inicio
    try {
      let query = supabase
        .from('contact_requests')
        .select('*')
        .order('created_at', { ascending: false });

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
      setRequests([]); // En caso de error, establecer un array vacío
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact_requests')
        .update({ status: newStatus, updated_at: new Date().toISOString() }) // Actualizar también updated_at
        .eq('id', requestId);

      if (error) throw error;

      setRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status: newStatus as ContactRequest['status'], updated_at: new Date().toISOString() }
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

  const isAgent = user?.role === 'agent';

  if (loading) {
    return <div className="flex justify-center items-center h-32">Cargando solicitudes...</div>;
  }

  // Título responsivo
  const title = (
    <h2 className={`text-2xl font-bold mb-6 ${isAgent ? 'text-right sm:text-left' : 'text-center'}`}>
      <span className="hidden sm:inline">Solicitudes de Contacto</span>
      <span className="inline sm:hidden">Solicitudes<br />de Contacto</span>
    </h2>
  );

  if (!requests.length) {
    return (
      <div className="container mx-auto p-4">
        {title}
        <p className="text-center text-gray-500">No hay solicitudes de contacto para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6"> {/* `container` para centrar y limitar ancho, `p-4` para padding */}
      {title}

      {/* Tabla para pantallas md y superiores */}
      <div className="hidden md:block w-full overflow-x-auto rounded-lg border"> {/* `overflow-x-auto` para scroll horizontal si la tabla es muy ancha, `rounded-lg border` para estética */}
        <Table className="min-w-full"> {/* `min-w-full` para asegurar que la tabla intente ocupar el ancho, combinado con overflow */}
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Fecha</TableHead> {/* Ancho sugerido */}
              <TableHead>Nombre</TableHead>
              <TableHead className="min-w-[200px]">Email</TableHead> {/* Ancho mínimo para email */}
              <TableHead className="w-[130px]">Teléfono</TableHead> {/* Ancho sugerido */}
              <TableHead className="min-w-[250px]">Mensaje</TableHead> {/* Ancho mínimo para mensaje */}
              <TableHead className="w-[180px]">Estado</TableHead> {/* Ancho sugerido */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="whitespace-nowrap"> {/* Evitar que la fecha se parta */}
                  {format(new Date(request.created_at), 'dd/MM/yy HH:mm', { locale: es })}
                </TableCell>
                <TableCell className="font-medium">{request.name}</TableCell>
                <TableCell className="truncate max-w-xs" title={request.email}> {/* `truncate` para cortar texto largo, `max-w-xs` para limitar ancho, `title` para tooltip */}
                  {request.email}
                </TableCell>
                <TableCell className="whitespace-nowrap">{request.phone || '-'}</TableCell>
                <TableCell className="max-w-md"> {/* Limitar ancho máximo del mensaje */}
                  <div className="whitespace-pre-line break-words"> {/* `whitespace-pre-line` para respetar saltos de línea, `break-words` para cortar palabras largas */}
                    {request.message || '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={request.status}
                    onValueChange={(value) => handleStatusChange(request.id, value)}
                  >
                    <SelectTrigger className="w-full sm:w-[160px]"> {/* Ancho completo en select pequeño, fijo en más grande */}
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
      </div>

      {/* Vista de tarjetas para pantallas pequeñas (menores a md) */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {requests.map((request) => (
          <div key={request.id} className="border rounded-lg bg-white shadow-sm flex flex-col p-4 gap-2">
            <div className="flex items-center gap-3 mb-1">
              <span className="inline-flex items-center justify-center rounded-full bg-purple-100 text-purple-700 w-10 h-10 text-xl font-bold">
                {request.name?.[0]?.toUpperCase() || 'U'}
              </span>
              <div className="flex-1">
                <div className="font-semibold text-lg text-gray-800 break-words">{request.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{format(new Date(request.created_at), 'dd/MM/yy HH:mm', { locale: es })}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 01-8 0 4 4 0 018 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v7m0 0H9m3 0h3" /></svg>
              <span className="break-all">{request.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm10-10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              <span className="break-all">{request.phone || '-'}</span>
            </div>
            {request.message && (
              <div className="bg-gray-50 rounded-md p-2 mt-1 text-sm text-gray-700 whitespace-pre-line break-words">
                {request.message}
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${request.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : request.status === 'contactado' ? 'bg-blue-100 text-blue-800 border-blue-300' : request.status === 'enviado_documentacion' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                {statusOptions.find(opt => opt.value === request.status)?.label}
              </span>
              <div className="flex-1" />
              <Select
                value={request.status}
                onValueChange={(value) => handleStatusChange(request.id, value)}
              >
                <SelectTrigger className="w-[140px]">
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