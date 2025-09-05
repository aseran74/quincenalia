import * as React from 'react';
import { useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Importante para formularios
import { ChevronDown, Trash2, Plus, X, Home, User, Calendar, AlertTriangle, FilterX, Loader2 } from 'lucide-react';
import UnifiedReservationCalendar from '../properties/UnifiedReservationCalendar';

// --- Constantes y Tipos (Sin cambios) ---
const STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', borderColor: 'border-yellow-300' },
  { value: 'aprobada', label: 'Aprobada', color: 'bg-green-100 text-green-800', borderColor: 'border-green-300' },
  { value: 'rechazada', label: 'Rechazada', color: 'bg-red-100 text-red-800', borderColor: 'border-red-300' },
  { value: 'cancelada', label: 'Cancelada', color: 'bg-gray-100 text-gray-800', borderColor: 'border-gray-300' },
];

const getStatusStyle = (statusValue: string) => {
  return STATUS_OPTIONS.find(s => s.value === statusValue) || STATUS_OPTIONS.find(s => s.value === 'cancelada')!;
};

interface Reservation {
  id: string;
  property_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  properties?: Property | null;
  owner?: Owner | null;
}

interface Property {
  id: string;
  title: string;
  share1_owner_id?: string;
  share2_owner_id?: string;
  share3_owner_id?: string;
  share4_owner_id?: string;
}

interface Owner {
  id: string;
  first_name: string;
  last_name: string;
}

// --- Componente de Skeleton para una mejor UX de carga ---
const ReservationSkeleton = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <div className="h-5 w-48 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                        <div className="h-3 w-16 bg-gray-200 rounded mb-1"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                    <div>
                        <div className="h-3 w-12 bg-gray-200 rounded mb-1"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="h-10 w-32 bg-gray-200 rounded-md"></div>
            </div>
        ))}
    </div>
);

const AdminReservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [filterProperty, setFilterProperty] = useState('all');
  const [filterOwner, setFilterOwner] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [availableCoOwners, setAvailableCoOwners] = useState<Owner[]>([]);
  // Usar una ref para el selector de propietario para poder resetearlo
  const ownerSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('property_reservations')
        .select('*, properties (id, title, share1_owner_id, share2_owner_id, share3_owner_id, share4_owner_id), owner:profiles!property_reservations_owner_id_fkey (id, first_name, last_name)')
        .order('created_at', { ascending: false });
      if (reservationsError) throw reservationsError;

      const { data: propertiesData, error: propertiesError } = await supabase.from('properties').select('*').order('title');
      if (propertiesError) throw propertiesError;
      
      const { data: ownersData, error: ownersError } = await supabase.from('profiles').select('id, first_name, last_name').eq('role', 'owner').order('last_name').order('first_name');
      if (ownersError) throw ownersError;

      setReservations(reservationsData || []);
      setProperties(propertiesData || []);
      setOwners(ownersData || []);
    } catch (error: any) {
      toast({ title: 'Error al cargar datos', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    setIsSubmitting(true);
    const { error } = await supabase.from('property_reservations').update({ status }).eq('id', id);
    if (!error) {
      toast({ title: 'Éxito', description: 'Estado actualizado correctamente.' });
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } else {
      toast({ title: 'Error', description: 'No se pudo actualizar el estado.', variant: 'destructive' });
    }
    setIsSubmitting(false);
  };
  
  const handleDeleteReservation = async () => {
    if (!reservationToDelete) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('property_reservations').delete().eq('id', reservationToDelete.id);
      if (error) throw error;
      toast({ title: 'Reserva eliminada', description: 'La reserva ha sido eliminada con éxito.', variant: 'success' });
      setReservations(prev => prev.filter(res => res.id !== reservationToDelete.id));
      setReservationToDelete(null);
    } catch (e: any) {
      toast({ title: 'Error al eliminar', description: e.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const newReservation = {
      property_id: formData.get('property_id') as string,
      owner_id: formData.get('owner_id') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      status: formData.get('status') as string,
    };
    
    if (!newReservation.property_id || !newReservation.owner_id || !newReservation.start_date || !newReservation.end_date || !newReservation.status) {
      toast({ title: 'Campos incompletos', description: 'Por favor, rellena todos los campos obligatorios.', variant: 'destructive' });
        setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase
            .from('property_reservations').insert(newReservation)
        .select(`*, properties (id, title), owner:profiles!property_reservations_owner_id_fkey (id, first_name, last_name)`).single();
      if (error) throw error;
        setReservations(prev => [data, ...prev]);
        toast({ title: 'Reserva creada', description: 'La nueva reserva se ha añadido correctamente.' });
        setShowCreateModal(false);
    } catch (error: any) {
      toast({ title: 'Error al crear', description: `No se pudo crear la reserva: ${error.message}`, variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handlePropertyChangeInForm = (propertyId: string) => {
    // Resetear el valor del selector de propietario
    if (ownerSelectRef.current) {
        ownerSelectRef.current.value = "";
    }

    const selectedProperty = properties.find(p => p.id === propertyId);
    if (selectedProperty) {
      const shareIds = [selectedProperty.share1_owner_id, selectedProperty.share2_owner_id, selectedProperty.share3_owner_id, selectedProperty.share4_owner_id].filter(Boolean);
      setAvailableCoOwners(owners.filter(o => shareIds.includes(o.id)));
    } else {
      setAvailableCoOwners([]);
    }
  };

  const filteredReservations = useMemo(() => reservations.filter(r =>
    (filterProperty === 'all' || r.property_id === filterProperty) &&
    (filterOwner === 'all' || r.owner_id === filterOwner) &&
    (filterStatus === 'all' || r.status === filterStatus)
  ), [reservations, filterProperty, filterOwner, filterStatus]);

  const resumen = useMemo(() => [
    { label: 'Total', count: reservations.length, color: 'bg-blue-50 text-blue-800', borderColor: 'border-blue-200' },
    ...STATUS_OPTIONS.map(opt => ({
      label: opt.label,
      count: reservations.filter(r => r.status === opt.value).length,
      color: opt.color,
      borderColor: opt.borderColor
    }))
  ], [reservations]);

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
      const date = new Date(dateString);
      return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
        .toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  const resetFilters = () => {
    setFilterProperty('all');
    setFilterOwner('all');
    setFilterStatus('all');
    toast({ title: 'Filtros limpiados', description: 'Mostrando todas las reservas.' });
  };

  if (loading) return <ReservationSkeleton />;

  return (
    <div className="space-y-8 p-4 md:p-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Reservas</h1>
        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg" size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Nueva Reserva
        </Button>
      </header>

      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Filtros</h2>
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-blue-600 hover:text-blue-800">
                <FilterX className="h-4 w-4 mr-2"/>
                Limpiar filtros
            </Button>
            </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Property', 'Owner', 'Status'].map(filterType => (
            <div key={filterType} className="relative">
              <label htmlFor={`${filterType.toLowerCase()}Filter`} className="block text-sm font-medium text-gray-700 mb-2">{filterType === 'Property' ? 'Propiedad' : filterType}</label>
              <select
                id={`${filterType.toLowerCase()}Filter`}
                value={{ 'Property': filterProperty, 'Owner': filterOwner, 'Status': filterStatus }[filterType]}
                onChange={e => {
                  if (filterType === 'Property') setFilterProperty(e.target.value);
                  if (filterType === 'Owner') setFilterOwner(e.target.value);
                  if (filterType === 'Status') setFilterStatus(e.target.value);
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">Todos</option>
                {(filterType === 'Property' ? properties : filterType === 'Owner' ? owners : STATUS_OPTIONS).map((item: any) => (
                  <option key={item.id || item.value} value={item.id || item.value}>
                    {filterType === 'Property' ? item.title : filterType === 'Owner' ? `${item.first_name} ${item.last_name}` : item.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-10 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {resumen.map(r => (
          <div key={r.label} className={`rounded-lg p-4 text-center border-l-4 ${r.borderColor} ${r.color} shadow-sm hover:shadow-lg transition-all`}>
            <div className="text-sm font-medium text-gray-600 mb-1">{r.label}</div>
            <div className="text-2xl font-bold text-gray-900">{r.count}</div>
          </div>
        ))}
      </section>

      <main>
        {filteredReservations.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-xl">No se encontraron reservas</p>
                <p className="text-gray-500 mt-2">Prueba a cambiar o limpiar los filtros.</p>
            </div>
        ) : (
          <>
            {/* --- Vista de Tarjetas para Móvil --- */}
            <div className="space-y-4 lg:hidden">
              {filteredReservations.map(r => {
            const statusStyle = getStatusStyle(r.status);
            return (
                  <div key={r.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 space-y-2">
                          <p className="font-semibold text-gray-800 text-lg flex items-center gap-2"><Home size={16} className="text-gray-500"/>{r.properties?.title || 'N/A'}</p>
                          <p className="text-gray-600 text-sm flex items-center gap-2"><User size={16} className="text-gray-500"/>{r.owner ? `${r.owner.first_name} ${r.owner.last_name}` : 'N/A'}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 rounded-full" onClick={() => setReservationToDelete(r)} disabled={isSubmitting}>
                            <Trash2 size={20} />
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2"><Calendar size={16} className="text-gray-500"/><span className="font-medium">{formatDate(r.start_date)}</span></div>
                      <div className="flex items-center gap-2"><Calendar size={16} className="text-gray-500"/><span className="font-medium">{formatDate(r.end_date)}</span></div>
                    </div>
                    <select value={r.status} onChange={e => handleStatusChange(r.id, e.target.value)} disabled={isSubmitting}
                      className={`w-full text-sm font-semibold border rounded-md px-3 py-2 ${statusStyle.borderColor} ${statusStyle.color} focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                      {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
            );
              })}
      </div>

            {/* --- Vista de Tabla para Escritorio --- */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propiedad</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propietario</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha inicio</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha fin</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
                        {filteredReservations.map(r => {
                const statusStyle = getStatusStyle(r.status);
                return (
                                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{r.properties?.title || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{r.owner ? `${r.owner.first_name} ${r.owner.last_name}` : r.owner_id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{formatDate(r.start_date)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{formatDate(r.end_date)}</div>
                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={r.status}
                        onChange={e => handleStatusChange(r.id, e.target.value)}
                                            disabled={isSubmitting}
                                            className={`text-sm border rounded-md px-3 py-2 ${statusStyle.borderColor} ${statusStyle.color} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                                            className="text-red-600 hover:bg-red-50 hover:text-red-700 p-2 rounded-full"
                                            onClick={() => setReservationToDelete(r)}
                                            disabled={isSubmitting}
                        aria-label="Eliminar reserva"
                      >
                                            <Trash2 size={20} />
                      </Button>
                    </td>
                  </tr>
                );
                        })}
          </tbody>
        </table>
      </div>
          </>
        )}
      </main>

      {/* --- Modal de Creación de Reserva (CORREGIDO) --- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">
            <header className="flex-shrink-0 flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900" id="modal-title">Nueva Reserva</h2>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => !isSubmitting && setShowCreateModal(false)} aria-label="Cerrar modal">
                    <X className="h-5 w-5" />
                </Button>
            </header>
            
            <div className="flex-grow overflow-y-auto">
              <form onSubmit={handleCreateSubmit} className="p-6">
                <div className="space-y-6">
                    {/* --- Fila 1: Propiedad y Propietario --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="createProperty">Propiedad *</Label>
                <div className="relative">
                                <select id="createProperty" name="property_id" required disabled={isSubmitting}
                                    onChange={(e) => handlePropertyChangeInForm(e.target.value)}
                                    className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                    <option value="" disabled selected>Selecciona una propiedad...</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
                        <div className="space-y-2">
                            <Label htmlFor="createOwner">Propietario *</Label>
              <div className="relative">
                                <select id="createOwner" name="owner_id" ref={ownerSelectRef} required disabled={isSubmitting || availableCoOwners.length === 0}
                                    className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100">
                                    <option value="" disabled selected>{availableCoOwners.length > 0 ? 'Selecciona un propietario...' : 'Selecciona una propiedad'}</option>
                                    {availableCoOwners.map(o => <option key={o.id} value={o.id}>{o.first_name} {o.last_name}</option>)}
                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
              </div>

                    {/* --- Fila 2: Fechas --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="createStartDate">Fecha inicio *</Label>
                            <Input id="createStartDate" name="start_date" type="date" required disabled={isSubmitting} />
                </div>
                        <div className="space-y-2">
                            <Label htmlFor="createEndDate">Fecha fin *</Label>
                            <Input id="createEndDate" name="end_date" type="date" required disabled={isSubmitting} />
                </div>
              </div>

                    {/* --- Fila 3: Estado --- */}
                    <div className="space-y-2">
                         <Label htmlFor="createStatus">Estado inicial *</Label>
                <div className="relative">
                            <select id="createStatus" name="status" defaultValue="pendiente" required disabled={isSubmitting}
                                className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
                
                <footer className="flex-shrink-0 flex items-center justify-end gap-3 pt-8 mt-6 border-t">
                    <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 w-36">
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Crear Reserva'}
                    </Button>
                </footer>
            </form>
          </div>
          </div>
        </div>
      )}

      {/* --- Modal de Confirmación de Eliminación --- */}
      {reservationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
              </div>
              <div className="mt-0 text-left">
                <h3 className="text-lg font-semibold text-gray-900">Eliminar Reserva</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    ¿Seguro que quieres eliminar la reserva en <strong className="font-bold">{reservationToDelete.properties?.title}</strong> del <strong className="font-bold">{formatDate(reservationToDelete.start_date)}</strong> al <strong className="font-bold">{formatDate(reservationToDelete.end_date)}</strong>?
                  </p>
                  <p className="text-sm text-red-700 mt-2">Esta acción no se puede deshacer.</p>
                </div>
              </div>
            </div>
            <footer className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setReservationToDelete(null)} disabled={isSubmitting}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDeleteReservation} disabled={isSubmitting}>{isSubmitting ? 'Eliminando...' : 'Sí, eliminar'}</Button>
            </footer>
          </div>
        </div>
      )}

      {/* Calendario unificado */}
      {filterProperty !== 'all' && !loading && (
        <section className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Calendario de Disponibilidad: <span className='font-bold text-blue-600'>{properties.find(p => p.id === filterProperty)?.title}</span>
          </h2>
          <UnifiedReservationCalendar 
            propiedadSeleccionada={properties.find(p => p.id === filterProperty)}
            pointsConfig={{ points_per_day: 10, points_per_day_weekday: 5 }}
          />
        </section>
      )}
    </div>
  );
};

export default AdminReservations; 