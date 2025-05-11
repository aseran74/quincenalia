import * as React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, addMonths, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PropertyFilters from '@/components/properties/PropertyFilters';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Select } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

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
  location?: string;
  image_url?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  property_type?: string;
  features?: string[];
  share1_owner_id?: string | null;
  share2_owner_id?: string | null;
  share3_owner_id?: string | null;
  share4_owner_id?: string | null;
  zona?: string;
  lavabos?: number;
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

const ExploreExchangeProperties: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [reservas, setReservas] = useState<Record<string, Reservation[]>>({});
  const [exchangeConfigs, setExchangeConfigs] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [openCalendar, setOpenCalendar] = useState<string | null>(null);
  // Filtros
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [minPoints, setMinPoints] = useState('40');
  const [maxPoints, setMaxPoints] = useState('300');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      // Traer todas las propiedades
      const { data: propsData, error: propsError } = await supabase
        .from('properties')
        .select('*');
      if (propsError) {
        setProperties([]);
        setFilteredProperties([]);
        setLoading(false);
        return;
      }
      // Filtrar: solo 100% vendidas y no propias
      const fullySold = (propsData || []).filter((p: any) =>
        ['vendido', 'vendida'].includes((p.share1_status || '').toLowerCase()) &&
        ['vendido', 'vendida'].includes((p.share2_status || '').toLowerCase()) &&
        ['vendido', 'vendida'].includes((p.share3_status || '').toLowerCase()) &&
        ['vendido', 'vendida'].includes((p.share4_status || '').toLowerCase())
      );
      const notMine = fullySold.filter((p: any) =>
        [p.share1_owner_id, p.share2_owner_id, p.share3_owner_id, p.share4_owner_id].every((id: string) => id !== user?.id)
      );
      setProperties(notMine);
      setFilteredProperties(notMine);
      // Cargar reservas y exchange config para cada propiedad
      const reservasObj: Record<string, Reservation[]> = {};
      const configsObj: Record<string, any> = {};
      for (const prop of notMine) {
        const { data: resNorm } = await supabase
          .from('property_reservations')
          .select('*')
          .eq('property_id', prop.id);
        const { data: resEx } = await supabase
          .from('exchange_reservations')
          .select('*')
          .eq('property_id', prop.id);
        reservasObj[prop.id] = [
          ...(resNorm || []),
          ...((resEx || []).map(r => ({ ...r, isExchange: true })))
        ];
        // Configuración de puntos
        const { data: configData } = await supabase
          .from('exchange_properties')
          .select('*')
          .eq('property_id', prop.id)
          .eq('active', true)
          .single();
        configsObj[prop.id] = configData;
      }
      setReservas(reservasObj);
      setExchangeConfigs(configsObj);
      setLoading(false);
    };
    if (user?.id) fetchProperties();
  }, [user?.id]);

  // Filtrado avanzado
  useEffect(() => {
    let result = properties;
    // Filtro habitaciones
    if (bedrooms && bedrooms !== '') {
      result = result.filter((p) => (p.bedrooms ?? 0) >= parseInt(bedrooms, 10));
    }
    // Filtro baños
    if (bathrooms && bathrooms !== '') {
      result = result.filter((p) => (p.bathrooms ?? 0) >= parseInt(bathrooms, 10));
    }
    // Filtro puntos/día
    if (minPoints !== '' || maxPoints !== '') {
      result = result.filter((p) => {
        const config = exchangeConfigs[p.id];
        if (!config) return false;
        const points = config.points_per_day;
        if (minPoints !== '' && points < Number(minPoints)) return false;
        if (maxPoints !== '' && points > Number(maxPoints)) return false;
        return true;
      });
    }
    // Filtro de fechas (solo mostrar propiedades sin reservas solapadas)
    if (dateRange && dateRange.from && dateRange.to) {
      result = result.filter((property) => {
        const reservasProp = reservas[property.id] || [];
        const start = dateRange.from!;
        const end = dateRange.to!;
        // Si alguna reserva se solapa, la propiedad NO está disponible
        return !reservasProp.some(r => {
          const resStart = new Date(r.start_date);
          const resEnd = new Date(r.end_date);
          return resStart <= end && resEnd >= start;
        });
      });
    }
    setFilteredProperties(result);
  }, [properties, bedrooms, bathrooms, minPoints, maxPoints, dateRange, reservas, exchangeConfigs]);

  // Mostrar dos meses a la vista
  const defaultDate = new Date();
  const maxDate = addMonths(defaultDate, 1);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Explorar propiedades para intercambio</h1>
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-end">
        {/* Filtro fechas */}
        <div>
          <label className="block font-medium mb-1">Rango de fechas</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ?
                  dateRange.to
                    ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
                    : format(dateRange.from, 'dd/MM/yyyy')
                  : <span>Selecciona fechas</span>
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <DayPicker
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={es}
              />
              {(dateRange?.from || dateRange?.to) && (
                <div className="px-4 py-2">
                  <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-800 justify-center" onClick={() => setDateRange(undefined)}>
                    Limpiar fechas
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
        {/* Filtro Guest point */}
        <div>
          <label className="block font-medium mb-1">Guest point</label>
          <div className="flex gap-2">
            <select
              value={minPoints}
              onChange={e => setMinPoints(e.target.value)}
              className="w-24 border rounded px-2 py-1"
            >
              {Array.from({ length: 17 }, (_, i) => 40 + i * 10).map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
            <span className="mx-1">a</span>
            <select
              value={maxPoints}
              onChange={e => setMaxPoints(e.target.value)}
              className="w-24 border rounded px-2 py-1"
            >
              {Array.from({ length: 17 }, (_, i) => 40 + i * 10).map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Filtro habitaciones */}
        <div>
          <label className="block font-medium mb-1">Habitaciones mín.</label>
          <select
            value={bedrooms}
            onChange={e => setBedrooms(e.target.value)}
            className="w-24 border rounded px-2 py-1"
          >
            <option value="">Todas</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
        {/* Filtro baños */}
        <div>
          <label className="block font-medium mb-1">Baños mín.</label>
          <select
            value={bathrooms}
            onChange={e => setBathrooms(e.target.value)}
            className="w-24 border rounded px-2 py-1"
          >
            <option value="">Todos</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="text-center text-gray-500 py-10">Cargando propiedades...</div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No hay propiedades que coincidan.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(prop => (
            <Card key={prop.id} className="shadow-md">
              {/* Card visual igual que en /properties */}
              <div className="relative w-full h-48 bg-gray-200 rounded-t-md overflow-hidden">
                {prop.image_url ? (
                  <img src={prop.image_url} alt={prop.title} className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">Sin imagen</div>
                )}
              </div>
              <CardContent>
                <div className="mt-3 mb-2 flex flex-col gap-1">
                  <div className="text-lg font-semibold">{prop.title}</div>
                  {prop.zona && (
                    <div className="flex items-center gap-2 text-gray-700 text-xs">
                      <span className="font-semibold">Zona:</span> {prop.zona}
                    </div>
                  )}
                  {typeof prop.lavabos === 'number' && (
                    <div className="flex items-center gap-2 text-gray-700 text-xs">
                      <span className="font-semibold">Lavabos:</span> {prop.lavabos}
                    </div>
                  )}
                  <div className="text-sm text-gray-600">{prop.location}</div>
                  <div className="flex gap-3 text-sm text-gray-500 mt-1">
                    <span>🛏 {prop.bedrooms || '-'} hab.</span>
                    <span>🛁 {prop.bathrooms || '-'} baños</span>
                    <span>🏠 {prop.area || '-'} m²</span>
                    <span>🏷️ {prop.property_type}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="mt-2 mb-2"
                  onClick={() => setOpenCalendar(openCalendar === prop.id ? null : prop.id)}
                >
                  {openCalendar === prop.id ? 'Ocultar disponibilidad' : 'Ver disponibilidad'}
                </Button>
                {openCalendar === prop.id && (
                  <div className="mb-2 mt-2">
                    <div className="mb-2 text-xs text-gray-500 font-semibold">Disponibilidad (2 meses):</div>
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
                  </div>
                )}
                <Button
                  variant="default"
                  className="w-full mt-2"
                  onClick={() => navigate('/dashboard/owner/exchange', { state: { property: prop, dateRange } })}
                  disabled={!dateRange?.from || !dateRange?.to}
                >
                  Solicitar intercambio
                </Button>
              </CardContent>
              <CardFooter>
                {/* Aquí podrías poner un botón de "Solicitar intercambio" si lo deseas */}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreExchangeProperties; 