// Asegúrate de instalar react-calendar y sus tipos si usas TypeScript:
// npm install react-calendar
// npm install --save-dev @types/react-calendar

import { Calendar, dateFnsLocalizer, EventPropGetter, SlotInfo } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '@/lib/supabase';
import { format, parse, startOfWeek, getDay, addDays, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import React, { useState, useEffect, useMemo } from 'react';

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
  status?: string;
  isExchange?: boolean;
  isPending?: boolean;
}

interface ReservationCalendarProps {
  propertyId?: string;
  exchangeMode?: boolean; // Si es true, reserva en exchange_reservations
  pointsConfig?: {
    points_per_day: number;
    points_per_day_weekday: number;
  };
  ownerPoints?: number;
  onPointsChange?: (newPoints: number) => void;
  selectedDates?: Date[];
  onSelectedDatesChange?: (dates: Date[]) => void;
  ownerIdForReservation?: string; // Añadido para soporte admin
  onReservationCreated?: () => void; // Por si se usa
  onSelectSlot?: (slotInfo: { start: Date, end: Date }) => void; // NUEVO: para selección desde el padre
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
const pastelColores = Colores.map(c => c + '22'); // Añade transparencia para un pastel suave

// Colores para estados de reservas de intercambio
const exchangeStatusColors: Record<string, string> = {
  'aprobada': '#4f8cff', // azul
  'pendiente': '#ffb84f', // naranja
  'anulada': '#ff4f8c', // rojo
  'cancelada': '#cccccc', // gris
};

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({ propertyId, exchangeMode = false, pointsConfig, ownerPoints, onPointsChange, selectedDates, onSelectedDatesChange, ownerIdForReservation, onReservationCreated, onSelectSlot }) => {
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

  // --- ESTADO PARA EL CALENDARIO ---
  // `dates` guarda el rango. PrimeReact se encarga de la lógica de selección.
  const [dates, setDates] = useState<(Date | null)[]>([null, null]);

  // Cargar Propiedades
  useEffect(() => {
    const fetchProperties = async () => {
      setLoadingProps(true);
      setError(null);
      try {
        let query = supabase
          .from('properties')
          .select('id, title, share1_owner_id, share2_owner_id, share3_owner_id, share4_owner_id');

        const { data, error: dbError } = await query;
        if (dbError) throw dbError;

        let filtered = data || [];
        if (!exchangeMode && user?.role === 'owner') {
          filtered = filtered.filter(p => [p.share1_owner_id, p.share2_owner_id, p.share3_owner_id, p.share4_owner_id].includes(user.id));
        }
        setPropiedades(filtered);

        // Usar propertyId de prop si existe, si no, usar params
        const propId = propertyId || params.id;
        if (propId) {
          const selectedProperty = filtered.find(p => p.id === propId);
          if (selectedProperty) {
            setPropiedadSeleccionada(selectedProperty);
          } else {
            setError('Propiedad no encontrada');
          }
        } else if (user?.role === 'owner' && filtered && filtered.length === 1) {
          setPropiedadSeleccionada(filtered[0]);
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
        console.log('[RESERVAS] ownerIds:', ownerIds);

        let propietariosConShare: Owner[] = [];
        if (ownerIds.length > 0) {
          const { data: ownersData, error: ownersError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', ownerIds)
            .eq('role', 'owner');

          if (ownersError) throw ownersError;

          console.log('[RESERVAS] ownersData:', ownersData);

          propietariosConShare = shares
            .map(share => {
              const owner = (ownersData || []).find(o => o.id === share.owner_id);
              return owner ? { ...owner, shareLabel: share.label } : undefined;
            })
            .filter((o): o is Owner => Boolean(o));
        }

        // Cargar reservas normales
        const { data: reservationsData, error: reservationsError } = await supabase
          .from('property_reservations')
          .select('*, owner:profiles!fk_owner_profile (id, first_name, last_name)')
          .eq('property_id', propiedadSeleccionada.id);
        if (reservationsError) throw reservationsError;

        // Cargar reservas de intercambio
        const { data: exchangeData, error: exchangeError } = await supabase
          .from('exchange_reservations')
          .select('*')
          .eq('property_id', propiedadSeleccionada.id);
        if (exchangeError) throw exchangeError;

        // Unir ambas reservas (todas las de intercambio y normales, sin filtrar por estado ni owner)
        const allReservations = [
          ...(reservationsData || []),
          ...((exchangeData || []).map(r => ({
            ...r,
            title: 'Reserva Guest points',
            isExchange: true
          })))
        ];
        setReservas(allReservations);

        // --- Añadir owners de reservas que no estén en propietariosConShare ---
        const allOwnerIds = Array.from(new Set(allReservations.map(r => r.owner_id)));
        const missingOwnerIds = allOwnerIds.filter(id => !propietariosConShare.some(o => o.id === id));
        let extraOwners: any[] = [];
        if (missingOwnerIds.length > 0) {
          const { data: extraOwnersData } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', missingOwnerIds);
          extraOwners = extraOwnersData || [];
        }
        // Unir ambos arrays sin duplicados
        const allOwners = [
          ...propietariosConShare,
          ...extraOwners.filter(o => !propietariosConShare.some(p => p.id === o.id))
        ];
        setPropietarios(allOwners);

        // Selección automática de propietario
        if (user?.role === 'owner') {
          const userOwner = allOwners.find(o => o.id === user.id);
          if (userOwner) {
            setOwnerSeleccionado(userOwner);
          } else if (exchangeMode) {
            setOwnerSeleccionado({
              id: user.id,
              first_name: (user as any).first_name || '',
              last_name: (user as any).last_name || '',
              shareLabel: 'Intercambio'
            });
          }
        }
        if (user?.role === 'admin' && allOwners.length > 0) {
          setOwnerSeleccionado(allOwners[0]);
        }
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
  const reservarSemana = async () => {
    const [startDate, endDate] = dates;
    if (!startDate || !endDate) {
      toast({ title: 'Error', description: 'Selecciona un rango completo.', variant: 'destructive' });
      return;
    }
    // Validación: solo puede reservar si es owner de la propiedad, excepto en modo intercambio
    if (!exchangeMode && user?.role === 'owner' && ![
      propiedadSeleccionada.share1_owner_id,
      propiedadSeleccionada.share2_owner_id,
      propiedadSeleccionada.share3_owner_id,
      propiedadSeleccionada.share4_owner_id
    ].includes(user.id)) {
      toast({
        title: 'Error',
        description: 'No puedes reservar en una propiedad que no te pertenece.',
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
      // --- FETCH en tiempo real de todas las reservas (normales + intercambio) antes de validar conflicto ---
      const [{ data: reservationsData }, { data: exchangeData }] = await Promise.all([
        supabase.from('property_reservations').select('*, owner:profiles!fk_owner_profile (id, first_name, last_name)').eq('property_id', propiedadSeleccionada.id),
        supabase.from('exchange_reservations').select('*').eq('property_id', propiedadSeleccionada.id)
      ]);
      const allReservations = [
        ...(reservationsData || []),
        ...((exchangeData || []).map(r => ({
          ...r,
          title: 'Reserva Guest points',
          isExchange: true
        })))
      ];
      // Validación de conflicto sobre el array fresco
      const conflictingReservations = allReservations.filter(res => {
        const resStart = new Date(res.start_date);
        const resEnd = new Date(res.end_date);
        return (
          (startDate >= resStart && startDate <= resEnd) ||
          (endDate >= resStart && endDate <= resEnd) ||
          (startDate <= resStart && endDate >= resEnd)
        );
      });
      if (conflictingReservations.length > 0) {
        toast({
          title: 'Error',
          description: 'Ya existe una reserva (normal o intercambio) en ese rango de fechas',
          variant: 'destructive'
        });
        return;
      }

      // --- Lógica de intercambio ---
      if (exchangeMode && pointsConfig && ownerPoints !== undefined && onPointsChange) {
        // Calcular coste en puntos
        let total = 0;
        let d = new Date(startDate);
        const endDate = new Date(endDate);
        while (d <= endDate) {
          if ([0, 6].includes(d.getDay())) {
            total += pointsConfig.points_per_day;
          } else {
            total += pointsConfig.points_per_day_weekday;
          }
          d.setDate(d.getDate() + 1);
        }
        if (total > ownerPoints) {
          toast({
            title: 'Error',
            description: 'No tienes suficientes puntos para esta reserva',
            variant: 'destructive'
          });
          return;
        }
        // Insertar en exchange_reservations
        const { error: upsertError } = await supabase
          .from('exchange_reservations')
          .insert({
            property_id: propiedadSeleccionada.id,
            owner_id: ownerSeleccionado.id,
            start_date: format(startDate, 'yyyy-MM-dd'),
            end_date: format(endDate, 'yyyy-MM-dd'),
            status: 'pendiente',
            points: total,
            points_used: total
          });
        if (upsertError) throw upsertError;
        onPointsChange(ownerPoints - total);
        toast({
          title: 'Éxito',
          description: 'Reserva de intercambio enviada y puntos descontados. Pendiente de aprobación.',
          variant: 'success'
        });
        // Recargar reservas normales y de intercambio tras crear la reserva
        const [{ data: reservationsData }, { data: exchangeData }] = await Promise.all([
          supabase.from('property_reservations').select('*, owner:profiles!fk_owner_profile (id, first_name, last_name)').eq('property_id', propiedadSeleccionada.id),
          supabase.from('exchange_reservations').select('*').eq('property_id', propiedadSeleccionada.id)
        ]);
        const allReservations = [
          ...(reservationsData || []),
          ...((exchangeData || []).map(r => ({
            ...r,
            title: 'Reserva Guest points',
            isExchange: true
          })))
        ];
        setReservas(allReservations);
        return;
      }
      // --- Lógica normal ---
      const { error: upsertError } = await supabase
        .from('property_reservations')
        .upsert([{
          property_id: propiedadSeleccionada.id,
          owner_id: ownerSeleccionado.id,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
        }]);

      if (upsertError) throw upsertError;

      // Recargar reservas
      const { data: updatedReservations, error: fetchError } = await supabase
        .from('property_reservations')
        .select('*, owner:profiles!fk_owner_profile (id, first_name, last_name)')
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
    setDates([null, null]); // Limpiar selección
  };

  // --- Mapeo de Reservas a Eventos del Calendario ---
  console.log('Reservas para el calendario:', reservas);
  let events: CalendarEvent[] = reservas.map((r) => {
    const owner = propietarios.find((p) => p.id === r.owner_id);
    const startDate = new Date(r.start_date + 'T00:00:00Z');
    const endDate = new Date(r.end_date + 'T00:00:00Z');
    const status = (r as any).status || '';
    // --- NUEVO: Mostrar titular, guest points y '/Guest Point' en reservas de intercambio ---
    let title = '';
    if ((r as any).isExchange) {
      const points = (r as any).points || (r as any).points_used;
      if (owner) {
        title = `${owner.first_name} ${owner.last_name}${points ? ` ${points} gp` : ''}/Guest Point`;
      } else {
        title = `owner${points ? ` ${points} gp` : ''}/Guest Point`;
      }
    } else {
      title = status === 'fija'
        ? 'Reserva fija' + (owner ? ` (${owner.first_name} ${owner.last_name})` : '')
        : (typeof (r as any).title === 'string' && (r as any).title) || (owner ? `${owner.first_name} ${owner.last_name}` : 'Reservado (???)');
    }
    return {
      title,
      start: startDate,
      end: endDate,
      owner_id: r.owner_id,
      status,
      isExchange: !!(r as any).isExchange
    };
  });
  // Si hay fechas seleccionadas, añadir evento temporal
  if (selectedDates && selectedDates.length > 0) {
    events = [
      ...events,
      {
        title: 'Reserva pendiente',
        start: new Date(selectedDates[0]),
        end: new Date(selectedDates[selectedDates.length-1]),
        owner_id: user?.id || '',
        status: 'pendiente',
        isPending: true
      }
    ];
  }

  // --- Manejar Selección de Slot ---
  const handleSelectSlot = (slotInfo: SlotInfo) => {
    if (typeof slotInfo.start === 'object' && typeof slotInfo.end === 'object' && onSelectSlot) {
      onSelectSlot({ start: slotInfo.start, end: slotInfo.end });
      return;
    }
    if (!ownerSeleccionado) {
      alert('Por favor, selecciona un propietario antes de reservar una semana.');
      return;
    }
    if (typeof slotInfo.start === 'object' && typeof slotInfo.end === 'object' && onSelectedDatesChange) {
      const dates: Date[] = [];
      let d = new Date(slotInfo.start);
      const end = new Date(slotInfo.end);
      while (d <= end) {
        dates.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
      onSelectedDatesChange(dates);
    }
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

  // --- Estilo de Eventos ---
  const eventPropGetter: EventPropGetter<CalendarEvent> = (event) => {
    // Si es evento temporal de reserva pendiente
    if ((event as any).isPending) {
      return {
        style: {
          backgroundColor: '#b3e0ff',
          color: '#222',
          borderRadius: '4px',
          border: '2px dashed #0077cc',
          opacity: 0.7
        },
      };
    }
    // Si es reserva fija
    if ((event as any).status === 'fija') {
      return {
        style: {
          backgroundColor: '#a5d8ff', // azul claro
          color: '#1c3a5b',
          borderRadius: '4px',
          border: '2px solid #339af0',
          opacity: 0.95
        },
      };
    }
    // Si es reserva de intercambio, usar color según estado
    if ((event as any).isExchange && (event as any).status) {
      const color = exchangeStatusColors[(event as any).status] || '#cccccc';
      return {
        style: {
          backgroundColor: color,
          color: '#222',
          borderRadius: '4px',
          border: 'none',
          opacity: 0.9
        },
      };
    }
    // Normal: color por propietario
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

  // --- Preparamos las fechas deshabilitadas para PrimeReact ---
  const disabledDates = useMemo(() => {
    const datesToDisable: Date[] = [];
    reservas.forEach(res => {
      let currentDate = new Date(res.start_date);
      const lastDate = new Date(res.end_date);
      // Ajustamos la zona horaria para evitar problemas
      currentDate.setMinutes(currentDate.getMinutes() + currentDate.getTimezoneOffset());
      lastDate.setMinutes(lastDate.getMinutes() + currentDate.getTimezoneOffset());
      while (currentDate <= lastDate) {
        datesToDisable.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    return datesToDisable;
  }, [reservas]);

  // --- Calculamos el número de noches para el resumen ---
  const nochesSeleccionadas = useMemo(() => {
    const [startDate, endDate] = dates;
    if (startDate && endDate) {
      return differenceInDays(endDate, startDate);
    }
    return 0;
  }, [dates]);

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
          {loadingOwners ? (
            <p>Cargando propietarios...</p>
          ) : propietarios.length === 0 ? (
            <p>No hay propietarios asociados a esta propiedad.</p>
          ) : (
            <div
              role="grid-owners"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '10px',
                maxWidth: '340px',
                margin: '16px auto 0 auto',
              }}
            >
              {propietarios.slice(0, 4).map((o, idx) => {
                const isSelected = ownerSeleccionado?.id === o.id;
                const color = Colores[idx % Colores.length];
                const pastel = pastelColores[idx % pastelColores.length];
                return (
                  <button
                    key={o.id}
                    style={{
                      background: isSelected ? color : pastel,
                      color: isSelected ? '#fff' : '#374151',
                      height: '56px',
                      width: '100%',
                      borderRadius: '12px',
                      border: isSelected ? `2px solid ${color}` : '2px solid #e5e7eb',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '14px',
                      boxShadow: isSelected ? '0 2px 8px 0 rgba(0,0,0,0.10)' : '0 1px 4px 0 rgba(0,0,0,0.04)',
                      opacity: isSelected ? 1 : 0.97,
                      transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
                      outline: isSelected ? '2px solid #222' : 'none',
                      minWidth: '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                    }}
                    onClick={() => setOwnerSeleccionado(o)}
                  >
                    {o.first_name} {o.last_name}
                  </button>
                );
              })}
              <style>{`
                @media (min-width: 640px) {
                  /* PC y tablet: 1x4 */
                  div[role='grid-owners'] {
                    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
                    max-width: 600px !important;
                  }
                }
              `}</style>
            </div>
          )}
        </div>
      )}

      {/* Botón Confirmar Reserva para admin */}
      {user?.role === 'admin' && propiedadSeleccionada && ownerSeleccionado && selectedDates && selectedDates.length > 0 && (
        <div className="mb-6 flex items-center gap-4">
          <div className="text-sm text-gray-700">
            <b>Propietario:</b> {ownerSeleccionado.first_name} {ownerSeleccionado.last_name} <br />
            <b>Fechas:</b> {format(selectedDates[0], 'dd/MM/yyyy')} - {format(selectedDates[selectedDates.length-1], 'dd/MM/yyyy')}
          </div>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow"
            onClick={reservarSemana}
          >
            Confirmar reserva
          </button>
        </div>
      )}

      {propiedadSeleccionada && (
        <div className="flex flex-col gap-8 lg:gap-8">
          {/* Resumen e histórico arriba en escritorio */}
          <div className="w-full bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-4">
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
                  // --- NUEVO: Mostrar guest points y '/Guest Point' en histórico si es intercambio ---
                  let label = '';
                  if ((r as any).isExchange) {
                    const points = (r as any).points || (r as any).points_used;
                    if (owner) {
                      label = `${owner.first_name} ${owner.last_name}${points ? ` ${points} gp` : ''}/Guest Point`;
                    } else {
                      label = `owner${points ? ` ${points} gp` : ''}/Guest Point`;
                    }
                  } else {
                    label = owner ? `${owner.first_name} ${owner.last_name}` : 'Propietario desconocido';
                  }
                  return (
                    <li key={r.id} className="pb-2 border-b border-gray-100">
                      <span className="font-medium">{label}</span>
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
          {/* Calendario ocupa todo el ancho */}
          <div className="w-full">
            <div className="relative h-[700px] mt-6 lg:mt-0">
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
                  "h-[700px] transition-opacity duration-200",
                  loadingReservations && "opacity-50"
                )}
                selected={selectedDates && selectedDates.length > 0 ? selectedDates[0] : undefined}
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
          </div>
        </div>
      )}

       {!propiedadSeleccionada && !loadingProps && <p style={{marginTop: '30px', textAlign: 'center', color: '#666'}}>Selecciona una propiedad para ver el calendario de reservas.</p>}
    </div>
  );
};

export default ReservationCalendar; 