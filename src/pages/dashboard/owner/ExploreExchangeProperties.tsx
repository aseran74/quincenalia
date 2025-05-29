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
import { Calendar as CalendarIcon, MapPin, Bed, Bath, Square, Home, Star, Filter, Eye, EyeOff, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
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
  images?: string[] | null;
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
  share1_status?: string;
  share2_status?: string;
  share3_status?: string;
  share4_status?: string;
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
  const [showFilters, setShowFilters] = useState(false);

  // Estado para rastrear la imagen actual para cada propiedad
  const [propertyImageIndexes, setPropertyImageIndexes] = useState<Record<string, number>>({});

  // Manejador genérico para cambiar la imagen de una propiedad específica
  const updateImageIndex = (propertyId: string, direction: 'prev' | 'next', totalImages: number) => {
    setPropertyImageIndexes(prevIndexes => {
      const currentIndex = prevIndexes[propertyId] || 0;
      let newIndex = currentIndex;
      if (direction === 'next') {
        newIndex = (currentIndex + 1) % totalImages;
      } else if (direction === 'prev') {
        newIndex = (currentIndex - 1 + totalImages) % totalImages;
      }
      return { ...prevIndexes, [propertyId]: newIndex };
    });
  };

  useEffect(() => {
    console.log('useEffect in ExploreExchangeProperties running...');
    const fetchProperties = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      console.log('Fetching properties...');

      try {
      // Traer todas las propiedades
      const { data: propsData, error: propsError } = await supabase
        .from('properties')
          .select('*'); // Seleccionar todas las columnas de la tabla properties

      if (propsError) {
          console.error('Error al cargar propiedades:', propsError);
        setProperties([]);
        setFilteredProperties([]);
        setLoading(false);
        return;
      }
        
        const allProperties = propsData || [];
        console.log(`Total properties fetched: ${allProperties.length}`);

        // Filtrar solo las propiedades que tienen todos los shares vendidos
        const fullySoldProperties = allProperties.filter(p =>
          ['vendida'].includes((p.share1_status || '').toLowerCase()) &&
          ['vendida'].includes((p.share2_status || '').toLowerCase()) &&
          ['vendida'].includes((p.share3_status || '').toLowerCase()) &&
          ['vendida'].includes((p.share4_status || '').toLowerCase())
        );
        console.log(`Fully sold properties: ${fullySoldProperties.length}`);

        // Filtrar las propiedades completamente vendidas para excluir aquellas donde el usuario sea propietario de cualquier share
        const notOwnedByMeFullySold = fullySoldProperties.filter(p =>
          ![p.share1_owner_id, p.share2_owner_id, p.share3_owner_id, p.share4_owner_id].some((id: string | null | undefined) => id === user?.id)
        );
        console.log(`Fully sold and not owned by me: ${notOwnedByMeFullySold.length}`);

        setProperties(notOwnedByMeFullySold);
        setFilteredProperties(notOwnedByMeFullySold);

        // Inicializar los índices de imagen para las propiedades cargadas
        const initialIndexes: Record<string, number> = {};
        notOwnedByMeFullySold.forEach(prop => {
            initialIndexes[prop.id] = 0; // Empezar siempre por la primera imagen
        });
        setPropertyImageIndexes(initialIndexes);

        // Cargar reservas y exchange config solo para las propiedades filtradas
      const reservasObj: Record<string, Reservation[]> = {};
      const configsObj: Record<string, any> = {};
        for (const prop of notOwnedByMeFullySold) { 
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
      } catch (error) {
        console.error('Error al cargar propiedades:', error);
        setProperties([]);
        setFilteredProperties([]);
        setLoading(false);
      }
    };
    if (user?.id) fetchProperties();
  }, [user?.id]);

  // Filtrado avanzado
  useEffect(() => {
    let result = properties; // Start with the list of fully sold, not-owned properties

    // Filtro fechas: Solo mostrar propiedades disponibles en el rango seleccionado
    if (dateRange?.from && dateRange?.to) {
        const start = dateRange.from;
        const end = dateRange.to;
        result = result.filter(prop => {
            const reservationsForProp = reservas[prop.id] || [];
            // Verificar si el rango seleccionado se solapa con alguna reserva
            const isAvailable = reservationsForProp.every(reservation => {
                const resStart = new Date(reservation.start_date);
                const resEnd = new Date(reservation.end_date);
                // No hay solapamiento si el fin seleccionado es antes del inicio de la reserva O si el inicio seleccionado es después del fin de la reserva
                return end < resStart || start > resEnd;
            });
            return isAvailable;
        });
    }

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
  }, [properties, bedrooms, bathrooms, minPoints, maxPoints, exchangeConfigs, dateRange, reservas]);

  // Mostrar dos meses a la vista
  const defaultDate = new Date();
  const maxDate = addMonths(defaultDate, 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-yellow-300" />
            <h1 className="text-3xl sm:text-4xl font-bold">Explorar Intercambios</h1>
          </div>
          <p className="text-blue-100 text-lg">Descubre propiedades únicas para tu próximo intercambio</p>
          <div className="mt-4 text-sm bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
            {filteredProperties.length} propiedades disponibles
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-4 relative z-10">
        {/* Panel de filtros mejorado */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filtros de búsqueda</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              {showFilters ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${!showFilters ? 'hidden lg:grid' : ''}`}>
            {/* Filtro fechas mejorado */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-indigo-500" />
                Fechas de intercambio
              </label>
          <Popover>
            <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left font-normal h-11 bg-white/50 hover:bg-white/80 border-gray-200"
                  >
                {dateRange?.from ?
                  dateRange.to
                    ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
                    : format(dateRange.from, 'dd/MM/yyyy')
                      : <span className="text-gray-500">Selecciona fechas</span>
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
                    <div className="px-4 py-3 border-t bg-gray-50">
                      <Button 
                        variant="ghost" 
                        className="w-full text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50" 
                        onClick={() => setDateRange(undefined)}
                      >
                    Limpiar fechas
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

            {/* Filtro Guest Points mejorado */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Guest Points por día
              </label>
              <div className="flex gap-2 items-center">
            <select
              value={minPoints}
              onChange={e => setMinPoints(e.target.value)}
                  className="flex-1 h-11 border border-gray-200 rounded-lg px-3 text-sm bg-white/50 hover:bg-white/80 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {Array.from({ length: 17 }, (_, i) => 40 + i * 10).map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
                <span className="text-gray-400 text-sm font-medium">a</span>
            <select
              value={maxPoints}
              onChange={e => setMaxPoints(e.target.value)}
                  className="flex-1 h-11 border border-gray-200 rounded-lg px-3 text-sm bg-white/50 hover:bg-white/80 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {Array.from({ length: 17 }, (_, i) => 40 + i * 10).map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>
        </div>

            {/* Filtro habitaciones mejorado */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Bed className="h-4 w-4 text-purple-500" />
                Habitaciones mín.
              </label>
          <select
            value={bedrooms}
            onChange={e => setBedrooms(e.target.value)}
                className="w-full h-11 border border-gray-200 rounded-lg px-3 text-sm bg-white/50 hover:bg-white/80 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Todas</option>
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}+ habitaciones</option>
                ))}
          </select>
        </div>

            {/* Filtro baños mejorado */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Bath className="h-4 w-4 text-blue-500" />
                Baños mín.
              </label>
          <select
            value={bathrooms}
            onChange={e => setBathrooms(e.target.value)}
                className="w-full h-11 border border-gray-200 rounded-lg px-3 text-sm bg-white/50 hover:bg-white/80 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Todos</option>
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}+ baños</option>
                ))}
          </select>
        </div>
      </div>
        </div>

        {/* Contenido principal */}
      {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Cargando propiedades increíbles...</p>
              <p className="text-gray-400 text-sm mt-1">Esto solo tomará un momento</p>
            </div>
          </div>
      ) : filteredProperties.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No encontramos propiedades</h3>
              <p className="text-gray-600 mb-4">Intenta ajustar tus filtros para ver más opciones</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setDateRange(undefined);
                  setBedrooms('');
                  setBathrooms('');
                  setMinPoints('40');
                  setMaxPoints('300');
                }}
                className="bg-white/80 hover:bg-white"
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
            {filteredProperties.map(prop => {
              const config = exchangeConfigs[prop.id];
              const pointsPerDay = config?.points_per_day || 0;

              // Obtener el índice de imagen actual para esta propiedad
              const currentImageIndex = propertyImageIndexes[prop.id] || 0;
              const totalImages = prop.images?.length || 0;

              return (
                <Card key={prop.id} className="group overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  {/* Imagen mejorada con controles */}
                  <div className="relative overflow-hidden h-64">
                    {/* Usar la imagen en el índice actual si existe */}
                    {totalImages > 0 && prop.images?.[currentImageIndex] ? (
                      <>
                        <img
                          src={prop.images[currentImageIndex]}
                          alt={`${prop.title} - Image ${currentImageIndex + 1}`}
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                        />
                        {/* Gradiente y flechas de navegación */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between p-2">
                          {totalImages > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="z-10 text-white hover:bg-white/30"
                              onClick={(e) => { e.stopPropagation(); updateImageIndex(prop.id, 'prev', totalImages); }}
                            >
                              <ArrowLeft className="h-6 w-6" />
                            </Button>
                          )}
                          {totalImages > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="z-10 text-white hover:bg-white/30"
                              onClick={(e) => { e.stopPropagation(); updateImageIndex(prop.id, 'next', totalImages); }}
                            >
                              <ArrowRight className="h-6 w-6" />
                            </Button>
                )}
              </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
                        <Home className="h-16 w-16 text-gray-400" />
                    </div>
                  )}

                    {/* Badge de puntos */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      {pointsPerDay} pts/día
                    </div>

                    {/* Badge de zona */}
                    {prop.zona && (
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                        {prop.zona}
                    </div>
                  )}
                  </div>

                  <CardContent className="p-6">
                    {/* Título y ubicación */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {prop.title}
                      </h3>
                      {prop.location && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm line-clamp-1">{prop.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Características en grid mejorado */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-gray-700">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Bed className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Habitaciones</div>
                          <div className="font-semibold">{prop.bedrooms || '—'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-700">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Bath className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Baños</div>
                          <div className="font-semibold">{prop.bathrooms || '—'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-700">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Square className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Área</div>
                          <div className="font-semibold">{prop.area ? `${prop.area}m²` : '—'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-700">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Home className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Tipo</div>
                          <div className="font-semibold text-xs">{prop.property_type || '—'}</div>
                        </div>
                  </div>
                </div>

                    {/* Botones de acción mejorados */}
                    <div className="space-y-3">
                <Button
                  variant="outline"
                        className="w-full border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
                  onClick={() => setOpenCalendar(openCalendar === prop.id ? null : prop.id)}
                >
                        {openCalendar === prop.id ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Ocultar disponibilidad
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver disponibilidad
                          </>
                        )}
                      </Button>

                      <Button
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        onClick={() => navigate('/dashboard/owner/exchange', { state: { property: prop, dateRange } })}
                        disabled={!dateRange?.from || !dateRange?.to}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Solicitar intercambio
                </Button>
                    </div>

                    {/* Calendario mejorado */}
                {openCalendar === prop.id && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                          <CalendarIcon className="h-4 w-4 text-indigo-600" />
                          <span className="text-sm font-medium text-gray-700">Disponibilidad próximos 2 meses</span>
                        </div>
                        
                        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
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
                            style={{ height: 320 }}
                      eventPropGetter={event => ({
                        style: {
                                backgroundColor: event.resource.isExchange ? '#6366f1' : '#f59e0b',
                                color: 'white',
                                borderRadius: '6px',
                          border: 'none',
                                fontSize: '12px',
                                fontWeight: '500'
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
                              previous: '‹',
                              next: '›',
                              noEventsInRange: 'Disponible todo el mes 🎉',
                        showMore: total => `+${total} más`,
                      }}
                      culture='es'
                    />
                        </div>
                        
                        {/* Leyenda del calendario */}
                        <div className="flex gap-4 mt-3 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-indigo-500 rounded"></div>
                            <span className="text-gray-600">Intercambios</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-amber-500 rounded"></div>
                            <span className="text-gray-600">Reservas</span>
                          </div>
                        </div>
                  </div>
                )}
              </CardContent>
            </Card>
              );
            })}
        </div>
      )}
      </div>
    </div>
  );
};

export default ExploreExchangeProperties; 