import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar as DayPickerCalendar } from '@/components/ui/calendar';
import { format, parse, startOfWeek, getDay, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

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

  // Estado para rango seleccionado
  const [selectedRange, setSelectedRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [preselectedDates, setPreselectedDates] = useState<{ start: string; end: string } | null>(null);

  const { toast } = useToast();

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

  // Días ocupados (reservas normales e intercambio)
  const bookedDays = useMemo(() => {
    const days: Date[] = [];
    (reservas[prop.id] || []).forEach(r => {
      const start = new Date(r.start_date);
      const end = new Date(r.end_date);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d));
      }
    });
    return days;
  }, [reservas, prop.id]);

  // Handler para seleccionar rango
  const handleSelectRange = (range: { from?: Date; to?: Date }) => {
    setSelectedRange(range);
    if (range.from && range.to) {
      // Verificar que el rango no toque días ocupados
      let valid = true;
      for (let d = new Date(range.from); d <= range.to; d.setDate(d.getDate() + 1)) {
        if (bookedDays.some(bd => bd.toDateString() === d.toDateString())) {
          valid = false;
          break;
        }
      }
      if (valid) {
        setPreselectedDates({
          start: range.from.toISOString().slice(0, 10),
          end: range.to.toISOString().slice(0, 10),
        });
        setShowCreateModal(true);
      } else {
        toast({ title: 'Fechas ocupadas', description: 'El rango seleccionado incluye días ya reservados.', variant: 'destructive' });
      }
    }
  };
  // Handler para mostrar info de reserva al hacer clic en día ocupado
  const handleDayClick = (day: Date) => {
    const reserva = (reservas[prop.id] || []).find(r => {
      const start = new Date(r.start_date);
      const end = new Date(r.end_date);
      return day >= start && day <= end;
    });
    if (reserva) {
      toast({
        title: 'Reserva',
        description: `Propietario: ${reserva.owner_id}\nDel: ${reserva.start_date} al ${reserva.end_date}\nEstado: ${(reserva as any).status || ''}`,
      });
    }
  };

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
                <DayPickerCalendar
                  mode="range"
                  selected={selectedRange}
                  onSelect={handleSelectRange}
                  disabled={date => bookedDays.some(bd => bd.toDateString() === date.toDateString())}
                  modifiers={{ booked: bookedDays }}
                  modifiersClassNames={{ booked: 'bg-indigo-200 text-indigo-700' }}
                  onDayClick={handleDayClick}
                  className="text-base md:text-lg lg:text-xl p-2 md:p-6 lg:p-8 [&_.rdp]:!w-full"
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