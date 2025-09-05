import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
// import ReservationCalendar from '@/pages/dashboard/properties/ReservationCalendar'; // No se usa, se puede quitar
import { Card } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge'; // No se usa, se puede quitar
// import { MapPin, Bed, Bath, Square, Home } from 'lucide-react'; // No se usan aquí directamente
import PropertyFilters from '@/components/properties/PropertyFilters'; // Mantenemos la importación
// Asegúrate de que PropertyFilters usa shadcn components como Select, Input, Checkbox para un estilo consistente
import { PropertyCard } from '@/components/properties/PropertyCard';
// import { useRef } from 'react'; // No se usa, se puede quitar
import { Calendar } from '@/components/ui/calendar';
import { es } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

// Importar componentes de shadcn/ui para el filtro
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react'; // Icono para el botón de fecha
import { cn } from '@/lib/utils'; // Utilidad para combinar clases de tailwind
import { Label } from '@/components/ui/label'; // Para añadir etiquetas a los inputs/selects

// Status colors kept for PropertyCard if it uses them
const STATUS_COLORS: Record<string, string> = {
  vendido: 'bg-red-100 text-red-800',
  disponible: 'bg-green-100 text-green-800',
  reservado: 'bg-yellow-100 text-yellow-800',
};

const OwnerSoldProperties: React.FC = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Eliminamos states que solo se usaban después de la búsqueda si 'pending' cubre todo
  // const [filters, setFilters] = useState<any>(null);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  // const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [reservations, setReservations] = useState<any[]>([]);

  // Mantenemos los estados pending para el patrón "aplicar al click"
  const [pendingFilters, setPendingFilters] = useState<any>(null); // Estado para los filtros de PropertyFilters
  const [pendingDateRange, setPendingDateRange] = useState<DateRange | undefined>(undefined);

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

      let mergedProperties: any[] = [];

      if (!propError && allProperties) {
           // Filter properties sold by shares (all 4 shares 'vendido')
           const fullySoldByShares = allProperties.filter((p: any) =>
              p.sale_type !== 'full_sale' && // Assume share sale is not 'full_sale' type
              ['vendido', 'vendida'].includes((p.share1_status || '').toLowerCase()) &&
              ['vendido', 'vendida'].includes((p.share2_status || '').toLowerCase()) &&
              ['vendido', 'vendida'].includes((p.share3_status || '').toLowerCase()) &&
              ['vendido', 'vendida'].includes((p.share4_status || '').toLowerCase())
           );

           // Filter properties sold by full sale type
           const fullySoldBySaleType = allProperties.filter((p: any) => p.sale_type === 'full_sale');

           // Get IDs of properties with commission
           const commissionPropertyIds = new Set(commissions?.map((c: any) => c.property_id) || []);

           // Filter properties with commission (this might overlap with the above)
           const withCommission = allProperties.filter((p: any) => commissionPropertyIds.has(p.id));

           // Combine and unique properties
           mergedProperties = [...fullySoldByShares, ...fullySoldBySaleType, ...withCommission]
               .filter((prop, index, self) =>
                   index === self.findIndex((t) => (t.id === prop.id)) // Simple check for unique ID
               );

           setProperties(mergedProperties);
           // Mostrar todas las propiedades cargadas inicialmente
           setFilteredProperties(mergedProperties); // Apply initial filter (no filters yet)

       } else {
           console.error('Error fetching properties or commissions:', propError, commError);
           setProperties([]);
           setFilteredProperties([]);
       }
      setLoading(false);
    };
    fetchProperties();
  }, []); // Se ejecuta solo al montar el componente

  // Obtener reservas si hay un rango de fechas pendiente
  useEffect(() => {
    const fetchReservations = async () => {
      // No fetch reservations if no date range is selected
      if (!pendingDateRange || !pendingDateRange.from || !pendingDateRange.to) {
        setReservations([]); // Clear previous reservations
        return;
      }

      const { data: propRes, error: err1 } = await supabase
        .from('property_reservations')
        .select('property_id, start_date, end_date');
      const { data: exchRes, error: err2 } = await supabase
        .from('exchange_reservations')
        .select('property_id, start_date, end_date');

      if (!err1 && !err2) {
          setReservations([...(propRes || []), ...(exchRes || [])]);
      } else {
          console.error('Error fetching reservations:', err1, err2);
          setReservations([]);
      }
    };
    // Refetch reservations only when the pending date range actually changes
  }, [pendingDateRange?.from?.toISOString(), pendingDateRange?.to?.toISOString()]);

  const handleSearch = () => {
    let result = properties; // Siempre empezamos con la lista completa de propiedades "vendidas/intercambio"
    const f = pendingFilters; // Usamos los filtros del estado pending
    const dr = pendingDateRange; // Usamos el rango de fechas del estado pending

    // Aplicar filtros básicos desde pendingFilters (los que maneja PropertyFilters)
    if (f) {
      // Asumo que PropertyFilters estructura su salida así:
      if (f.bedrooms && f.bedrooms !== '') {
        result = result.filter((p) => (p.bedrooms ?? 0) >= parseInt(f.bedrooms, 10)); // Usar parseInt con radix
      }
      if (f.minSize && Number(f.minSize) > 0) {
        result = result.filter((p) => (p.area ?? 0) >= Number(f.minSize));
      }
       if (f.bathrooms && f.bathrooms !== '') { // Asumiendo que PropertyFilters también maneja baños
         result = result.filter((p) => (p.bathrooms ?? 0) >= parseInt(f.bathrooms, 10));
       }
      // Asegurarse de que features sea un objeto antes de iterar
       if (f.features && typeof f.features === 'object') {
            Object.entries(f.features).forEach(([key, value]) => {
                if (value) { // Si el feature está seleccionado (value es true)
                    result = result.filter((p) =>
                        p.features && Array.isArray(p.features) && p.features.includes(key)
                    );
                }
            });
       }
       // Puedes añadir más filtros aquí si PropertyFilters los maneja (ej: ubicación, tipo, precios si aplicaran, etc.)
       // if (f.location && f.location !== '') { ... }
    }

    // Aplicar filtro por fechas: solo propiedades sin reservas solapadas en el rango pendingDateRange
    if (dr && dr.from && dr.to) {
        const start = dr.from;
        const end = dr.to;

        result = result.filter((property) => {
            const reservasProp = reservations.filter(r => r.property_id === property.id);

            // Si alguna reserva se solapa, la propiedad NO está disponible para el intercambio en ese rango
            const isReservedInDateRange = reservasProp.some(r => {
                const resStart = new Date(r.start_date);
                const resEnd = new Date(r.end_date);

                // Comprobar solapamiento: [resStart, resEnd] y [start, end] se solapan si resStart <= end Y resEnd >= start
                return resStart <= end && resEnd >= start;
            });
            return !isReservedInDateRange; // Incluir la propiedad solo si NO está reservada en el rango
        });
    }

    // Actualizar las propiedades filtradas con el resultado de la búsqueda
    setFilteredProperties(result);
  };

   // Handler para limpiar todos los filtros pendientes
   const handleClearFilters = () => {
       setPendingDateRange(undefined);
       setPendingFilters(null); // Resetear los filtros de PropertyFilters
       setReservations([]); // Limpiar las reservas (se refetchearán si se selecciona una fecha)
       setFilteredProperties(properties); // Mostrar todas las propiedades originales
   };


  if (loading) {
    return <div className="flex justify-center items-center h-96 text-gray-700">Cargando propiedades...</div>;
  }

  if (!user) {
    return <div className="p-8 text-center text-red-500">No autenticado. Por favor, inicia sesión.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 font-sans"> {/* Aumentamos el ancho máximo */}
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 text-center">Propiedades Vendidas / Intercambio</h1>

      {/* ------------- Área de Filtros Mejorada y Responsiva ------------- */}
      <Card className="p-4 md:p-6 mb-6 shadow-lg bg-white border border-gray-200"> {/* Estilo de Card más limpio */}
        {/* Contenedor principal de los controles de filtro.
            - flex-col md:flex-row: apilado en móvil, en fila en escritorio.
            - items-center: alinea verticalmente en la fila de escritorio.
            - gap-4 md:gap-6: espacio entre items. */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch md:items-center">

          {/* Selector de Rango de Fechas con Popover */}
          {/* Usamos flex-col para apilar el label y el botón, y controlamos su ancho.
             Damos un ancho fijo en desktop (`md:w-[280px]`) y `w-full` en mobile.*/}
          <div className="flex flex-col w-full md:w-[280px]">
             <Label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Rango de fechas</Label>
             <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal px-3 py-2 h-10", // Altura y padding estándar de input
                      !pendingDateRange && "text-muted-foreground",
                       "border-gray-300" // Añadir borde para parecer más un input
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
                      <span>Seleccionar fechas disponibles</span>
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
                   {/* Botón para limpiar fechas dentro del popover */}
                   {(pendingDateRange?.from || pendingDateRange?.to) && (
                       <div className="px-4 py-2">
                           <Button
                               variant="ghost"
                               className="w-full text-blue-600 hover:text-blue-800 justify-center"
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
          </div>

          {/* Filtros Adicionales (desde el componente PropertyFilters) */}
          {/* Le damos flex-grow para que ocupe el espacio disponible en escritorio,
             y full width en mobile. md:max-w-sm le da un ancho máximo en escritorio
             si no queremos que se estire demasiado. */}
          {/* NOTA: Si quieres que los inputs dentro de PropertyFilters se vean
             uno al lado del otro en escritorio, DEBES modificar PropertyFilters
             para que use flex o grid internamente. */}
          <div className="flex-grow w-full md:flex-grow-0 md:max-w-sm"> {/* Ajusta md:max-w-sm según necesites */}
             {/* PropertyFilters debería manejar sus propios labels y layout internos */}
             {/* Puedes añadir un título general si PropertyFilters no lo tiene: */}
             {/* <h3 className="text-lg font-semibold mb-2 text-gray-800">Detalles</h3> */}
             <PropertyFilters onFiltersChange={setPendingFilters} />
          </div>

          {/* Botón de Búsqueda y Limpiar Filtros */}
          {/* Agrupamos Buscar y Limpiar en un div para que queden juntos.
             Usamos flex-col para apilarlos en móvil, y flex-shrink-0
             para que no se encoja el contenedor de los botones en escritorio. */}
          <div className="flex flex-col gap-2 flex-shrink-0 w-full md:w-auto md:mt-6"> {/* md:mt-6 para alinear si los labels de PropertyFilters lo bajan */}
             <Button
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 h-10" // Altura estándar
                onClick={handleSearch}
                size="default" // Usar size="default" para la altura h-10
             >
                Buscar
             </Button>
             {/* Botón para limpiar todos los filtros (fechas y PropertyFilters) */}
             <Button
                 variant="outline"
                 className="w-full md:w-auto text-gray-700 hover:bg-gray-100 px-6 py-2 h-10 border-gray-300"
                 onClick={handleClearFilters}
             >
                 Limpiar filtros
             </Button>
          </div>

        </div> {/* Fin flex container */}
      </Card>
      {/* ------------- Fin Área de Filtros Mejorada ------------- */}

      {/* Contador de resultados - Fuera de la tarjeta de filtros */}
      {/* Alineado al centro y con margen superior */}
      <div className="text-center text-base font-semibold text-gray-700 mb-6 mt-4">
         {filteredProperties.length} propiedad{filteredProperties.length === 1 ? '' : 'es'} encontrada{filteredProperties.length === 1 ? '' : 's'}
      </div>


      {/* Lista de Propiedades */}
      {filteredProperties.length === 0 && !loading ? ( // Mostrar mensaje solo si no hay resultados y no está cargando
        <Card className="p-8 text-center text-gray-500 border border-gray-200">
          No se encontraron propiedades que coincidan con los filtros.
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Aumentamos el espacio entre tarjetas */}
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerSoldProperties;