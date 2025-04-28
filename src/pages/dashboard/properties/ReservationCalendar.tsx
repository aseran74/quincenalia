// Asegúrate de instalar react-calendar y sus tipos si usas TypeScript:
// npm install react-calendar
// npm install --save-dev @types/react-calendar

import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, EventPropGetter, SlotInfo } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '@/lib/supabase';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';

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

const ReservationCalendar: React.FC = () => {
  const [propiedades, setPropiedades] = useState<Property[]>([]);
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState<Property | null>(null);
  const [propietarios, setPropietarios] = useState<Owner[]>([]);
  const [reservas, setReservas] = useState<Reservation[]>([]);
  const [ownerSeleccionado, setOwnerSeleccionado] = useState<Owner | null>(null);
  const [loadingProps, setLoadingProps] = useState(true);
  const [loadingOwners, setLoadingOwners] = useState(false);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Cargar Propiedades ---
  useEffect(() => {
    setLoadingProps(true);
    setError(null);
    supabase
      .from('properties')
      .select('id, title, share1_owner_id, share2_owner_id, share3_owner_id, share4_owner_id')
      .then(({ data, error: dbError }) => {
        if (dbError) {
          setError('No se pudieron cargar las propiedades.');
          setPropiedades([]);
        } else {
          setPropiedades(data || []);
        }
        setLoadingProps(false);
      });
  }, []);

  // --- Cargar Propietarios y Reservas cuando cambia la propiedad seleccionada ---
  useEffect(() => {
    setPropietarios([]);
    setReservas([]);
    setOwnerSeleccionado(null);
    setError(null);

    if (!propiedadSeleccionada) return;

    setLoadingOwners(true);
    setLoadingReservations(true);

    const shares = [
      { label: 'Share 1', owner_id: propiedadSeleccionada.share1_owner_id },
      { label: 'Share 2', owner_id: propiedadSeleccionada.share2_owner_id },
      { label: 'Share 3', owner_id: propiedadSeleccionada.share3_owner_id },
      { label: 'Share 4', owner_id: propiedadSeleccionada.share4_owner_id },
    ].filter(s => s.owner_id);

    const ownerIds = shares.map(s => s.owner_id as string);

    if (ownerIds.length === 0) {
      setLoadingOwners(false);
    } else {
      supabase
        .from('property_owners')
        .select('id, first_name, last_name')
        .in('id', ownerIds)
        .then(({ data: ownersData, error: ownersError }) => {
          if (ownersError) {
            setError('No se pudieron cargar los propietarios.');
            setPropietarios([]);
          } else {
            const propietariosConShare = shares
              .map(share => {
                const owner = (ownersData || []).find(o => o.id === share.owner_id);
                return owner ? { ...owner, shareLabel: share.label } : undefined;
              })
              .filter((o): o is Owner => Boolean(o));
            setPropietarios(propietariosConShare);
          }
          setLoadingOwners(false);
        });
    }

    supabase
      .from('property_reservations')
      .select('*')
      .eq('property_id', propiedadSeleccionada.id)
      .then(({ data: reservationsData, error: reservationsError }) => {
        if (reservationsError) {
          setError('No se pudieron cargar las reservas.');
          setReservas([]);
        } else {
          setReservas(reservationsData || []);
        }
        setLoadingReservations(false);
      });
  }, [propiedadSeleccionada]);

  // --- Función para Reservar ---
  const reservarSemana = async ({ start, end }: { start: Date, end: Date }) => {
    if (!ownerSeleccionado || !propiedadSeleccionada) {
      alert('Selecciona una propiedad y un propietario para reservar.');
      return;
    }
    setError(null);
    try {
      const { error: upsertError } = await supabase.from('property_reservations').upsert([
        {
          property_id: propiedadSeleccionada.id,
          owner_id: ownerSeleccionado.id,
          start_date: format(start, 'yyyy-MM-dd'),
          end_date: format(end, 'yyyy-MM-dd'),
        },
      ], { onConflict: 'property_id, start_date' });

      if (upsertError) throw upsertError;

      setLoadingReservations(true);
      const { data: updatedReservations, error: fetchError } = await supabase
        .from('property_reservations')
        .select('*')
        .eq('property_id', propiedadSeleccionada.id);

      if (fetchError) throw fetchError;

      setReservas(updatedReservations || []);

    } catch (err: any) {
      setError(`Error al guardar la reserva: ${err.message}`);
    } finally {
      setLoadingReservations(false);
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
    <div style={{ padding: '20px' }}>
      <h2>Reservar semanas por Propietario</h2>

      {/* Selector de Propiedad */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="property-select" style={{ marginRight: '10px' }}>Propiedad:</label>
        <select
          id="property-select"
          value={propiedadSeleccionada?.id || ''}
          onChange={e => {
            const propId = e.target.value;
            const prop = propiedades.find(p => p.id === propId) || null;
            setPropiedadSeleccionada(prop);
          }}
          disabled={loadingProps}
          style={{ padding: '8px', minWidth: '200px' }}
        >
          <option value="">{loadingProps ? 'Cargando...' : '-- Selecciona una propiedad --'}</option>
          {propiedades.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '15px' }}>Error: {error}</div>}

      {/* Selector de Propietarios */}
      {propiedadSeleccionada && (loadingOwners || propietarios.length > 0) && (
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
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          {/* Columna 1: Histórico y resumen */}
          <div style={{ flex: 1, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #0001', padding: 16, border: '1px solid #eee' }}>
            <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Histórico de reservas</h3>
            {/* Resumen */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
              <div style={{ background: '#e0e7ff', borderRadius: 6, padding: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#555' }}>Total reservas</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{totalReservas}</div>
              </div>
              <div style={{ background: '#fef9c3', borderRadius: 6, padding: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#555' }}>Semanas reservadas</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{totalSemanasReservadas}</div>
              </div>
              <div style={{ background: '#bbf7d0', borderRadius: 6, padding: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#555' }}>Días reservados</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{totalDiasReservados}</div>
              </div>
              <div style={{ background: '#fee2e2', borderRadius: 6, padding: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#555' }}>Semanas libres</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{semanasLibres}</div>
              </div>
            </div>
            {/* Histórico */}
            {reservas.length > 0 ? (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {reservas.map((r, idx) => {
                  const owner = propietarios.find((p) => p.id === r.owner_id);
                  return (
                    <li key={r.id} style={{ marginBottom: 8, borderBottom: '1px solid #eee', paddingBottom: 6 }}>
                      <span style={{ fontWeight: 500 }}>{owner ? `${owner.first_name} ${owner.last_name}` : 'Propietario desconocido'}</span>
                      <span style={{ color: '#666', marginLeft: 8 }}>
                        {` del ${r.start_date} al ${r.end_date}`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div style={{ color: '#888', fontSize: 14 }}>No hay reservas para esta propiedad.</div>
            )}
          </div>
          {/* Columna 2: Calendario y formulario */}
          <div style={{ flex: 2 }}>
            {/* Calendario */}
            <div style={{ marginTop: '24px', height: '600px', position: 'relative' }}>
               {loadingReservations && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '5px', zIndex: 10 }}>Cargando reservas...</div>}
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                selectable={!!ownerSeleccionado}
                onSelectSlot={handleSelectSlot}
                eventPropGetter={eventPropGetter}
                views={['month', 'week']}
                style={{ height: '550px', opacity: loadingReservations ? 0.5 : 1 }}
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
              <div style={{ marginTop: 24 }}>
                <h4>Semanas adjudicadas:</h4>
                <ul>
                  {reservas.map((r) => {
                    const owner = propietarios.find((p) => p.id === r.owner_id);
                    return (
                      <li key={r.id} style={{ marginBottom: 8 }}>
                        <span>
                          {owner ? `${owner.first_name} ${owner.last_name}` : 'Propietario desconocido'}: 
                          {` del ${r.start_date} al ${r.end_date}`}
                        </span>
                        <button
                          style={{
                            marginLeft: 12,
                            color: 'white',
                            background: '#e53e3e',
                            border: 'none',
                            borderRadius: 4,
                            padding: '2px 8px',
                            cursor: 'pointer'
                          }}
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