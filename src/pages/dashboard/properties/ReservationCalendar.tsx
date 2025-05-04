// Asegúrate de instalar react-calendar y sus tipos si usas TypeScript:
// npm install react-calendar
// npm install --save-dev @types/react-calendar

import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, EventPropGetter, SlotInfo } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '@/lib/supabase';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// --- Interfaces ---
interface Property {
  id: string;
  title: string;
  share1_owner_id?: string | null;
  share2_owner_id?: string | null;
  share3_owner_id?: string | null;
  share4_owner_id?: string | null;
}

interface Owner {
  id: string;
  first_name: string;
  last_name: string;
  shareLabel: string;
}

interface Reservation {
  id: string;
  property_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
}

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  owner_id: string;
}

interface ReservationCalendarProps {
  propertyId?: string;
}

// --- Configuración del Calendario ---
const locales = { 'es': es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const Colores = ['#4f8cff', '#ffb84f', '#4fff8c', '#ff4f8c', '#8c4fff', '#ff7b4f', '#4fffc3'];

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({ propertyId }) => {
  const { user } = useAuth();
  const params = useParams();
  const navigate = useNavigate();
  const [propiedades, setPropiedades] = useState<Property[]>([]);
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState<Property | null>(null);
  const [propietarios, setPropietarios] = useState<Owner[]>([]);
  const [reservas, setReservas] = useState<Reservation[]>([]);
  const [ownerSeleccionado, setOwnerSeleccionado] = useState<Owner | null>(null);
  const [loadingProps, setLoadingProps] = useState(true);
  const [loadingOwners, setLoadingOwners] = useState(false);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar Propiedades
  useEffect(() => {
    const fetchProperties = async () => {
      setLoadingProps(true);
      setError(null);
      try {
        let query = supabase
          .from('properties')
          .select('id, title, share1_owner_id, share2_owner_id, share3_owner_id, share4_owner_id');

        // Si es propietario, solo mostrar sus propiedades
        if (user?.role === 'owner') {
          query = query.or(`share1_owner_id.eq.${user.id},share2_owner_id.eq.${user.id},share3_owner_id.eq.${user.id},share4_owner_id.eq.${user.id}`);
        }

        const { data, error: dbError } = await query;

        if (dbError) throw dbError;

        setPropiedades(data || []);

        // Usar propertyId de prop si existe, si no, usar params
        const propId = propertyId || params.id;
        if (propId) {
          const selectedProperty = data?.find(p => p.id === propId);
          if (selectedProperty) {
            setPropiedadSeleccionada(selectedProperty);
          } else {
            setError('Propiedad no encontrada');
          }
        } else if (user?.role === 'owner' && data && data.length === 1) {
          // Si el usuario es propietario y solo tiene una propiedad, seleccionarla automáticamente
          setPropiedadSeleccionada(data[0]);
        }
      } catch (error) {
        console.error('Error al cargar propiedades:', error);
        setError('No se pudieron cargar las propiedades.');
        setPropiedades([]);
      } finally {
        setLoadingProps(false);
      }
    };

    fetchProperties();
  }, [propertyId, params.id, user]);

  // Cargar Propietarios y Reservas cuando cambia la propiedad seleccionada
  useEffect(() => {
    if (!propiedadSeleccionada) return;

    const loadData = async () => {
      setLoadingOwners(true);
      setLoadingReservations(true);
      setError(null);

      try {
        // Cargar propietarios
        const shares = [
          { label: 'Share 1', owner_id: propiedadSeleccionada.share1_owner_id },
          { label: 'Share 2', owner_id: propiedadSeleccionada.share2_owner_id },
          { label: 'Share 3', owner_id: propiedadSeleccionada.share3_owner_id },
          { label: 'Share 4', owner_id: propiedadSeleccionada.share4_owner_id },
        ].filter(s => s.owner_id);

        const ownerIds = shares.map(s => s.owner_id as string);

        if (ownerIds.length > 0) {
          const { data: ownersData, error: ownersError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', ownerIds)
            .eq('role', 'owner');

          if (ownersError) throw ownersError;

          const propietariosConShare = shares
            .map(share => {
              const owner = (ownersData || []).find(o => o.id === share.owner_id);
              return owner ? { ...owner, shareLabel: share.label } : undefined;
            })
            .filter((o): o is Owner => Boolean(o));

          setPropietarios(propietariosConShare);

          // Si el usuario es propietario, seleccionar automáticamente su share
          if (user?.role === 'owner') {
            const userOwner = propietariosConShare.find(o => o.id === user.id);
            if (userOwner) {
              setOwnerSeleccionado(userOwner);
            }
          }
        }

        // Cargar reservas
        const { data: reservationsData, error: reservationsError } = await supabase
          .from('property_reservations')
          .select('*')
          .eq('property_id', propiedadSeleccionada.id);

        if (reservationsError) throw reservationsError;
        setReservas(reservationsData || []);

      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos de la propiedad');
      } finally {
        setLoadingOwners(false);
        setLoadingReservations(false);
      }
    };

    loadData();
  }, [propiedadSeleccionada, user]);

  // Verificar permisos para la propiedad seleccionada
  const canManageReservations = (property: Property | null) => {
    if (!user || !property) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'owner') {
      return [
        property.share1_owner_id,
        property.share2_owner_id,
        property.share3_owner_id,
        property.share4_owner_id
      ].includes(user.id);
    }
    return false;
  };

  // Función para Reservar
  const reservarSemana = async ({ start, end }: { start: Date, end: Date }) => {
    if (!ownerSeleccionado || !propiedadSeleccionada) {
      toast({
        title: 'Error',
        description: 'Selecciona una propiedad y un propietario para reservar.',
        variant: 'destructive'
      });
      return;
    }

    if (!canManageReservations(propiedadSeleccionada)) {
      toast({
        title: 'Error',
        description: 'No tienes permisos para gestionar las reservas de esta propiedad',
        variant: 'destructive'
      });
      return;
    }

    setError(null);
    try {
      // Verificar conflictos
      const conflictingReservations = reservas.filter(res => {
        const resStart = new Date(res.start_date);
        const resEnd = new Date(res.end_date);
        return (
          (start >= resStart && start <= resEnd) ||
          (end >= resStart && end <= resEnd) ||
          (start <= resStart && end >= resEnd)
        );
      });

      if (conflictingReservations.length > 0) {
        toast({
          title: 'Error',
          description: 'Ya existe una reserva en ese rango de fechas',
          variant: 'destructive'
        });
        return;
      }

      const { error: upsertError } = await supabase
        .from('property_reservations')
        .upsert([{
          property_id: propiedadSeleccionada.id,
          owner_id: ownerSeleccionado.id,
          start_date: format(start, 'yyyy-MM-dd'),
          end_date: format(end, 'yyyy-MM-dd'),
        }]);

      if (upsertError) throw upsertError;

      // Recargar reservas
      const { data: updatedReservations, error: fetchError } = await supabase
        .from('property_reservations')
        .select('*')
        .eq('property_id', propiedadSeleccionada.id);

      if (fetchError) throw fetchError;
      setReservas(updatedReservations || []);

      toast({
        title: 'Éxito',
        description: 'Reserva creada correctamente'
      });

    } catch (err: any) {
      console.error('Error al crear reserva:', err);
      toast({
        title: 'Error',
        description: 'No se pudo crear la reserva',
        variant: 'destructive'
      });
    }
  };

  // --- Estilo de Eventos ---
  const eventPropGetter: EventPropGetter<CalendarEvent> = (event) => {
    const ownerIndex = propietarios.findIndex((p) => p.id === event.owner_id);
    const backgroundColor = ownerIndex !== -1 ? Colores[ownerIndex % Colores.length] : '#cccccc';
    return {
      style: {
        backgroundColor,
        color: '#222',
        borderRadius: '4px',
        border: 'none',
        opacity: 0.9
      },
    };
  };

  // --- Mapeo de Reservas a Eventos del Calendario ---
  const events: CalendarEvent[] = reservas.map((r) => {
    const owner = propietarios.find((p) => p.id === r.owner_id);
    const startDate = new Date(r.start_date + 'T00:00:00Z');
    const endDate = new Date(r.end_date + 'T00:00:00Z');
    return {
      title: owner ? `${owner.first_name} ${owner.last_name}` : 'Reservado (???)',
      start: startDate,
      end: endDate,
      owner_id: r.owner_id,
    };
  });

  // --- Manejar Selección de Slot ---
  const handleSelectSlot = (slotInfo: SlotInfo) => {
    if (!ownerSeleccionado) {
      alert('Por favor, selecciona un propietario antes de reservar una semana.');
      return;
    }
    reservarSemana({ start: slotInfo.start, end: slotInfo.end });
  };

  // --- Cálculo de resumen de reservas ---
  const totalReservas = reservas.length;
  const totalDiasReservados = reservas.reduce((acc, r) => {
    const start = new Date(r.start_date);
    const end = new Date(r.end_date);
    // Sumar días (incluyendo ambos extremos)
    return acc + ((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1);
  }, 0);
  const totalSemanasReservadas = reservas.reduce((acc, r) => {
    const start = new Date(r.start_date);
    const end = new Date(r.end_date);
    // Sumar semanas completas (redondeando hacia arriba)
    return acc + Math.ceil(((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1) / 7);
  }, 0);
  // Opcional: semanas libres (asumiendo 52 semanas/año)
  const semanasLibres = 52 - totalSemanasReservadas;

  // --- Renderizado ---
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {user?.role === 'owner' ? 'Mis Reservas' : 'Calendario de Reservas'}
        </h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/dashboard/admin/properties')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Volver a Propiedades
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Selector de Propiedad (solo si no hay propertyId en la URL y el usuario no es propietario o tiene múltiples propiedades) */}
      {!propertyId && !(user?.role === 'owner' && propiedades.length === 1) && (
        <div className="mb-6">
          <label className="block mb-2 font-medium">Seleccionar Propiedad:</label>
          <select
            className="w-full md:w-1/2 p-2 border rounded"
            value={propiedadSeleccionada?.id || ''}
            onChange={e => {
              const prop = propiedades.find(p => p.id === e.target.value);
              setPropiedadSeleccionada(prop || null);
              if (prop) {
                navigate(`/dashboard/admin/properties/${prop.id}/reservations`);
              }
            }}
            disabled={loadingProps}
          >
            <option value="">
              {loadingProps ? 'Cargando...' : '-- Selecciona una propiedad --'}
            </option>
            {propiedades.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
      )}

      {propiedadSeleccionada && (loadingOwners || propietarios.length > 0) && user?.role === 'admin' && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Selecciona Propietario para Reservar:</h3>
           {loadingOwners ? <p>Cargando propietarios...</p> :
              propietarios.length === 0 ? <p>No hay propietarios asociados a esta propiedad.</p> :
              propietarios.map((o, idx) => (
              <button
                key={o.id}
                style={{
                  background: ownerSeleccionado?.id === o.id ? Colores[idx % Colores.length] : '#eee',
                  color: '#222',
                  margin: '4px',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: `1px solid ${ownerSeleccionado?.id === o.id ? '#555' : '#ccc'}`,
                  cursor: 'pointer',
                  opacity: ownerSeleccionado?.id === o.id ? 1 : 0.8,
                  transition: 'background 0.2s ease',
                }}
                onClick={() => setOwnerSeleccionado(o)}
              >
                {o.first_name} {o.last_name}
                {o.shareLabel && (
                   <span style={{ fontSize: '0.8em', color: '#555', marginLeft: '8px' }}>
                     ({o.shareLabel})
                   </span>
                )}
              </button>
            ))}
        </div>
      )}

      {propiedadSeleccionada && (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Columna 1: Histórico y resumen */}
          <div className="w-full lg:w-1/3 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="font-semibold mb-3">Histórico de reservas</h3>
            {/* Resumen */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-indigo-50 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-600">Total reservas</div>
                <div className="font-bold text-lg">{totalReservas}</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-600">Semanas reservadas</div>
                <div className="font-bold text-lg">{totalSemanasReservadas}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-600">Días reservados</div>
                <div className="font-bold text-lg">{totalDiasReservados}</div>
              </div>
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-600">Semanas libres</div>
                <div className="font-bold text-lg">{semanasLibres}</div>
              </div>
            </div>
            {/* Histórico */}
            {reservas.length > 0 ? (
              <ul className="space-y-2">
                {reservas.map((r) => {
                  const owner = propietarios.find((p) => p.id === r.owner_id);
                  return (
                    <li key={r.id} className="pb-2 border-b border-gray-100">
                      <span className="font-medium">{owner ? `${owner.first_name} ${owner.last_name}` : 'Propietario desconocido'}</span>
                      <span className="text-gray-600 ml-2">
                        {` del ${r.start_date} al ${r.end_date}`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-gray-500 text-sm">No hay reservas para esta propiedad.</div>
            )}
          </div>

          {/* Columna 2: Calendario y formulario */}
          <div className="w-full lg:w-2/3">
            {/* Calendario */}
            <div className="relative h-[600px] mt-6 lg:mt-0">
              {loadingReservations && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                  <div className="bg-white p-3 rounded-lg shadow-sm">Cargando reservas...</div>
                </div>
              )}
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                selectable={!!ownerSeleccionado}
                onSelectSlot={handleSelectSlot}
                eventPropGetter={eventPropGetter}
                views={['month', 'week']}
                className={cn(
                  "h-[550px] transition-opacity duration-200",
                  loadingReservations && "opacity-50"
                )}
                messages={{
                  month: 'Mes',
                  week: 'Semana',
                  day: 'Día',
                  agenda: 'Agenda',
                  date: 'Fecha',
                  time: 'Hora',
                  event: 'Evento',
                  today: 'Hoy',
                  previous: '<',
                  next: '>',
                  noEventsInRange: 'No hay reservas en este rango.',
                  showMore: total => `+${total} más`,
                }}
                culture='es'
              />
            </div>

            {/* Lista de reservas adjudicadas */}
            {propiedadSeleccionada && reservas.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Semanas adjudicadas:</h4>
                <ul className="space-y-2">
                  {reservas.map((r) => {
                    const owner = propietarios.find((p) => p.id === r.owner_id);
                    return (
                      <li key={r.id} className="flex items-center justify-between">
                        <span>
                          {owner ? `${owner.first_name} ${owner.last_name}` : 'Propietario desconocido'}: 
                          {` del ${r.start_date} al ${r.end_date}`}
                        </span>
                        <button
                          className="ml-3 px-3 py-1 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                          onClick={async () => {
                            if (window.confirm('¿Seguro que quieres eliminar esta reserva?')) {
                              const { error } = await supabase
                                .from('property_reservations')
                                .delete()
                                .eq('id', r.id);
                              if (!error) {
                                // Recargar reservas
                                const { data: updatedReservations } = await supabase
                                  .from('property_reservations')
                                  .select('*')
                                  .eq('property_id', propiedadSeleccionada.id);
                                setReservas(updatedReservations || []);
                              } else {
                                alert('Error al eliminar la reserva');
                              }
                            }
                          }}
                        >
                          🗑️ Eliminar
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

       {!propiedadSeleccionada && !loadingProps && <p style={{marginTop: '30px', textAlign: 'center', color: '#666'}}>Selecciona una propiedad para ver el calendario de reservas.</p>}
    </div>
  );
};

export default ReservationCalendar; 