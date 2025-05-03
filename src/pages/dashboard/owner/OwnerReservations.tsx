import React, { useEffect, useState } from 'react';
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
import { Info } from 'lucide-react';

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
  const [properties, setProperties] = useState<any[]>([]);
  const [reservations, setReservations] = useState<{ [propertyId: string]: Reservation[] }>({});
  const [loading, setLoading] = useState(true);
  // Estado para el modal de reserva
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProp, setSelectedProp] = useState<any>(null);
  const [selectedShare, setSelectedShare] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      if (!user?.id) return;
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('id, title, share1_owner_id, share1_status, share2_owner_id, share2_status, share3_owner_id, share3_status, share4_owner_id, share4_status');
      const props = (propertiesData || []).map(p => {
        const shares = [];
        if (p.share1_owner_id === user.id && ['vendida', 'reservada'].includes(p.share1_status)) shares.push({ num: 1, status: p.share1_status });
        if (p.share2_owner_id === user.id && ['vendida', 'reservada'].includes(p.share2_status)) shares.push({ num: 2, status: p.share2_status });
        if (p.share3_owner_id === user.id && ['vendida', 'reservada'].includes(p.share3_status)) shares.push({ num: 3, status: p.share3_status });
        if (p.share4_owner_id === user.id && ['vendida', 'reservada'].includes(p.share4_status)) shares.push({ num: 4, status: p.share4_status });
        return shares.length > 0 ? { id: p.id, title: p.title, shares } : null;
      }).filter(Boolean);
      setProperties(props);
      setLoading(false);
      // Cargar reservas para cada propiedad
      props.forEach(async (prop) => {
        const { data: resData } = await supabase
          .from('property_reservations')
          .select('*')
          .eq('property_id', prop.id);
        setReservations(prev => ({ ...prev, [prop.id]: resData || [] }));
      });
    };
    fetchProperties();
  }, [user?.id]);

  const handleOpenModal = (prop: any, share: any) => {
    setSelectedProp(prop);
    setSelectedShare(share);
    setStartDate('');
    setEndDate('');
    setModalOpen(true);
  };

  const handleReserve = async () => {
    if (!user?.id || !selectedProp || !selectedShare || !startDate || !endDate) return;
    const resList = reservations[selectedProp.id] || [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Verificar conflictos
    const conflicting = resList.some(res => {
      const resStart = new Date(res.start_date);
      const resEnd = new Date(res.end_date);
      return (
        (start >= resStart && start <= resEnd) ||
        (end >= resStart && end <= resEnd) ||
        (start <= resStart && end >= resEnd)
      );
    });
    if (conflicting) {
      toast({ title: 'Error', description: 'Ya existe una reserva en ese rango de fechas', variant: 'destructive' });
      return;
    }
    // LOG de depuración antes del insert
    console.log('Insertando reserva:', {
      property_id: selectedProp.id,
      owner_id: user.id,
      start_date: format(start, 'yyyy-MM-dd'),
      end_date: format(end, 'yyyy-MM-dd'),
      status: 'pendiente'
    });
    const { error } = await supabase.from('property_reservations').insert([
      {
        property_id: selectedProp.id,
        owner_id: user.id,
        start_date: format(start, 'yyyy-MM-dd'),
        end_date: format(end, 'yyyy-MM-dd'),
        status: 'pendiente'
      }
    ]);
    // LOG de depuración después del insert
    if (error) {
      console.error('Error al insertar reserva:', error);
      toast({ title: 'Error', description: 'No se pudo crear la reserva', variant: 'destructive' });
      return;
    }
    toast({ title: 'Reserva creada', description: 'Tu solicitud de reserva está pendiente de aprobación' });
    setModalOpen(false);
    // Recargar reservas
    const { data: resData } = await supabase
      .from('property_reservations')
      .select('*')
      .eq('property_id', selectedProp.id);
    setReservations(prev => ({ ...prev, [selectedProp.id]: resData || [] }));
  };

  if (loading) return <div className="p-4">Cargando...</div>;

  return (
    <div className="container mx-auto p-6 font-poppins space-y-8">
      {properties.length === 0 ? (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <h1 className="text-2xl font-bold">Mis Copropiedades asignadas</h1>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No tienes copropiedades reservadas ni compradas.</p>
          </CardContent>
        </Card>
      ) : (
        properties.map(prop => (
          <Card key={prop.id} className="max-w-2xl mx-auto">
            <CardHeader>
              <h2 className="text-xl font-bold">{prop.title}</h2>
            </CardHeader>
            <CardContent>
              {prop.shares.map(share => {
                const resList = (reservations[prop.id] || []).filter(r => r.share_number === share.num);
                const events = (reservations[prop.id] || []).map(r => ({
                  id: r.id,
                  title: r.owner_id === user.id ? `Mi reserva - ${r.status}` : `Reservado por otro propietario`,
                  start: new Date(r.start_date + 'T00:00:00Z'),
                  end: new Date(r.end_date + 'T00:00:00Z'),
                  status: r.status,
                  isOwner: r.owner_id === user.id
                }));
                const eventStyleGetter = (event: any) => {
                  let backgroundColor = '#4f8cff';
                  let opacity = 0.8;
                  if (!event.isOwner) {
                    backgroundColor = '#64748b';
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
                return (
                  <div key={share.num} className="mb-8">
                    <div className="flex items-center mb-2 gap-2">
                      <h3 className="font-semibold">Share #{share.num} ({share.status})</h3>
                      <Button variant="ghost" size="icon" onClick={() => setHelpOpen(true)} title="¿Cómo reservar?">
                        <Info className="w-5 h-5" />
                      </Button>
                    </div>
                    <Calendar
                      localizer={localizer}
                      events={events}
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: 400 }}
                      selectable
                      onSelectSlot={(slot) => {
                        setSelectedProp(prop);
                        setSelectedShare(share);
                        setStartDate(format(slot.start, 'yyyy-MM-dd'));
                        setEndDate(format(slot.end, 'yyyy-MM-dd'));
                        setModalOpen(true);
                      }}
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
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))
      )}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent aria-describedby="reserva-descripcion">
          <DialogHeader>
            <DialogTitle>Reservar semana</DialogTitle>
          </DialogHeader>
          <div id="reserva-descripcion" className="py-2 text-gray-600">
            Selecciona la fecha de inicio y fin para tu reserva. Recuerda que no debe solaparse con otras reservas existentes.
          </div>
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Fecha inicio</label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block mb-1">Fecha fin</label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleReserve} disabled={!startDate || !endDate}>Reservar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Cómo reservar?</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-gray-700">
            Para reservar, selecciona un rango de fechas en el calendario y confirma en el modal que aparecerá.
          </div>
          <DialogFooter>
            <Button onClick={() => setHelpOpen(false)}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnerReservations; 