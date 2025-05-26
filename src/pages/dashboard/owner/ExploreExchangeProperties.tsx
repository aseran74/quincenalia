import * as React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
// import { Calendar, dateFnsLocalizer } from 'react-big-calendar'; // No longer needed
import 'react-big-calendar/lib/css/react-big-calendar.css'; // May still be needed if other components use it, but likely not for this page. Let's keep it for now and remove if build errors occur or if confirmed not needed.
import { format, parse, startOfWeek, getDay, addMonths } from 'date-fns'; // addDays might be removable if not used elsewhere
import { es } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card'; // CardFooter no longer used
import { Button } from '@/components/ui/button';
import PropertyFilters from '@/components/properties/PropertyFilters';
import { DateRange } from 'react-day-picker';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useNavigate } from 'react-router-dom';

// const locales = { 'es': es }; // No longer needed for react-big-calendar
// const localizer = dateFnsLocalizer({ // No longer needed for react-big-calendar
//   format,
//   parse,
//   startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
//   getDay,
//   locales,
// });

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
  // const [openCalendar, setOpenCalendar] = useState<string | null>(null); // No longer needed
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

  // const defaultDate = new Date(); // No longer needed for individual calendars
  // const maxDate = addMonths(defaultDate, 1); // No longer needed for individual calendars

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Explorar propiedades para intercambio</h1>

      {/* Calendar View for Date Range Selection */}
      <Card className="mb-6">
        <CardContent className="p-4 flex flex-col items-center">
          <DayPicker
            mode="range"
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            locale={es}
            className="rounded-md border"
          />
          {(dateRange?.from || dateRange?.to) && (
            <Button
              variant="ghost"
              className="mt-2 text-blue-600 hover:text-blue-800 justify-center"
              onClick={() => setDateRange(undefined)}
            >
              Limpiar fechas
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* Filtro Guest point */}
        <div className="flex flex-col">
          <label className="block font-medium mb-1 text-sm">Guest point / día</label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              value={minPoints}
              onChange={e => setMinPoints(e.target.value)}
              placeholder="Mín."
              className="w-24 border rounded px-2 py-1 h-9"
            />
            <span>-</span>
            <Input
              type="number"
              value={maxPoints}
              onChange={e => setMaxPoints(e.target.value)}
              placeholder="Máx."
              className="w-24 border rounded px-2 py-1 h-9"
            />
          </div>
        </div>
        {/* Filtro habitaciones */}
        <div className="flex flex-col">
          <label className="block font-medium mb-1 text-sm">Habitaciones mín.</label>
          <Input
            type="number"
            value={bedrooms}
            onChange={e => setBedrooms(e.target.value)}
            placeholder="Cualquiera"
            className="w-full border rounded px-2 py-1 h-9"
          />
        </div>
        {/* Filtro baños */}
        <div className="flex flex-col">
          <label className="block font-medium mb-1 text-sm">Baños mín.</label>
          <Input
            type="number"
            value={bathrooms}
            onChange={e => setBathrooms(e.target.value)}
            placeholder="Cualquiera"
            className="w-full border rounded px-2 py-1 h-9"
          />
        </div>
      </div>

      {/* Leyenda de fechas seleccionadas */}
      {dateRange?.from && (
        <div className="mb-4 text-center text-sm text-gray-700">
          {dateRange.to
            ? `Fechas seleccionadas: ${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
            : `Fecha seleccionada: ${format(dateRange.from, 'dd/MM/yyyy')}`}
        </div>
      )}

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
                {/* Removed "Ver disponibilidad" button and individual calendar display */}
                <Button
                  variant="default"
                  className="w-full mt-4" // Added margin top for spacing after removing calendar
                  onClick={() => navigate('/dashboard/owner/exchange', { state: { property: prop, dateRange } })}
                  disabled={!dateRange?.from || !dateRange?.to || !exchangeConfigs[prop.id]} // Deshabilitar si no hay config
                >
                  {exchangeConfigs[prop.id]
                    ? `Solicitar intercambio (${exchangeConfigs[prop.id].points_per_day} puntos/día)`
                    : 'Intercambio no disponible'}
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