import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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
  share1_owner_id?: string | null;
  share2_owner_id?: string | null;
  share3_owner_id?: string | null;
  share4_owner_id?: string | null;
}

interface Reservation {
  id: string;
  property_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  status: string;
  isExchange?: boolean;
}

const CoPropertiesCalendar: React.FC = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filter, setFilter] = useState('');
  const [reservas, setReservas] = useState<Record<string, Reservation[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      // Buscar propiedades donde el usuario es copropietario
      const { data: propsData, error: propsError } = await supabase
        .from('properties')
        .select('*')
        .or(`share1_owner_id.eq.${user?.id},share2_owner_id.eq.${user?.id},share3_owner_id.eq.${user?.id},share4_owner_id.eq.${user?.id}`);
      if (propsError) {
        setProperties([]);
        setLoading(false);
        return;
      }
      setProperties(propsData || []);
      // Para cada propiedad, cargar reservas normales e intercambio
      const reservasObj: Record<string, Reservation[]> = {};
      for (const prop of propsData || []) {
        const { data: resNorm, error: errNorm } = await supabase
          .from('property_reservations')
          .select('*')
          .eq('property_id', prop.id);
        const { data: resEx, error: errEx } = await supabase
          .from('exchange_reservations')
          .select('*')
          .eq('property_id', prop.id);
        reservasObj[prop.id] = [
          ...(resNorm || []),
          ...((resEx || []).map(r => ({ ...r, isExchange: true })))
        ];
      }
      setReservas(reservasObj);
      setLoading(false);
    };
    if (user?.id) fetchProperties();
  }, [user?.id]);

  // Filtrar propiedades por nombre
  const filteredProperties = properties.filter(p =>
    p.title.toLowerCase().includes(filter.toLowerCase())
  );

  // Mostrar dos meses a la vista
  const defaultDate = new Date();
  const maxDate = addMonths(defaultDate, 1);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mis Copropiedades - Disponibilidad Bimensual</h1>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Filtrar por nombre de propiedad..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full max-w-md"
        />
      </div>
      {loading ? (
        <div className="text-center text-gray-500 py-10">Cargando propiedades...</div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No tienes copropiedades o no hay coincidencias.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(prop => (
            <Card key={prop.id} className="shadow-md">
              <CardHeader>
                <CardTitle>{prop.title}</CardTitle>
                <div className="text-sm text-gray-600 mt-1">
                  ID: <span className="font-mono">{prop.id}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-2 text-xs text-gray-500">Disponibilidad (2 meses):</div>
                <Calendar
                  localizer={localizer}
                  events={(reservas[prop.id] || []).map(r => ({
                    title: r.isExchange ? 'Intercambio' : 'Reserva',
                    start: new Date(r.start_date + 'T00:00:00Z'),
                    end: new Date(r.end_date + 'T00:00:00Z'),
                    allDay: true,
                    resource: r
                  }))}
                  startAccessor="start"
                  endAccessor="end"
                  views={['month']}
                  defaultView="month"
                  defaultDate={defaultDate}
                  min={defaultDate}
                  max={maxDate}
                  style={{ height: 350 }}
                  eventPropGetter={event => ({
                    style: {
                      backgroundColor: event.resource.isExchange ? '#4f8cff' : '#ffb84f',
                      color: '#222',
                      borderRadius: '4px',
                      border: 'none',
                      opacity: 0.9
                    }
                  })}
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoPropertiesCalendar; 