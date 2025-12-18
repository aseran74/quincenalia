import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Phone, Search } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ContactRequest['status']>('all');

  const fetchRequests = useCallback(async () => {
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
  }, [user?.id, user?.role]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

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
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!normalizedSearch) return true;
      const haystack = [
        r.name,
        r.email,
        r.phone ?? '',
        r.message ?? '',
        statusOptions.find((o) => o.value === r.status)?.label ?? r.status,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [normalizedSearch, requests, statusFilter]);

  const statusCounts = useMemo(() => {
    return statusOptions.reduce<Record<ContactRequest['status'], number>>((acc, opt) => {
      acc[opt.value] = requests.filter((r) => r.status === opt.value).length;
      return acc;
    }, { pendiente: 0, contactado: 0, enviado_documentacion: 0, no_interesado: 0 });
  }, [requests]);

  const statusFilterOptions = useMemo(() => {
    return new Set<string>(['all', ...statusOptions.map((o) => o.value)]);
  }, []);

  const handleStatusFilterChange = (value: string) => {
    if (statusFilterOptions.has(value)) {
      setStatusFilter(value as 'all' | ContactRequest['status']);
      return;
    }
    setStatusFilter('all');
  };

  if (!filteredRequests.length) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl sm:text-2xl">Solicitudes de contacto</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Pendiente: {statusCounts.pendiente}</Badge>
                <Badge variant="secondary">Contactado: {statusCounts.contactado}</Badge>
                <Badge variant="secondary">Enviado doc.: {statusCounts.enviado_documentacion}</Badge>
                <Badge variant="secondary">No interesado: {statusCounts.no_interesado}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {requests.length} total
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, email, teléfono o mensaje…"
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {requests.length === 0
              ? 'No hay solicitudes de contacto para mostrar.'
              : 'No hay resultados con esos filtros.'}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl sm:text-2xl">
            Solicitudes de contacto
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Pendiente: {statusCounts.pendiente}</Badge>
              <Badge variant="secondary">Contactado: {statusCounts.contactado}</Badge>
              <Badge variant="secondary">Enviado doc.: {statusCounts.enviado_documentacion}</Badge>
              <Badge variant="secondary">No interesado: {statusCounts.no_interesado}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredRequests.length} de {requests.length}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, email, teléfono o mensaje…"
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

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
            {filteredRequests.map((request) => (
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
        {filteredRequests.map((request) => (
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
              <Mail className="h-4 w-4 text-blue-500" />
              <span className="break-all">{request.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-green-500" />
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