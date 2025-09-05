import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import ReservationCalendar from '@/pages/dashboard/properties/ReservationCalendar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, Home } from 'lucide-react';
import PropertyFilters from '@/components/properties/PropertyFilters';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { useRef, useEffect, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { es } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  vendido: 'bg-red-100 text-red-800',
  disponible: 'bg-green-100 text-green-800',
  reservado: 'bg-yellow-100 text-yellow-800',
};

const OwnerSoldProperties: React.FC = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>(null);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [reservations, setReservations] = useState<any[]>([]);
  const [pendingFilters, setPendingFilters] = useState<any>(null);
  const [pendingDateRange, setPendingDateRange] = useState<DateRange | undefined>(undefined);
  const isFilteringByDate = !!(dateRange && dateRange.from && dateRange.to);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      // 1. Obtener todas las propiedades
      const { data: allProperties, error: propError } = await supabase
        .from('properties')
        .select('*');
      // 2. Obtener todas las comisiones
      const { data: commissions, error: commError } = await supabase
        .from('commissions')
        .select('property_id');
      if ((!propError && allProperties) && (!commError && commissions)) {
        // IDs de propiedades con comisión
        const commissionPropertyIds = new Set(commissions.map((c: any) => c.property_id));
        // Propiedades con los 4 shares vendidos
        const fullySold = allProperties.filter((p: any) =>
          ['vendido', 'vendida'].includes((p.share1_status || '').toLowerCase()) &&
          ['vendido', 'vendida'].includes((p.share2_status || '').toLowerCase()) &&
          ['vendido', 'vendida'].includes((p.share3_status || '').toLowerCase()) &&
          ['vendido', 'vendida'].includes((p.share4_status || '').toLowerCase())
        );
        // Propiedades con comisión
        const withCommission = allProperties.filter((p: any) => commissionPropertyIds.has(p.id));
        // Unir ambos arrays sin duplicados
        let merged = [...fullySold, ...withCommission.filter(p => !fullySold.some(fs => fs.id === p.id))];
        // Excluir propiedades donde el usuario NO es propietario de ningún share
        if (user && user.id) {
          merged = merged.filter((p: any) => {
            const owners = [
              p.share1_owner_id ?? '',
              p.share2_owner_id ?? '',
              p.share3_owner_id ?? '',
              p.share4_owner_id ?? ''
            ];
            return owners.includes(user.id);
          });
        }
        setProperties(merged);
        setFilteredProperties(merged);
      } else {
        setProperties([]);
        setFilteredProperties([]);
      }
      setLoading(false);
    };
    fetchProperties();
  }, []);

  // Obtener reservas solo si hay filtro de fechas
  useEffect(() => {
    const fetchReservations = async () => {
      if (!pendingDateRange || !pendingDateRange.from || !pendingDateRange.to) {
        setReservations([]);
        return;
      }
      // Traer reservas normales
      const { data: propRes, error: err1 } = await supabase
        .from('property_reservations')
        .select('property_id, start_date, end_date');
      // Traer reservas de intercambio
      const { data: exchRes, error: err2 } = await supabase
        .from('exchange_reservations')
        .select('property_id, start_date, end_date');
      if ((!err1 && propRes) || (!err2 && exchRes)) {
        setReservations([...(propRes || []), ...(exchRes || [])]);
      } else {
        setReservations([]);
      }
    };
    fetchReservations();
  }, [pendingDateRange]);

  const handleSearch = () => {
    let result = properties;
    const f = pendingFilters;
    // Si no hay ningún filtro aplicado y no hay rango de fechas, mostrar todas las propiedades
    const noFilters =
      (!f || (
        (!f.bedrooms || f.bedrooms === '') &&
        (!f.minSize || Number(f.minSize) === 0) &&
        (!f.features || Object.values(f.features).every(v => !v))
      )) &&
      (!pendingDateRange || !pendingDateRange.from || !pendingDateRange.to);
    if (noFilters) {
      setFilters(pendingFilters);
      setDateRange(pendingDateRange);
      setFilteredProperties(properties);
      return;
    }
    // Filtros básicos
    if (f) {
      if (f.bedrooms && f.bedrooms !== '') {
        result = result.filter((p) => (p.bedrooms ?? 0) >= parseInt(f.bedrooms));
      }
      if (f.minSize && Number(f.minSize) > 0) {
        result = result.filter((p) => (p.area ?? 0) >= Number(f.minSize));
      }
      if (f.features) {
        Object.entries(f.features).forEach(([key, value]) => {
          if (value) {
            result = result.filter((p) => p.features && p.features.includes(key));
          }
        });
      }
    }
    // Filtro por fechas: solo propiedades sin reservas solapadas
    if (pendingDateRange && pendingDateRange.from && pendingDateRange.to) {
      const start = pendingDateRange.from;
      const end = pendingDateRange.to;
      result = result.filter((property) => {
        const reservasProp = reservations.filter(r => r.property_id === property.id);
        // Si alguna reserva se solapa, la propiedad NO está disponible
        return !reservasProp.some(r => {
          const resStart = new Date(r.start_date);
          const resEnd = new Date(r.end_date);
          return resStart <= end && resEnd >= start;
        });
      });
    }
    setFilters(pendingFilters);
    setDateRange(pendingDateRange);
    setFilteredProperties(result);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Cargando propiedades...</div>;
  }

  if (!user) {
    return <div className="p-8 text-center text-red-500">No autenticado</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 font-sans">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 text-center">Propiedades Vendidas / Intercambio</h1>
      <div className="flex flex-col md:flex-row gap-12">
        {/* Filtros: 100% en móvil, 25% en desktop */}
        <div className="w-full md:w-1/4 max-w-md md:mx-0">
          <Card className="p-4 md:p-6 mb-8 shadow-lg sticky top-8">
            <div className="flex flex-col gap-6">
              {/* Selector de Rango de Fechas con Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !pendingDateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {pendingDateRange?.from ? (
                      pendingDateRange.to ? (
                        <>
                          {format(pendingDateRange.from, "LLL dd, y", { locale: es })} -{" "}
                          {format(pendingDateRange.to, "LLL dd, y", { locale: es })}
                        </>
                      ) : (
                        format(pendingDateRange.from, "LLL dd, y", { locale: es })
                      )
                    ) : (
                      <span>Seleccionar rango de fechas</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={pendingDateRange}
                    onSelect={setPendingDateRange}
                    locale={es}
                    numberOfMonths={2}
                  />
                  {(pendingDateRange?.from || pendingDateRange?.to) && (
                    <div className="px-4 py-2">
                      <Button
                        variant="ghost"
                        className="w-full text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          setPendingDateRange(undefined);
                        }}
                      >
                        Limpiar fechas
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              <PropertyFilters onFiltersChange={setPendingFilters} />
              <div className="flex flex-col items-center gap-2">
                <Button
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold"
                  onClick={handleSearch}
                  size="lg"
                >
                  Buscar
                </Button>
                <span className="text-sm text-blue-700 font-semibold mt-1">
                  {filteredProperties.length} resultado{filteredProperties.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </Card>
        </div>
        {/* Resultados: 100% en móvil, 75% en desktop */}
        <div className="w-full md:w-3/4 min-h-[400px]">
          {filteredProperties.length === 0 && !loading ? (
            <Card className="p-8 text-center text-gray-500 flex items-center justify-center h-full">
              No se encontraron propiedades que coincidan con los filtros.
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerSoldProperties; 