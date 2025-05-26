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
  const [isMobile, setIsMobile] = useState(false);

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
    setFilteredProperties(result);
  }, [properties, bedrooms, bathrooms, minPoints, maxPoints, exchangeConfigs]);

  // Mostrar dos meses a la vista
  const defaultDate = new Date();
  const maxDate = addMonths(defaultDate, 1);

  return (
    <div className="p-2 sm:p-4 max-w-7xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-2">Explorar propiedades para intercambio</h1>
      
      {/* Contenedor de filtros mejorado */}
      <div className="mb-4 sm:mb-6 bg-white rounded-lg shadow-sm p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Filtro fechas */}
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Rango de fechas</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal h-9">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ?
                    dateRange.to
                      ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
                      : format(dateRange.from, 'dd/MM/yyyy')
                    : <span className="text-sm">Selecciona fechas</span>
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <DayPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={isMobile ? 1 : 2}
                  locale={es}
                  className="rounded-md border"
                />
                {(dateRange?.from || dateRange?.to) && (
                  <div className="px-4 py-2 border-t">
                    <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-800 justify-center" onClick={() => setDateRange(undefined)}>
                      Limpiar fechas
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtro Guest point */}
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Guest point</label>
            <div className="flex gap-2">
              <select
                value={minPoints}
                onChange={e => setMinPoints(e.target.value)}
                className="w-full border rounded-md px-2 py-1.5 text-sm bg-white"
              >
                {Array.from({ length: 17 }, (_, i) => 40 + i * 10).map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
              <span className="flex items-center">a</span>
              <select
                value={maxPoints}
                onChange={e => setMaxPoints(e.target.value)}
                className="w-full border rounded-md px-2 py-1.5 text-sm bg-white"
              >
                {Array.from({ length: 17 }, (_, i) => 40 + i * 10).map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtro habitaciones */}
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Habitaciones mín.</label>
            <select
              value={bedrooms}
              onChange={e => setBedrooms(e.target.value)}
              className="w-full border rounded-md px-2 py-1.5 text-sm bg-white"
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
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Baños mín.</label>
            <select
              value={bathrooms}
              onChange={e => setBathrooms(e.target.value)}
              className="w-full border rounded-md px-2 py-1.5 text-sm bg-white"
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
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-10">Cargando propiedades...</div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No hay propiedades que coincidan.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProperties.map(prop => (
            <Card key={prop.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
              {/* Imagen de la propiedad */}
              <div className="relative w-full h-48 sm:h-56 bg-gray-100 rounded-t-md overflow-hidden">
                {prop.image_url ? (
                  <img 
                    src={prop.image_url} 
                    alt={prop.title} 
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-200" 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <span className="text-sm">Sin imagen</span>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                {/* Información de la propiedad */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold line-clamp-2">{prop.title}</h3>
                  
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    {prop.zona && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                        {prop.zona}
                      </span>
                    )}
                    {typeof prop.lavabos === 'number' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-50 text-green-700">
                        {prop.lavabos} lavabos
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-1">{prop.location}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <span>🛏</span>
                      <span>{prop.bedrooms || '-'} hab.</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🛁</span>
                      <span>{prop.bathrooms || '-'} baños</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🏠</span>
                      <span>{prop.area || '-'} m²</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🏷️</span>
                      <span className="truncate">{prop.property_type}</span>
                    </div>
                  </div>
                </div>

                {/* Botón de disponibilidad */}
                <Button
                  variant="outline"
                  className="w-full mt-4 text-sm"
                  onClick={() => setOpenCalendar(openCalendar === prop.id ? null : prop.id)}
                >
                  {openCalendar === prop.id ? 'Ocultar disponibilidad' : 'Ver disponibilidad'}
                </Button>

                {/* Calendario */}
                {openCalendar === prop.id && (
                  <div className="mt-4 border-t pt-4">
                    <div className="text-xs text-gray-500 font-medium mb-2">Disponibilidad (2 meses):</div>
                    <div className="overflow-x-auto">
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
                        style={{ height: 300 }}
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
                  </div>
                )}

                {/* Botón de solicitar intercambio */}
                <Button
                  variant="default"
                  className="w-full mt-4"
                  onClick={() => navigate('/dashboard/owner/exchange', { state: { property: prop, dateRange } })}
                  disabled={!dateRange?.from || !dateRange?.to}
                >
                  Solicitar intercambio
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreExchangeProperties; 