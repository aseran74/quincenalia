import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '@/lib/supabase';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

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
  start_date: string;
  end_date: string;
  status: 'pendiente' | 'aprobada' | 'rechazada';
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  isOwner: boolean;
}

const OwnerReservations: React.FC = () => {
  const { user } = useAuth();
  const [myProperty, setMyProperty] = useState<Property | null>(null);
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        // Obtener la propiedad del propietario y su número de share
        const { data: propertyData } = await supabase
          .from('properties')
          .select('id, title, share1_owner_id, share2_owner_id, share3_owner_id, share4_owner_id')
          .or(`share1_owner_id.eq.${user.id},share2_owner_id.eq.${user.id},share3_owner_id.eq.${user.id},share4_owner_id.eq.${user.id}`)
          .single();

        if (propertyData) {
          let shareNumber = 0;
          if (propertyData.share1_owner_id === user.id) shareNumber = 1;
          else if (propertyData.share2_owner_id === user.id) shareNumber = 2;
          else if (propertyData.share3_owner_id === user.id) shareNumber = 3;
          else if (propertyData.share4_owner_id === user.id) shareNumber = 4;

          setMyProperty({
            id: propertyData.id,
            title: propertyData.title,
            share_number: shareNumber
          });

          // Obtener todas las reservas de la propiedad
          const { data: resData } = await supabase
            .from('property_reservations')
            .select('*')
            .eq('property_id', propertyData.id);

          setAllReservations(resData || []);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos',
          variant: 'destructive'
        });
      }
      setLoading(false);
    };

    fetchData();
  }, [user?.id]);

  const handleSelectSlot = async ({ start, end }: { start: Date, end: Date }) => {
    if (!user?.id || !myProperty) return;
    
    try {
      // Verificar si ya existe una reserva en ese rango de fechas
      const conflictingReservations = allReservations.filter(res => {
        const resStart = new Date(res.start_date);
        const resEnd = new Date(res.end_date);
        const newStart = start;
        const newEnd = end;
        return (
          (newStart >= resStart && newStart <= resEnd) ||
          (newEnd >= resStart && newEnd <= resEnd) ||
          (newStart <= resStart && newEnd >= resEnd)
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

      const { error } = await supabase.from('property_reservations').insert([
        {
          property_id: myProperty.id,
          owner_id: user.id,
          start_date: format(start, 'yyyy-MM-dd'),
          end_date: format(end, 'yyyy-MM-dd'),
          status: 'pendiente'
        }
      ]);

      if (error) throw error;

      toast({
        title: 'Reserva creada',
        description: 'Tu solicitud de reserva está pendiente de aprobación',
      });

      // Recargar reservas
      const { data } = await supabase
        .from('property_reservations')
        .select('*')
        .eq('property_id', myProperty.id);
      
      setAllReservations(data || []);

    } catch (error) {
      console.error('Error al crear reserva:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la reserva',
        variant: 'destructive'
      });
    }
  };

  const events: CalendarEvent[] = allReservations.map((r) => ({
    id: r.id,
    title: r.owner_id === user?.id ? 
      `Mi reserva - ${r.status}` : 
      `Reservado por otro propietario`,
    start: new Date(r.start_date + 'T00:00:00Z'),
    end: new Date(r.end_date + 'T00:00:00Z'),
    status: r.status,
    isOwner: r.owner_id === user?.id
  }));

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#4f8cff'; // pendiente
    let opacity = 0.8;

    if (!event.isOwner) {
      backgroundColor = '#64748b'; // gris para reservas de otros
      opacity = 0.5;
    } else {
      if (event.status === 'aprobada') backgroundColor = '#22c55e';
      if (event.status === 'rechazada') backgroundColor = '#ef4444';
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity,
        color: 'white',
        border: 'none',
        display: 'block'
      }
    };
  };

  if (loading) {
    return <div className="p-4">Cargando...</div>;
  }

  if (!myProperty) {
    return (
      <div className="p-6">
        <Card className="p-4">
          <h2 className="text-xl font-semibold text-red-600">No tienes ninguna propiedad asignada</h2>
          <p className="mt-2 text-gray-600">Contacta con el administrador si crees que esto es un error.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reservas de mi Propiedad</h1>
      <p className="mb-4 text-gray-600">
        Propiedad: {myProperty.title} (Share #{myProperty.share_number})
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="p-4">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              selectable
              onSelectSlot={handleSelectSlot}
              eventPropGetter={eventStyleGetter}
              messages={{
                next: "Siguiente",
                previous: "Anterior",
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Día"
              }}
            />
          </Card>
        </div>
        
        <div>
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Mis Reservas</h2>
            <div className="space-y-4">
              {allReservations.filter(r => r.owner_id === user?.id).length === 0 ? (
                <p className="text-gray-500">No tienes reservas activas</p>
              ) : (
                allReservations
                  .filter(r => r.owner_id === user?.id)
                  .map(reservation => (
                    <div 
                      key={reservation.id} 
                      className="p-3 rounded border"
                    >
                      <div className="text-sm text-gray-600">
                        {format(new Date(reservation.start_date), 'dd/MM/yyyy')} - 
                        {format(new Date(reservation.end_date), 'dd/MM/yyyy')}
                      </div>
                      <div className={`text-sm mt-1 ${
                        reservation.status === 'aprobada' 
                          ? 'text-green-600' 
                          : reservation.status === 'rechazada'
                          ? 'text-red-600'
                          : 'text-blue-600'
                      }`}>
                        Estado: {reservation.status}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OwnerReservations; 