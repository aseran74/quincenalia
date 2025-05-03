import React, { useEffect, useState, useRef } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '@/lib/supabase';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Info, ChevronDown, Trash2, Plus, X, Home, Calendar as CalendarIcon } from 'lucide-react';
import ReservationCalendar from '../properties/ReservationCalendar';

// Configuración del Calendario
const locales = { 'es': es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface Property {
  id: string;
  title: string;
  share_number?: number; // Número de share del propietario (1-4)
}

interface Reservation {
  id: string;
  property_id: string;
  owner_id: string;
  share_number: number;
  start_date: string;
  end_date: string;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  created_at: string;
  properties?: Property | null;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  isOwner: boolean;
}

const STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', borderColor: 'border-yellow-300' },
  { value: 'aprobada', label: 'Aprobada', color: 'bg-green-100 text-green-800', borderColor: 'border-green-300' },
  { value: 'rechazada', label: 'Rechazada', color: 'bg-red-100 text-red-800', borderColor: 'border-red-300' },
  { value: 'cancelada', label: 'Cancelada', color: 'bg-gray-100 text-gray-800', borderColor: 'border-gray-300' },
];

const getStatusStyle = (statusValue: string) => {
  return STATUS_OPTIONS.find(s => s.value === statusValue) || STATUS_OPTIONS.find(s => s.value === 'cancelada')!;
};

const OwnerReservations: React.FC = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filterProperty, setFilterProperty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
  const [creatingOrUpdating, setCreatingOrUpdating] = useState(false);

  // Refs para el formulario de creación
  const formPropertyRef = useRef<HTMLSelectElement>(null);
  const formStartDateRef = useRef<HTMLInputElement>(null);
  const formEndDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Traer solo propiedades del propietario
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, title, share1_owner_id, share2_owner_id, share3_owner_id, share4_owner_id')
        .order('title');
      if (propertiesError) throw propertiesError;
      // Filtrar solo las propiedades donde el usuario es owner
      const myProperties = (propertiesData || []).filter((p: any) =>
        [p.share1_owner_id, p.share2_owner_id, p.share3_owner_id, p.share4_owner_id].includes(user?.id)
      ).map((p: any) => ({ id: p.id, title: p.title }));
      setProperties(myProperties);
      // Traer reservas del propietario
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('property_reservations')
        .select('*, properties (id, title)')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });
      if (reservationsError) throw reservationsError;
      setReservations(reservationsData || []);
    } catch (error: any) {
      toast({ title: 'Error', description: `No se pudieron cargar los datos: ${error.message}`, variant: 'destructive' });
      setReservations([]);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirmation = (reservation: Reservation) => {
    setReservationToDelete(reservation);
  };

  const handleDelete = async () => {
    if (!reservationToDelete) return;
    setCreatingOrUpdating(true);
    const { error } = await supabase.from('property_reservations').delete().eq('id', reservationToDelete.id);
    if (!error) {
      toast({ title: 'Eliminada', description: 'Reserva eliminada correctamente' });
      setReservations(prev => prev.filter(r => r.id !== reservationToDelete.id));
    } else {
      toast({ title: 'Error', description: 'No se pudo eliminar la reserva', variant: 'destructive' });
    }
    setReservationToDelete(null);
    setCreatingOrUpdating(false);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingOrUpdating(true);
    const property_id = formPropertyRef.current?.value;
    const start_date = formStartDateRef.current?.value;
    const end_date = formEndDateRef.current?.value;
    if (!property_id || !start_date || !end_date) {
      toast({ title: 'Campos incompletos', description: 'Por favor, rellena todos los campos obligatorios.', variant: 'destructive' });
      setCreatingOrUpdating(false);
      return;
    }
    if (new Date(end_date) < new Date(start_date)) {
      toast({ title: 'Error de fechas', description: 'La fecha de fin no puede ser anterior a la fecha de inicio.', variant: 'destructive' });
      setCreatingOrUpdating(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('property_reservations')
        .insert({ property_id, owner_id: user?.id, start_date, end_date, status: 'pendiente' })
        .select('*, properties (id, title)').single();
      if (error) throw error;
      if (data) {
        setReservations(prev => [data, ...prev]);
        toast({ title: 'Reserva creada', description: 'La reserva se ha añadido correctamente.' });
        setShowCreateModal(false);
      } else {
        throw new Error('No se recibieron datos de la reserva creada.');
      }
    } catch (error: any) {
      toast({ title: 'Error al crear', description: `No se pudo crear la reserva: ${error.message}`, variant: 'destructive' });
    } finally {
      setCreatingOrUpdating(false);
    }
  };

  // Filtros aplicados a las reservas ya cargadas
  const filteredReservations = reservations.filter(r =>
    (filterProperty === 'all' || r.property_id === filterProperty) &&
    (filterStatus === 'all' || r.status === filterStatus)
  );

  // Resumen de reservas
  const resumen = [
    { label: 'Total', count: reservations.length, color: 'bg-blue-50 text-blue-800', borderColor: 'border-blue-200' },
    ...STATUS_OPTIONS.map(opt => ({
      label: opt.label,
      count: reservations.filter(r => r.status === opt.value).length,
      color: opt.color,
      borderColor: opt.borderColor
    }))
  ];

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      const adjustedDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      return adjustedDate.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) {
      return dateString || '-';
    }
  };

  return (
    <div className="p-2 md:p-6 max-w-7xl mx-auto font-sans">
      <h1 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">Mis Reservas</h1>

      {/* Filtros responsivos */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          {/* Filtro Propiedad */}
          <div>
            <label htmlFor="filterProperty" className="block text-sm font-medium text-gray-700 mb-1">
              <Home className="inline-block mr-1 h-4 w-4 text-gray-500" /> Propiedad
            </label>
            <div className="relative">
              <select
                id="filterProperty"
                className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filterProperty}
                onChange={e => setFilterProperty(e.target.value)}
                disabled={loading}
              >
                <option value="all">Todas mis propiedades</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          {/* Filtro Estado */}
          <div>
            <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <div className="relative">
              <select
                id="filterStatus"
                className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                disabled={loading}
              >
                <option value="all">Todos los estados</option>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de reservas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {resumen.map((r, idx) => (
          <div key={r.label} className={`rounded-md p-3 text-center border ${r.borderColor} ${r.color.split(' ')[0]}`}>
            <div className="text-xs text-gray-600 mb-1">{r.label}</div>
            <div className="text-lg font-bold text-gray-900">{r.count}</div>
          </div>
        ))}
        </div>
        
      {/* Cards en móvil */}
      <div className="space-y-4 md:hidden">
        {filteredReservations.length === 0 ? (
          <p className="text-center text-gray-500 py-6">No hay reservas que coincidan con los filtros.</p>
        ) : (
          filteredReservations.map(r => {
            const statusStyle = getStatusStyle(r.status);
            const property = r.properties;
            return (
              <div key={r.id} className={`border rounded-lg p-4 shadow-sm relative ${statusStyle.borderColor} bg-white`}>
                <div className="flex justify-between items-start mb-3">
                  <span className="font-semibold text-gray-800 truncate pr-2" title={property?.title}>{property?.title || 'Propiedad no encontrada'}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.color} whitespace-nowrap`}>
                    {statusStyle.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  <CalendarIcon className="inline-block mr-1.5 h-4 w-4 text-gray-400" />
                  {formatDate(r.start_date)} - {formatDate(r.end_date)}
                </p>
                <div className="flex items-center justify-between border-t border-gray-200 pt-3 mt-3 gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 px-2"
                    onClick={() => handleDeleteConfirmation(r)}
                    disabled={creatingOrUpdating}
                    aria-label="Eliminar reserva"
                  >
                    <Trash2 size={16} />
                  </Button>
                      </div>
                    </div>
            );
          })
        )}
      </div>

      {/* Tabla en escritorio */}
      <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propiedad</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha inicio</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha fin</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReservations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">No hay reservas que coincidan con los filtros.</td>
              </tr>
            ) : (
              filteredReservations.map(r => {
                const statusStyle = getStatusStyle(r.status);
                const property = r.properties;
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-medium" title={property?.title}>
                      <span className="truncate block max-w-xs">{property?.title || '-'}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDate(r.start_date)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDate(r.end_date)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.color} whitespace-nowrap`}>
                        {statusStyle.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 p-1"
                        onClick={() => handleDeleteConfirmation(r)}
                        disabled={creatingOrUpdating}
                        aria-label="Eliminar reserva"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmación para eliminar */}
      {reservationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out animate-fade-in-scale">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-in-scale">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Confirmar Eliminación</h2>
            <p className="text-sm text-gray-600 mb-4">
              ¿Estás seguro de que quieres eliminar la reserva de
              <span className="font-medium"> {reservationToDelete.properties?.title || ''} </span>
              ({formatDate(reservationToDelete.start_date)} - {formatDate(reservationToDelete.end_date)})?
              <br />Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="outline" onClick={() => setReservationToDelete(null)} disabled={creatingOrUpdating}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={creatingOrUpdating}>{creatingOrUpdating ? 'Eliminando...' : 'Eliminar'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear nueva reserva */}
      {properties.length > 0 && (
        <Button
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-6 right-6 z-40 md:hidden rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white p-4 animate-fade-in-scale"
          style={{ display: showCreateModal ? 'none' : 'block' }}
          aria-label="Nueva Reserva"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto transition-opacity duration-300 ease-out animate-fade-in-scale">
          <div className="bg-white p-5 md:p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[95vh] overflow-y-auto transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-in-scale relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              onClick={() => !creatingOrUpdating && setShowCreateModal(false)}
              aria-label="Cerrar modal"
              disabled={creatingOrUpdating}
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-5 text-gray-800 border-b pb-3">Nueva Reserva</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Selector Propiedad */}
              <div>
                <label htmlFor="createProperty" className="block text-sm font-medium text-gray-700 mb-1">Propiedad *</label>
                <div className="relative">
                  <select
                    id="createProperty"
                    ref={formPropertyRef}
                    name="property_id"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    required
                    disabled={creatingOrUpdating}
                    defaultValue=""
                  >
                    <option value="" disabled>Selecciona...</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              {/* Fechas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="createStartDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio *</label>
                  <Input
                    id="createStartDate"
                    ref={formStartDateRef}
                    name="start_date"
                    type="date"
                    className="w-full text-sm disabled:bg-gray-100"
                    required
                    disabled={creatingOrUpdating}
                  />
                </div>
                <div>
                  <label htmlFor="createEndDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha fin *</label>
                  <Input
                    id="createEndDate"
                    ref={formEndDateRef}
                    name="end_date"
                    type="date"
                    className="w-full text-sm disabled:bg-gray-100"
                    required
                    disabled={creatingOrUpdating}
                  />
                </div>
              </div>
              {/* Botones */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 mt-5 border-t">
                <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)} disabled={creatingOrUpdating} className="w-full sm:w-auto">Cancelar</Button>
                <Button type="submit" disabled={creatingOrUpdating} className="w-full sm:w-auto">{creatingOrUpdating ? 'Creando...' : 'Crear Reserva'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mostrar calendario y resumen si hay una propiedad seleccionada */}
      {filterProperty !== 'all' && !loading && (
        <div className="mt-8 pt-6 border-t">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Calendario de Disponibilidad: <span className='font-bold'>{properties.find(p => p.id === filterProperty)?.title}</span>
          </h2>
          <ReservationCalendar key={filterProperty} propertyId={filterProperty} />
      </div>
      )}
    </div>
  );
};

export default OwnerReservations; 