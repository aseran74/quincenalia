import { useEffect, useState, useRef } from 'react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '@/lib/supabase';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card'; // Removido CardHeader si no se usa
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'; // Removido DialogHeader/Footer si no se usan
import { Input } from '@/components/ui/input';
import { Info, ChevronDown, Trash2, Plus, X, Home, Calendar as CalendarIcon } from 'lucide-react';
import ReservationCalendar from '../properties/ReservationCalendar'; // Asegúrate que la ruta sea correcta

// Configuración del Calendario (localizer solo es necesario si usas Rrule o algo avanzado aquí, ReservationCalendar ya lo tiene)
// const locales = { 'es': es };
// const localizer = dateFnsLocalizer({
//   format,
//   parse,
//   startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
//   getDay,
//   locales,
// });

// --- Interfaces ---
interface Property {
  id: string;
  title: string;
}

interface Reservation {
  id: string;
  property_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  status: 'pendiente' | 'aprobada' | 'rechazada' | 'fija' | 'cancelada';
  created_at: string;
  // Estructura esperada después del SELECT con joins
  properties?: { id: string; title: string; } | null;
  owner?: { id: string; first_name: string | null; last_name: string | null; } | null;
}

// --- Constantes y Helpers ---
const STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', borderColor: 'border-yellow-300' },
  { value: 'aprobada', label: 'Aprobada', color: 'bg-green-100 text-green-800', borderColor: 'border-green-300' },
  { value: 'rechazada', label: 'Rechazada', color: 'bg-red-100 text-red-800', borderColor: 'border-red-300' },
  { value: 'fija', label: 'Fija', color: 'bg-blue-100 text-blue-800', borderColor: 'border-blue-300' }, // Ajustado label
  { value: 'cancelada', label: 'Cancelada', color: 'bg-gray-100 text-gray-800', borderColor: 'border-gray-300' },
];

const getStatusStyle = (statusValue: string) => {
  return STATUS_OPTIONS.find(s => s.value === statusValue) || STATUS_OPTIONS.find(s => s.value === 'cancelada')!;
};

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  try {
    // Intenta interpretar como fecha (puede venir como YYYY-MM-DD)
    // new Date() puede tener problemas con solo YYYY-MM-DD dependiendo del navegador, añadir hora es más seguro
    const date = new Date(dateString + 'T00:00:00Z'); // Interpretar como UTC
    if (isNaN(date.getTime())) {
        console.warn(`[formatDate] Could not parse date: ${dateString}`);
        return dateString; // Devuelve el string original si no es fecha válida
    }
    // getUTCFullYear, etc. para evitar problemas de zona horaria
    return `${String(date.getUTCDate()).padStart(2, '0')}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${date.getUTCFullYear()}`;
  } catch (e) {
      console.error(`[formatDate] Error formatting date: ${dateString}`, e);
    return dateString || '-';
  }
};

// --- Componente Principal ---
function OwnerReservations() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filterProperty, setFilterProperty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
  const [creatingOrUpdating, setCreatingOrUpdating] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false); // Controla si se muestra el calendario
  const [selectedRange, setSelectedRange] = useState<{start: Date, end: Date} | null>(null);

  // Refs para el formulario
  const formPropertyRef = useRef<HTMLSelectElement>(null);
  const formStartDateRef = useRef<HTMLInputElement>(null);
  const formEndDateRef = useRef<HTMLInputElement>(null);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    console.log("[Effect] Checking user state:", { userExists: !!user, userId: user?.id, userRole: user?.role });
    if (user?.id && user?.role === 'owner') {
      console.log("[Effect] User is owner, calling fetchData.");
    fetchData();
    } else if (!user) {
      console.log("[Effect] User not yet loaded, setting loading true.");
      setLoading(true); // Espera a que el usuario cargue
    } else {
      // Usuario cargado pero no es owner o falta id
      console.log("[Effect] User loaded but not owner or missing ID, clearing data.");
      setLoading(false);
      setProperties([]);
      setReservations([]);
    }
  }, [user?.id, user?.role]); // Dependencias clave

  // --- Función para Cargar Datos ---
  const fetchData = async () => {
    // Doble check por si acaso
    if (!user?.id || user.role !== 'owner') {
      console.warn("[fetchData] Skipped: User is not owner or missing ID.");
      setLoading(false);
      return;
    }
    console.log(`[fetchData] --- Iniciando para Owner: ${user.id} ---`);
    setLoading(true);
    try {
      // 1. Propiedades del owner
      console.log("[fetchData] Paso 1: Buscando propiedades del owner...");
      let propertiesQuery = supabase
        .from('properties')
        .select('id, title')
        .or(`share1_owner_id.eq.${user.id},share2_owner_id.eq.${user.id},share3_owner_id.eq.${user.id},share4_owner_id.eq.${user.id}`);
      const { data: propertiesData, error: propertiesError } = await propertiesQuery.order('title');
      console.log("[fetchData] Resultado Properties Query:", { data: propertiesData, error: propertiesError });
      if (propertiesError) {
        console.error("[fetchData] Error al buscar propiedades:", propertiesError);
        throw new Error(`Error al buscar propiedades: ${propertiesError.message}`);
      }
      const myProperties = propertiesData || [];
      console.log("[fetchData] Propiedades encontradas:", myProperties.length);
      setProperties(myProperties);

      // 2. Lógica de filtro y calendario
      if (myProperties.length > 0 && filterProperty === 'all') {
        console.log("[fetchData] Estableciendo filtro inicial a la primera propiedad:", myProperties[0].id);
        setFilterProperty(myProperties[0].id);
        setShowCalendar(true);
      } else if (myProperties.length === 0) {
        console.log("[fetchData] No se encontraron propiedades.");
        setFilterProperty('all');
        setShowCalendar(false);
      } else {
        const currentFilterExists = myProperties.some(p => p.id === filterProperty);
        if (!currentFilterExists && filterProperty !== 'all') {
          const newFilter = myProperties[0]?.id || 'all';
          console.log(`[fetchData] Filtro actual (${filterProperty}) inválido. Cambiando a: ${newFilter}`);
          setFilterProperty(newFilter);
          setShowCalendar(newFilter !== 'all');
        } else {
            // Si el filtro actual existe, mantenemos el estado de showCalendar
            setShowCalendar(filterProperty !== 'all');
             console.log(`[fetchData] Filtro actual (${filterProperty}) válido. showCalendar: ${filterProperty !== 'all'}`);
        }
      }

      // 3. Reservas del owner
      console.log("[fetchData] Paso 3: Buscando reservas del owner...");
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('property_reservations')
        .select(`
          id, property_id, owner_id, start_date, end_date, status, created_at,
          properties ( id, title ),
          owner:profiles!property_reservations_owner_id_fkey ( id, first_name, last_name )
        `)
        .eq('owner_id', user.id)
        .order('start_date', { ascending: false });
      console.log("[fetchData] Resultado Reservations Query:", { data: reservationsData, error: reservationsError });
      if (reservationsError) {
        console.error("[fetchData] Error al buscar reservas:", reservationsError);
        toast({ title: 'Advertencia', description: `No se pudieron cargar las reservas: ${reservationsError.message}`, variant: 'default' });
        setReservations([]);
      } else {
        // Transformación segura de datos anidados
        const transformedReservations = (reservationsData || []).map((r: any) => ({
          ...r,
          properties: r.properties && typeof r.properties === 'object' && !Array.isArray(r.properties) ? r.properties : null,
          owner: r.owner && typeof r.owner === 'object' && !Array.isArray(r.owner) ? r.owner : null,
        }));
         console.log("[fetchData] Reservas encontradas y transformadas:", transformedReservations.length);
        setReservations(transformedReservations);
      }

    } catch (error: any) {
      console.error('[fetchData] Error general:', error);
      toast({ title: 'Error Crítico', description: `No se pudieron cargar los datos: ${error.message}`, variant: 'destructive' });
      setProperties([]);
      setReservations([]);
      setFilterProperty('all');
      setShowCalendar(false);
    } finally {
      console.log("[fetchData] --- Finalizando ---");
      setLoading(false);
    }
  };

  // --- Función para Eliminar Reserva ---
  const handleDelete = async () => {
    if (!reservationToDelete) {
        console.warn("[Delete] No reservation selected to delete.");
        return;
    };
    console.log(`[Delete] Iniciando eliminación de reserva ID: ${reservationToDelete.id}`);
    setCreatingOrUpdating(true);
    console.log("[Delete] Estado: creatingOrUpdating = true");
    try {
      console.log("[Delete] Ejecutando Supabase delete...");
    const { error } = await supabase.from('property_reservations').delete().eq('id', reservationToDelete.id);
      if (error) {
           console.error("[Delete] Error en Supabase delete:", error);
           throw error;
      }
      console.log("[Delete] Eliminación exitosa.");
      toast({ title: 'Eliminada', description: 'Reserva eliminada correctamente', variant: 'success' });
      setReservationToDelete(null); // Cierra modal ANTES de recargar
      console.log("[Delete] Modal cerrado. Llamando a fetchData...");
      await fetchData();
       console.log("[Delete] fetchData completado después de eliminar.");
    } catch (e: any) {
      console.error('[Delete] Capturado error:', e);
      toast({ title: 'Error', description: `No se pudo eliminar la reserva: ${e.message}`, variant: 'destructive' });
      // No restablecer creatingOrUpdating aquí, finally lo hará
    } finally {
      console.log("[Delete] Ejecutando bloque finally...");
      setCreatingOrUpdating(false);
      console.log("[Delete] Estado: creatingOrUpdating = false (desde finally)");
    }
  };

  // --- Función para Crear Reserva ---
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
        console.warn("[CreateSubmit] Aborted: No user ID.");
        return;
    }

    console.log("[CreateSubmit] Iniciando...");
    setCreatingOrUpdating(true);
    console.log("[CreateSubmit] Estado: creatingOrUpdating = true");

    const property_id = formPropertyRef.current?.value;
    const start_date = formStartDateRef.current?.value;
    const end_date = formEndDateRef.current?.value;

    // --- Validaciones ---
    if (!property_id || !start_date || !end_date) {
      toast({ title: 'Campos incompletos', variant: 'destructive' });
      console.log("[CreateSubmit] Error: Campos incompletos.");
      setCreatingOrUpdating(false);
      console.log("[CreateSubmit] Estado: creatingOrUpdating = false (por validación)");
      return;
    }
    if (new Date(end_date) < new Date(start_date)) {
      toast({ title: 'Error de fechas', description: 'La fecha de fin no puede ser anterior a la de inicio.', variant: 'destructive' });
       console.log("[CreateSubmit] Error: Fechas inválidas.");
       setCreatingOrUpdating(false);
       console.log("[CreateSubmit] Estado: creatingOrUpdating = false (por validación)");
      return;
    }
    const selectedProp = properties.find(p => p.id === property_id);
    if (!selectedProp) {
      toast({ title: 'Error', description: 'Propiedad no válida o no te pertenece.', variant: 'destructive' });
      console.log("[CreateSubmit] Error: Propiedad inválida o no pertenece al owner.");
      setCreatingOrUpdating(false);
      console.log("[CreateSubmit] Estado: creatingOrUpdating = false (por validación)");
      return;
    }
    // --- Fin Validaciones ---

    try {
      console.log(`[CreateSubmit] Intentando insertar reserva:`, { property_id, owner_id: user.id, start_date, end_date });
      const { data, error } = await supabase
        .from('property_reservations')
        .insert({ property_id, owner_id: user.id, start_date, end_date, status: 'pendiente' }) // Estado por defecto 'pendiente'
        .select() // Selecciona para confirmar
        .single(); // Espera un solo resultado

      if (error) {
        console.error("[CreateSubmit] Error en Supabase insert:", error);
        throw error; // Lanza para que lo capture el catch
      }

      // --- Éxito ---
      console.log("[CreateSubmit] Inserción exitosa:", data);
      toast({ title: 'Reserva solicitada', description: 'Tu solicitud de reserva se ha enviado.' });
      setShowCreateModal(false); // Cierra modal ANTES de recargar
      console.log("[CreateSubmit] Modal cerrado.");

      console.log("[CreateSubmit] Llamando a fetchData...");
      await fetchData();
      console.log("[CreateSubmit] fetchData completado.");

    } catch (error: any) {
      // --- Error ---
      console.error("[CreateSubmit] Capturado error:", error);
      // Revisa si es un error de constraint (el mensaje puede variar)
      if (error.message.toLowerCase().includes('constraint') || error.message.toLowerCase().includes('duplicate key')) {
        toast({ title: 'Conflicto de fechas', description: 'Ya existe una reserva en esas fechas para esta propiedad.', variant: 'destructive' });
      } else {
      toast({ title: 'Error al crear', description: `No se pudo crear la reserva: ${error.message}`, variant: 'destructive' });
      }
      // No restablecer creatingOrUpdating aquí, finally lo hará

    } finally {
      // --- Limpieza ---
      console.log("[CreateSubmit] Ejecutando bloque finally...");
      setCreatingOrUpdating(false);
      console.log("[CreateSubmit] Estado: creatingOrUpdating = false (desde finally)");
    }
  };

  // Filtrado local (se aplica a las reservas ya cargadas)
  const filteredReservations = reservations.filter(r =>
    (filterProperty === 'all' || r.property_id === filterProperty) &&
    (filterStatus === 'all' || r.status === filterStatus)
  );

  // Cálculo de resumen
  const resumen = [
    { label: 'Total', count: reservations.length, color: 'bg-blue-50 text-blue-800', borderColor: 'border-blue-200' },
    ...STATUS_OPTIONS.map(opt => ({
      label: opt.label,
      count: reservations.filter(r => r.status === opt.value).length,
      color: opt.color,
      borderColor: opt.borderColor
    }))
  ];

  // --- NUEVO: Handler para selección de slot en el calendario ---
  const handleSelectSlot = (slotInfo: { start: Date, end: Date }) => {
    setSelectedRange({ start: slotInfo.start, end: slotInfo.end });
  };

  // --- NUEVO: Confirmar reserva desde el modal ---
  const handleConfirmCalendarReservation = async () => {
    if (!selectedRange) return;
    await handleCreateFromCalendar(selectedRange.start, selectedRange.end);
    setSelectedRange(null);
  };

  // --- NUEVO: Crear reserva desde el calendario usando la lógica habitual ---
  const handleCreateFromCalendar = async (start: Date, end: Date) => {
    if (!user?.id || !filterProperty || filterProperty === 'all') return;
    // Validación: solo puede reservar si es owner de la propiedad
    const selectedProp = properties.find(p => p.id === filterProperty);
    if (!selectedProp) return;
    if (![selectedProp.id].includes(filterProperty)) return;
    // Reutilizar la lógica de handleCreateSubmit pero con fechas y propiedad del calendario
    setCreatingOrUpdating(true);
    try {
      const { data, error } = await supabase
        .from('property_reservations')
        .insert({ property_id: filterProperty, owner_id: user.id, start_date: format(start, 'yyyy-MM-dd'), end_date: format(end, 'yyyy-MM-dd'), status: 'pendiente' })
        .select()
        .single();
      if (error) throw error;
      toast({ title: 'Reserva solicitada', description: 'Tu solicitud de reserva se ha enviado.' });
      await fetchData();
    } catch (error: any) {
      toast({ title: 'Error al crear', description: `No se pudo crear la reserva: ${error.message}`, variant: 'destructive' });
    } finally {
      setCreatingOrUpdating(false);
    }
  };

  // --- Renderizado Condicional Inicial ---
  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando tus datos...</div>;
  }
  if (!loading && properties.length === 0 && user?.role === 'owner') {
    return (
      <div className="p-8 text-center bg-yellow-50 border border-yellow-200 rounded-lg">
        <Info className="mx-auto h-10 w-10 text-yellow-500 mb-3" />
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">Sin propiedades asignadas</h2>
        <p className="text-sm text-yellow-700">
          Parece que no tienes ninguna propiedad asignada como propietario en este momento.<br />
          Si crees que esto es un error, por favor, contacta con el administrador.
        </p>
      </div>
    );
  }
  if (!loading && user?.role !== 'owner') {
    // Asegúrate de que este caso se maneje (quizás redirigir o mostrar mensaje claro)
    return <div className="p-8 text-center text-red-600">Acceso denegado. Esta sección es solo para propietarios.</div>;
  }

  // --- Renderizado Principal ---
  return (
    <div className="p-2 md:p-6 max-w-7xl mx-auto font-sans">
      <h1 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">Mis Reservas</h1>

      {/* Filtros responsivos */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          {/* Filtro Propiedad */}
          <div>
            <label htmlFor="filterProperty" className="block text-sm font-medium text-gray-700 mb-1">
              <Home className="inline-block mr-1 h-4 w-4 text-gray-500" /> Propiedad
            </label>
            <div className="relative">
              <select
                id="filterProperty"
                className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filterProperty}
                onChange={e => {
                    const newFilter = e.target.value;
                    setFilterProperty(newFilter);
                    setShowCalendar(newFilter !== 'all'); // Muestra/oculta calendario al cambiar filtro
                }}
                disabled={loading || properties.length === 0} // Deshabilitar si no hay props
              >
                <option value="all">Todas mis propiedades ({properties.length})</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          {/* Filtro Estado */}
          <div>
            <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <div className="relative">
              <select
                id="filterStatus"
                className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                disabled={loading}
              >
                <option value="all">Todos los estados</option>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de reservas */}

        
      {/* Cards en móvil */}
      <div className="space-y-4 md:hidden">
        {filteredReservations.length === 0 ? (
          null
        ) : (
          filteredReservations.map(r => {
            const statusStyle = getStatusStyle(r.status);
            const property = r.properties; // Ya debería ser objeto o null
            return (
              <div key={r.id} className={`border rounded-lg p-4 shadow-sm relative ${statusStyle.borderColor} bg-white`}>
                <div className="flex justify-between items-start mb-3">
                  <span className="font-semibold text-gray-800 truncate pr-2" title={property?.title}>{property?.title || 'Propiedad N/A'}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.color} whitespace-nowrap`}>
                    {statusStyle.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  <CalendarIcon className="inline-block mr-1.5 h-4 w-4 text-gray-400" />
                  {formatDate(r.start_date)} - {formatDate(r.end_date)}
                </p>
                <div className="flex items-center justify-end border-t border-gray-200 pt-3 mt-3 gap-3">
                  {r.status === 'pendiente' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 px-2"
                      onClick={() => setReservationToDelete(r)}
                    disabled={creatingOrUpdating}
                    aria-label="Eliminar reserva"
                  >
                    <Trash2 size={16} />
                  </Button>
                  )}
                      </div>
                    </div>
            );
          })
        )}
      </div>

      {/* Tabla en escritorio */}
      {/* Eliminada para que solo se vean cards en móvil */}

      {/* Botón Flotante para Crear (solo si hay propiedades) */}
      {properties.length > 0 && (
        <Button
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-6 right-6 z-40 md:hidden rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white p-4 animate-fade-in-scale" // Re-añadida animación
          // No se muestra si el modal ya está abierto O si se está creando/actualizando algo
          style={{ display: showCreateModal || creatingOrUpdating ? 'none' : 'flex' }}
          aria-label="Nueva Reserva"
          disabled={creatingOrUpdating} // Doble seguridad
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

       {/* Botón Crear en escritorio (si se prefiere fijo en vez de flotante) */}
       <div className="hidden md:flex justify-end mt-6">
            <Button
                onClick={() => setShowCreateModal(true)}
                disabled={creatingOrUpdating || properties.length === 0}
            >
                <Plus className="mr-2 h-4 w-4" /> Nueva Reserva
            </Button>
       </div>


      {/* --- Modales --- */}

      {/* Modal de confirmación para eliminar */}
      {reservationToDelete && (
        // Usando el componente Dialog de shadcn/ui
        <Dialog open={!!reservationToDelete} onOpenChange={(open) => !open && !creatingOrUpdating && setReservationToDelete(null)}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Confirmar Eliminación</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-gray-600">
                      ¿Estás seguro de que quieres eliminar la reserva de
                      <span className="font-medium"> {reservationToDelete.properties?.title || 'esta propiedad'} </span>
                      ({formatDate(reservationToDelete.start_date)} - {formatDate(reservationToDelete.end_date)})?
                      <br />Esta acción no se puede deshacer.
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setReservationToDelete(null)} disabled={creatingOrUpdating}>Cancelar</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={creatingOrUpdating}>
                        {creatingOrUpdating ? 'Eliminando...' : 'Eliminar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}

      {/* Modal para crear nueva reserva */}
      {showCreateModal && (
         <Dialog open={showCreateModal} onOpenChange={(open) => !open && !creatingOrUpdating && setShowCreateModal(false)}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto"> {/* Ajustado tamaño y scroll */}
                 <DialogHeader>
                     <DialogTitle>Nueva Reserva</DialogTitle>
                      {/* Botón X ya incluido por DialogContent, no es necesario añadirlo manualmente */}
                 </DialogHeader>
                <form onSubmit={handleCreateSubmit} className="space-y-4 pt-4 pb-6 px-2"> {/* Añadido padding */}
              {/* Selector Propiedad */}
              <div>
                <label htmlFor="createProperty" className="block text-sm font-medium text-gray-700 mb-1">Propiedad *</label>
                <div className="relative">
                  <select
                    id="createProperty"
                    ref={formPropertyRef}
                    name="property_id"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    required
                        disabled={creatingOrUpdating || properties.length === 0} // Deshabilitar si no hay props
                        defaultValue="" // Importante para el placeholder
                  >
                    <option value="" disabled>Selecciona...</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              {/* Fechas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="createStartDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio *</label>
                  <Input
                    id="createStartDate"
                    ref={formStartDateRef}
                    name="start_date"
                    type="date"
                    className="w-full text-sm disabled:bg-gray-100"
                    required
                    disabled={creatingOrUpdating}
                  />
                </div>
                <div>
                  <label htmlFor="createEndDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha fin *</label>
                  <Input
                    id="createEndDate"
                    ref={formEndDateRef}
                    name="end_date"
                    type="date"
                    className="w-full text-sm disabled:bg-gray-100"
                    required
                    disabled={creatingOrUpdating}
                  />
                </div>
              </div>
                  {/* Botones en Footer */}
                   <DialogFooter className="pt-5"> {/* Separación */}
                       <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)} disabled={creatingOrUpdating}>Cancelar</Button>
                       <Button type="submit" disabled={creatingOrUpdating}>
                           {creatingOrUpdating ? 'Creando...' : 'Solicitar Reserva'}
                       </Button>
                   </DialogFooter>
            </form>
            </DialogContent>
         </Dialog>
      )}

      {/* Calendario de Disponibilidad (Renderizado Condicional) */}
      {filterProperty !== 'all' && showCalendar && !loading && (
        <div className="mt-8 pt-6 border-t">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Calendario de Disponibilidad: <span className='font-bold'>{properties.find(p => p.id === filterProperty)?.title}</span>
          </h2>
          {/* Calendario ocupa todo el ancho */}
          <div className="w-full">
            <div className="relative h-[700px] mt-6 lg:mt-0">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                  <div className="bg-white p-3 rounded-lg shadow-sm">Cargando reservas...</div>
                </div>
              )}
              <ReservationCalendar
                propertyId={filterProperty !== 'all' ? filterProperty : undefined}
                onSelectSlot={handleSelectSlot}
              />
            </div>
          </div>
          {/* Modal de confirmación de reserva desde el calendario */}
          {selectedRange && (
            <Dialog open={!!selectedRange} onOpenChange={open => !open && setSelectedRange(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar reserva</DialogTitle>
                </DialogHeader>
                <div className="mb-4">
                  <p>¿Deseas reservar la propiedad <b>{properties.find(p => p.id === filterProperty)?.title}</b> del <b>{format(selectedRange.start, 'dd/MM/yyyy')}</b> al <b>{format(selectedRange.end, 'dd/MM/yyyy')}</b>?</p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedRange(null)}>Cancelar</Button>
                  <Button onClick={handleConfirmCalendarReservation} disabled={creatingOrUpdating}>Confirmar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
      </div>
      )}
    </div>
  );
}

export default OwnerReservations; 