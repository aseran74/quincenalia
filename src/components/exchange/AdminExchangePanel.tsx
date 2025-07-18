import * as React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // Asegúrate que la ruta sea correcta
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ReservationCalendar from '@/pages/dashboard/properties/ReservationCalendar'; // Asegúrate que la ruta sea correcta
import { toast } from '@/components/ui/use-toast';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import ExchangeReservationCard from './ExchangeReservationCard'; // Asegúrate que la ruta sea correcta
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarDays, Users, Coins, Clock } from 'lucide-react'; // Added lucide-react imports
import { Badge } from '@/components/ui/badge'; // Added badge import

interface Property {
  id: string;
  title: string;
  share1_status: string;
  share2_status: string;
  share3_status: string;
  share4_status: string;
  share1_owner_id: string;
  share2_owner_id: string;
  share3_owner_id: string;
  share4_owner_id: string;
}

interface Owner {
  id: string;
  first_name: string;
  last_name: string;
}

const AdminExchangePanel: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [pointsWeekday, setPointsWeekday] = useState<number>(50);
  const [pointsWeekend, setPointsWeekend] = useState<number>(80);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [reservations, setReservations] = useState<any[]>([]);
  const [resMsg, setResMsg] = useState<string>('');
  
  const [owners, setOwners] = useState<Owner[]>([]);

  // --- NUEVOS ESTADOS PARA FILTROS ---
  const [propertyFilter, setPropertyFilter] = useState<string>('');
  const [ownerFilter, setOwnerFilter] = useState<string>('');
  
  // Para la sección de "Gestión de Puntos (Administrativo)"
  const [adminSelectedOwner, setAdminSelectedOwner] = useState<string>('');
  const [adminOwnerPoints, setAdminOwnerPoints] = useState<number>(0);
  const [adminPointsDelta, setAdminPointsDelta] = useState<number>(0);
  const [adminPointsMsg, setAdminPointsMsg] = useState<string>('');

  // Para la sección de "Asignar Reserva Manual (Administrativo)"
  const [manualOwnerId, setManualOwnerId] = useState<string>(''); // Owner para reserva manual
  const [manualPropertyId, setManualPropertyId] = useState<string>(''); // Propiedad para reserva manual
  const [manualStart, setManualStart] = useState('');
  const [manualEnd, setManualEnd] = useState('');
  const [manualMsg, setManualMsg] = useState<string>('');

  // Para el ReservationCalendar
  const [calendarOwnerId, setCalendarOwnerId] = useState<string>('');
  const [calendarOwnerPoints, setCalendarOwnerPoints] = useState<number>(0);

  // --- NUEVO: Filtrar propietarios que NO sean dueños de la propiedad seleccionada Y POR NOMBRE ---
  const selectedPropObj = properties.find(p => p.id === selectedProperty);
  const excludedOwnerIds = selectedPropObj ? [selectedPropObj.share1_owner_id, selectedPropObj.share2_owner_id, selectedPropObj.share3_owner_id, selectedPropObj.share4_owner_id].filter(Boolean) : [];
  const filteredOwners = owners
    .filter(o => !excludedOwnerIds.includes(o.id))
    .filter(o => // Filtrar por nombre y apellido
      ownerFilter === '' || 
      o.first_name.toLowerCase().includes(ownerFilter.toLowerCase()) ||
      o.last_name.toLowerCase().includes(ownerFilter.toLowerCase())
    );

  // --- NUEVO: Estado para fechas seleccionadas desde el calendario ---
  const [selectedRange, setSelectedRange] = useState<{start: Date, end: Date} | null>(null);
  
  // --- NUEVO: Estado para el modal de confirmación de reserva ---
  const [showReservationModal, setShowReservationModal] = useState<boolean>(false);

  // --- NUEVO: Filtrar propietarios para el calendario de intercambio (ya incluye filtro principal por dueño) ---
  // No necesitamos filtrar por nombre aquí, ya que filteredOwners ya lo hace.
  const filteredCalendarOwners = filteredOwners;

  // --- NUEVO: Calcular días ocupados (reservas normales + intercambio) para el calendario ---
  const [bookedDays, setBookedDays] = useState<Date[]>([]);
  useEffect(() => {
    async function fetchBookedDays() {
      if (!selectedProperty) {
        setBookedDays([]);
        return;
      }
      const [{ data: normal }, { data: exchange }] = await Promise.all([
        supabase.from('property_reservations').select('start_date, end_date').eq('property_id', selectedProperty),
        supabase.from('exchange_reservations').select('start_date, end_date').eq('property_id', selectedProperty)
      ]);
      const all = [...(normal || []), ...(exchange || [])];
      const days: Date[] = [];
      all.forEach(r => {
        let d = new Date(r.start_date);
        const end = new Date(r.end_date);
        while (d <= end) {
          days.push(new Date(d));
          d.setDate(d.getDate() + 1);
        }
      });
      setBookedDays(days);
    }
    fetchBookedDays();
  }, [selectedProperty, resMsg]);

  // --- EFECTOS ---

  useEffect(() => {
    const fetchPropertiesAndRelatedData = async () => {
      setLoading(true);
      // Cargar propiedades
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, title, share1_status, share2_status, share3_status, share4_status, share1_owner_id, share2_owner_id, share3_owner_id, share4_owner_id');

      if (propertiesError) {
        console.error("Error fetching properties:", propertiesError);
        toast({ title: "Error", description: "No se pudieron cargar las propiedades.", variant: "destructive" });
        setLoading(false);
        return;
      }
      
      // Filtrar: solo 100% vendidas y ahora también por nombre
      const filtered = (propertiesData || []).filter((p: any) =>
        (['vendido', 'vendida'].includes(p.share1_status?.toLowerCase()) &&
        ['vendido', 'vendida'].includes(p.share2_status?.toLowerCase()) &&
        ['vendido', 'vendida'].includes(p.share3_status?.toLowerCase()) &&
        ['vendido', 'vendida'].includes(p.share4_status?.toLowerCase())) &&
        // Nuevo filtro por nombre de propiedad
        (propertyFilter === '' || p.title.toLowerCase().includes(propertyFilter.toLowerCase()))
      );
      setProperties(filtered); // Guardamos las propiedades filtradas por 100% vendidas y nombre

      if (filtered.length > 0) {
        const firstPropertyId = filtered[0].id;
        setSelectedProperty(firstPropertyId);
        setManualPropertyId(firstPropertyId); // Default para reserva manual
      } else {
        // Si no hay propiedades que cumplan los filtros, limpiar la propiedad seleccionada
        setSelectedProperty('');
        setManualPropertyId('');
      }

      // Cargar owners
      const { data: ownersData, error: ownersError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'owner');

      if (ownersError) {
        console.error("Error fetching owners:", ownersError);
        toast({ title: "Error", description: "No se pudieron cargar los propietarios.", variant: "destructive" });
      } else if (ownersData && ownersData.length > 0) {
        setOwners(ownersData);
        // Configurar defaults solo si ownersData no está vacío
        setAdminSelectedOwner(ownersData[0].id); // Default para gestión de puntos admin
        setManualOwnerId(ownersData[0].id);     // Default para reserva manual
        setCalendarOwnerId(ownersData[0].id);   // Default para calendario
      } else {
         // Si no hay owners, limpiar los defaults de owner
         setAdminSelectedOwner('');
         setManualOwnerId('');
         setCalendarOwnerId('');
      }
      
      // La carga termina después de ambos fetches.
          setLoading(false);
    };
    
    // Este useEffect se ejecuta al montar y cuando cambian los filtros de texto
    fetchPropertiesAndRelatedData();

  }, [propertyFilter, ownerFilter]); // Dependencias de los filtros de texto

  // Cargar configuración de puntos de la propiedad seleccionada y reservas
  useEffect(() => {
    if (!selectedProperty) {
        setPointsWeekday(50);
        setPointsWeekend(80);
        setReservations([]);
        setLoading(false); // Si no hay propiedad, terminamos la carga aquí.
        return;
    }
    setLoading(true); 
    const fetchConfig = async () => {
      const { data: configData, error: configError } = await supabase
        .from('exchange_properties')
        .select('points_per_day_weekday, points_per_day')
        .eq('property_id', selectedProperty)
        .eq('active', true)
        .single();

      if (configError && configError.code !== 'PGRST116') {
        console.error("Error fetching exchange config:", configError);
        toast({ title: "Error", description: "No se pudo cargar la configuración de puntos.", variant: "destructive" });
      }
      
      if (configData) {
        setPointsWeekday(configData.points_per_day_weekday);
        setPointsWeekend(configData.points_per_day);
      } else {
        setPointsWeekday(50); 
        setPointsWeekend(80);
      }
    };

    const fetchReservations = async () => {
      const { data: resData, error: resError } = await supabase
        .from('exchange_reservations')
        .select('*, profiles(first_name, last_name)') 
        .eq('property_id', selectedProperty)
        .order('start_date', { ascending: true });

      if (resError) {
        console.error("Error fetching reservations:", resError);
        toast({ title: "Error", description: "No se pudieron cargar las reservas.", variant: "destructive" });
        setReservations([]);
      } else {
        setReservations(resData || []);
      }
    };

    Promise.all([fetchConfig(), fetchReservations()]).finally(() => {
        setLoading(false); 
    });

  }, [selectedProperty, resMsg]);

  // Cargar puntos del owner para GESTIÓN ADMIN
  useEffect(() => {
    if (!adminSelectedOwner) {
        setAdminOwnerPoints(0);
        return;
    }
    const fetchPoints = async () => {
      const { data, error } = await supabase
        .from('owner_points')
        .select('points')
        .eq('owner_id', adminSelectedOwner)
        .single();
      if (error && error.code !== 'PGRST116') console.error("Error fetching admin owner points", error);
      setAdminOwnerPoints(data?.points ?? 0);
    };
    fetchPoints();
  }, [adminSelectedOwner, adminPointsMsg]);

  // Cargar puntos del owner para CALENDARIO
  useEffect(() => {
    if (!calendarOwnerId) {
        setCalendarOwnerPoints(0);
        return;
    }
    const fetchPoints = async () => {
      const { data, error } = await supabase
        .from('owner_points')
        .select('points')
        .eq('owner_id', calendarOwnerId)
        .single();
      if (error && error.code !== 'PGRST116') console.error("Error fetching calendar owner points", error);
      setCalendarOwnerPoints(data?.points ?? 0);
    };
    fetchPoints();
  }, [calendarOwnerId, resMsg]);


  // --- HANDLERS ---

  const handleStatusChange = async (id: string, status: string) => {
    setLoading(true);
    // Si se aprueba, primero obtenemos la reserva para saber owner, puntos y propiedad
    let reservation = null;
    if (status === 'aprobada') {
      const { data, error } = await supabase
        .from('exchange_reservations')
        .select('owner_id, points_used, property_id')
        .eq('id', id)
        .single();
      if (!error && data) {
        reservation = data;
        // Restar puntos al owner y repartir a copropietarios
        await supabase.rpc('restar_y_repartir_puntos_owner', {
          ownerid: data.owner_id,
          puntos: data.points_used,
          propertyid: data.property_id
        });
      }
    }
    // Si se ANULA, devolver puntos al owner y deshacer reparto
    if (status === 'anulada') {
      const { data, error } = await supabase
        .from('exchange_reservations')
        .select('owner_id, points_used, property_id')
        .eq('id', id)
        .single();
      if (!error && data) {
        // Devolver puntos al owner y deshacer reparto
        await supabase.rpc('deshacer_reparto_puntos_owner', {
          ownerid: data.owner_id,
          puntos: data.points_used,
          propertyid: data.property_id
        });
      }
    }
    const { error } = await supabase
      .from('exchange_reservations')
      .update({ status })
      .eq('id', id);
    
    const message = `Reserva ${status === 'aprobada' ? 'aceptada' : 'anulada'}.`;
    if (!error) {
      toast({ title: "Éxito", description: message, variant: "success" });
      setResMsg(message + Date.now()); // Trigger refresh
    } else {
      toast({ title: "Error", description: "Error al actualizar la reserva.", variant: "destructive" });
      console.error("Error updating reservation status:", error);
    }
    setLoading(false);
  };

  const handleSaveConfig = async () => {
    if (!selectedProperty) {
        toast({ title: "Advertencia", description: "Seleccione una propiedad primero.", variant: "default" });
        return;
    }
    setLoading(true);
    const { data: existing, error: selectError } = await supabase
      .from('exchange_properties')
      .select('id')
      .eq('property_id', selectedProperty)
      .eq('active', true)
      .maybeSingle(); 

    if (selectError && selectError.code !== 'PGRST116') {
        toast({ title: "Error", description: "Error al verificar configuración existente.", variant: "destructive" });
        console.error("Error checking existing config:", selectError);
        setLoading(false);
        return;
    }

    let opError;
    if (existing) {
      const { error } = await supabase
        .from('exchange_properties')
        .update({ points_per_day_weekday: pointsWeekday, points_per_day: pointsWeekend })
        .eq('id', existing.id);
      opError = error;
    } else {
      const { error } = await supabase
        .from('exchange_properties')
        .insert({
          property_id: selectedProperty,
          start_date: new Date().toISOString().split('T')[0], 
          end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0], 
          points_per_day_weekday: pointsWeekday,
          points_per_day: pointsWeekend,
          active: true
        });
      opError = error;
    }

    if (!opError) {
      toast({ title: "Éxito", description: "Configuración de precios guardada.", variant: "success" });
      setSuccessMsg('Configuración guardada ' + Date.now());
    } else {
      toast({ title: "Error", description: "No se pudo guardar la configuración.", variant: "destructive" });
      console.error("Error saving config:", opError);
    }
    setLoading(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleUpdateAdminOwnerPoints = async () => {
    if (!adminSelectedOwner) {
        toast({ title: "Advertencia", description: "Seleccione un propietario.", variant: "default" });
        return;
    }
    if (adminPointsDelta === 0 && adminOwnerPoints === 0) { // Considera si el delta es 0 pero quieres setear a 0 explícitamente
        toast({ title: "Información", description: "El cambio de puntos es cero o ya está en cero.", variant: "default" });
        return;
    }

    setLoading(true);
    const newPoints = Math.max(0, adminOwnerPoints + adminPointsDelta); 

    const { data: existingPointRecord, error: selectError } = await supabase
        .from('owner_points')
        .select('owner_id')
        .eq('owner_id', adminSelectedOwner)
        .maybeSingle();

    if (selectError) {
        console.error("Error checking owner points for update:", selectError);
        toast({ title: "Error", description: "Error al verificar puntos del propietario.", variant: "destructive" });
        setLoading(false);
        return;
    }

    let pointsOpError;
    if (existingPointRecord) {
        const { error } = await supabase
            .from('owner_points')
            .update({ points: newPoints })
            .eq('owner_id', adminSelectedOwner);
        pointsOpError = error;
    } else {
        const { error } = await supabase
            .from('owner_points')
            .insert({ owner_id: adminSelectedOwner, points: newPoints });
        pointsOpError = error;
    }
    
    if (pointsOpError) {
        console.error("Error updating/inserting owner points:", pointsOpError);
        toast({ title: "Error", description: "No se pudieron actualizar los puntos.", variant: "destructive" });
    } else {
        setAdminPointsMsg('Puntos actualizados ' + Date.now());
        toast({ title: "Éxito", description: "Puntos actualizados.", variant: "success" });
        setAdminPointsDelta(0);
    }
    setLoading(false);
    setTimeout(() => setAdminPointsMsg(''), 3000);
  };
  
  const handleCalendarReservationUpdate = () => {
    setResMsg('Calendar reservation updated ' + Date.now()); 
  };


  const handleManualReservation = async () => {
    if (!manualOwnerId || !manualPropertyId || !manualStart || !manualEnd) {
      toast({ title: "Advertencia", description: "Todos los campos son requeridos para la reserva manual.", variant: "default" });
      return;
    }
    if (new Date(manualEnd) <= new Date(manualStart)) {
      toast({ title: "Advertencia", description: "La fecha de fin debe ser posterior a la fecha de inicio.", variant: "default" });
      return;
    }
    // Validación: no permitir reservas a copropietarios (refuerzo extra)
    if (excludedOwnerIds.includes(manualOwnerId)) {
      toast({ title: 'Error', description: 'No puedes crear reservas de intercambio para copropietarios.', variant: 'destructive' });
      return;
    }
    // Validación: puntos suficientes
    const { data: pointsData } = await supabase.from('owner_points').select('points').eq('owner_id', manualOwnerId).single();
    const currentPoints = pointsData?.points || 0;
    let total = 0;
    let d = new Date(manualStart);
    const endDate = new Date(manualEnd);
    while (d <= endDate) {
      if ([0, 6].includes(d.getDay())) {
        total += pointsWeekend;
      } else {
        total += pointsWeekday;
      }
      d.setDate(d.getDate() + 1);
    }
    if (currentPoints < total) {
      toast({ title: 'Error', description: `El propietario seleccionado no tiene puntos suficientes. Necesita ${total}, tiene ${currentPoints}.`, variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      // --- FETCH en tiempo real de todas las reservas (normales + intercambio) antes de validar conflicto ---
      const [{ data: reservationsData }, { data: exchangeData }] = await Promise.all([
        supabase.from('property_reservations').select('start_date, end_date').eq('property_id', manualPropertyId),
        supabase.from('exchange_reservations').select('start_date, end_date').eq('property_id', manualPropertyId)
      ]);
      const allReservations = [
        ...(reservationsData || []),
        ...(exchangeData || [])
      ];
      const start = new Date(manualStart);
      const end = new Date(manualEnd);
      // Validación de conflicto sobre el array fresco
      const conflictingReservations = allReservations.filter(res => {
        const resStart = new Date(res.start_date);
        const resEnd = new Date(res.end_date);
        return (
          (start >= resStart && start <= resEnd) ||
          (end >= resStart && end <= resEnd) ||
          (start <= resStart && end >= resEnd)
        );
      });
      if (conflictingReservations.length > 0) {
        toast({ title: 'Error', description: 'Ya existe una reserva (normal o intercambio) en ese rango de fechas', variant: 'destructive' });
        setLoading(false);
        return;
      }
      const { error } = await supabase.from('exchange_reservations').insert({
        property_id: manualPropertyId,
        owner_id: manualOwnerId,
        start_date: manualStart,
        end_date: manualEnd,
        status: 'aprobada',
        points: 0,
        points_used: 0
      });
      if (!error) {
        toast({ title: "Éxito", description: "Reserva manual creada.", variant: "success" });
        setManualMsg('Reserva creada ' + Date.now());
        setManualStart('');
        setManualEnd('');
        setResMsg('Manual reservation created ' + Date.now());
      } else {
        toast({ title: "Error", description: "No se pudo crear la reserva manual.", variant: "destructive" });
        console.error("Error creating manual reservation:", error);
      }
    } catch (error: any) {
      toast({ title: 'Error al crear', description: `No se pudo crear la reserva: ${error.message}`, variant: 'destructive' });
    }
    setLoading(false);
    setTimeout(() => setManualMsg(''), 3000);
  };

  const handleDeleteExchangeReservation = async (reservationId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('exchange_reservations')
      .delete()
      .eq('id', reservationId);

    if (!error) {
      toast({ title: 'Reserva Eliminada', description: 'La reserva de intercambio se ha eliminado.', variant: 'success' });
      setResMsg('Reservation deleted ' + Date.now()); 
    } else {
      toast({ title: 'Error', description: 'No se pudo eliminar la reserva.', variant: 'destructive' });
      console.error("Error deleting exchange reservation:", error);
    }
    setLoading(false);
  };

  // --- NUEVO: Handler para selección de slot en el calendario ---
  const handleSelectSlot = (slotInfo: { start: Date, end: Date }) => {
    setSelectedRange({ start: slotInfo.start, end: slotInfo.end });
  };

  // --- NUEVO: Confirmar reserva desde el modal ---
  const handleConfirmCalendarReservation = async () => {
    // Validación robusta del rango seleccionado
    if (!selectedRange || !selectedRange.start || !selectedRange.end) {
      toast({ title: 'Error', description: 'Selecciona un rango completo.', variant: 'destructive' });
      return;
    }
    const { start, end } = selectedRange;
    try {
      // Calcular puntos
      let total = 0;
      let d = new Date(start);
      const endDate = new Date(end);
      while (d <= endDate) {
        if ([0, 6].includes(d.getDay())) {
          total += pointsWeekend;
        } else {
          total += pointsWeekday;
        }
        d.setDate(d.getDate() + 1);
      }
      // Validación: puntos suficientes
      if (calendarOwnerPoints < total) {
        toast({ title: 'Error', description: `El propietario seleccionado no tiene puntos suficientes. Necesita ${total}, tiene ${calendarOwnerPoints}.`, variant: 'destructive' });
        return;
      }
      // Insertar reserva
      const { error } = await supabase.from('exchange_reservations').insert({
        property_id: selectedProperty,
        owner_id: calendarOwnerId,
        start_date: format(start, 'yyyy-MM-dd'),
        end_date: format(end, 'yyyy-MM-dd'),
        status: 'pendiente',
        points: total,
        points_used: total
      });
      if (error) throw error;
      // RESTAR PUNTOS AL OWNER
      const { data: pointsData, error: pointsError } = await supabase
        .from('owner_points')
        .select('points')
        .eq('owner_id', calendarOwnerId)
        .single();
      if (!pointsError && pointsData) {
        const currentPoints = pointsData.points || 0;
        const newPoints = Math.max(0, currentPoints - total);
        await supabase
          .from('owner_points')
          .update({ points: newPoints })
          .eq('owner_id', calendarOwnerId);
      }
      toast({ title: 'Reserva de intercambio creada', description: 'La reserva se ha creado correctamente.' });
      setResMsg('Reserva creada');
      setTimeout(() => setResMsg(''), 2000);
      // Recargar reservas
      if (typeof handleCalendarReservationUpdate === 'function') handleCalendarReservationUpdate();
    } catch (error: any) {
      toast({ title: 'Error al crear', description: `No se pudo crear la reserva: ${error.message}`, variant: 'destructive' });
    }
  };

  // Pantalla de carga inicial mientras se obtienen propiedades y dueños por primera vez
  if (loading && properties.length === 0 && owners.length === 0 && !selectedProperty) { 
    return <div className="flex justify-center items-center h-screen">Cargando panel de administrador...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Panel de Administración de Intercambios</h1>

      {/* --- SECCIÓN DE FILTROS --- */}
      <Card className="p-4">
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Propiedades y Propietarios</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="propertyFilter">Filtrar por Nombre de Propiedad</Label>
            <Input
              id="propertyFilter"
              type="text"
              placeholder="Ej: Villa Sol"
              value={propertyFilter}
              onChange={e => setPropertyFilter(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="ownerFilter">Filtrar por Nombre de Propietario</Label>
            <Input
              id="ownerFilter"
              type="text"
              placeholder="Ej: Juan Pérez"
              value={ownerFilter}
              onChange={e => setOwnerFilter(e.target.value)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mensajes de éxito o error */}
      {successMsg && <div className="mt-3 text-sm text-green-600 font-medium">{successMsg.split(' ')[0]} {successMsg.split(' ')[1]}</div>}
      {resMsg && <div className="mt-3 text-sm text-green-600 font-medium">{resMsg.split(' ')[0]} {resMsg.split(' ')[1]}</div>}

      {/* --- Mensaje informativo UX --- */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm flex items-center gap-2">
        <svg className="h-5 w-5 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
        Solo puedes seleccionar <b>usuarios que no son copropietarios</b> de la propiedad seleccionada. <b>Solo se permiten reservas de intercambio</b> desde este panel.
      </div>

        {/* Card: Configuración de Precios */}
        <Card className="w-full shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-700">Configuración de Precios de Intercambio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label htmlFor="property-select-config" className="block text-sm font-medium text-gray-700 mb-1">Propiedad:</label>
              <select
                id="property-select-config"
                className="block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                value={selectedProperty}
                onChange={e => setSelectedProperty(e.target.value)}
                disabled={properties.length === 0}
              >
                {properties.length === 0 && <option value="">No hay propiedades vendidas al 100%</option>}
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="points-weekday" className="block text-sm font-medium text-gray-700 mb-1">Puntos / día (entre semana):</label>
                    <input
                        id="points-weekday"
                        type="number"
                        className="block w-full max-w-[150px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                        value={pointsWeekday}
                        onChange={e => setPointsWeekday(Math.max(0, Number(e.target.value)))}
                        min={0}
                    />
                </div>
                <div>
                    <label htmlFor="points-weekend" className="block text-sm font-medium text-gray-700 mb-1">Puntos / día (fin de semana):</label>
                    <input
                        id="points-weekend"
                        type="number"
                        className="block w-full max-w-[150px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                        value={pointsWeekend}
                        onChange={e => setPointsWeekend(Math.max(0, Number(e.target.value)))}
                        min={0}
                    />
                </div>
            </div>
            <Button onClick={handleSaveConfig} disabled={loading || !selectedProperty}>
                {loading && successMsg.startsWith('Configur') ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </CardContent>
        </Card>
          
        {/* Card: Reservas de Intercambio */}
        <Card className="w-full shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700">Reservas de Intercambio</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Cards en móvil y tablet */}
              <div className="space-y-4 block lg:hidden">
                {loading && reservations.length === 0 && selectedProperty && <div className="text-center py-4 text-gray-500">Cargando reservas...</div>}
                {!loading && reservations.length === 0 && selectedProperty && <div className="text-gray-500 py-4 text-center">No hay reservas para esta propiedad.</div>}
                {!selectedProperty && <div className="text-gray-500 py-4 text-center">Seleccione una propiedad para ver sus reservas.</div>}
                {reservations.map(r => (
                  <ExchangeReservationCard
                    key={r.id}
                    startDate={r.start_date}
                    endDate={r.end_date}
                    points={r.points_used || r.points || 0}
                    status={r.status}
                    ownerName={r.profiles ? `${r.profiles.first_name} ${r.profiles.last_name}` : `ID: ${r.owner_id.substring(0,8)}`}
                    actions={
                      <div className="flex flex-col sm:flex-row gap-2 mt-3">
                        {r.status === 'pendiente' && (
                          <>
                            <Button size="sm" variant="default" className="w-full sm:w-auto" onClick={() => handleStatusChange(r.id, 'aprobada')} disabled={loading}>Aceptar</Button>
                            <Button size="sm" variant="destructive" className="w-full sm:w-auto" onClick={() => handleStatusChange(r.id, 'anulada')} disabled={loading}>Anular</Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" className="w-full sm:w-auto text-red-600 border-red-300 hover:bg-red-50" onClick={() => handleDeleteExchangeReservation(r.id)} title="Eliminar reserva" disabled={loading}>
                          Eliminar
                        </Button>
                      </div>
                    }
                  />
                ))}
              </div>
              
              {/* Tabla solo en escritorio grande */}
              <div className="hidden lg:block">
                {loading && reservations.length === 0 && selectedProperty && <div className="text-center py-6 text-gray-500">Cargando reservas...</div>}
                {!loading && reservations.length === 0 && selectedProperty && <div className="text-gray-500 py-6 text-center">No hay reservas para esta propiedad.</div>}
                {!selectedProperty && <div className="text-gray-500 py-6 text-center">Seleccione una propiedad para ver sus reservas.</div>}
                {reservations.length > 0 && (
                  <div className="overflow-x-auto border border-gray-200 rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propietario</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inicio</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntos</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reservations.map(r => (
                          <tr key={r.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-medium">
                              {r.profiles ? `${r.profiles.first_name} ${r.profiles.last_name}` : `ID: ${r.owner_id.substring(0,8)}`}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{new Date(r.start_date + 'T00:00:00Z').toLocaleDateString()}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{new Date(r.end_date + 'T00:00:00Z').toLocaleDateString()}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.status === 'aprobada' ? 'bg-blue-100 text-blue-800' : r.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : r.status === 'anulada' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{r.points_used || r.points || 0}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                              {r.status === 'pendiente' && (
                                <>
                                  <Button size="sm" variant="default" onClick={() => handleStatusChange(r.id, 'aprobada')} disabled={loading}>Aceptar</Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleStatusChange(r.id, 'anulada')} disabled={loading}>Anular</Button>
                                </>
                              )}
                              <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => handleDeleteExchangeReservation(r.id)} title="Eliminar reserva" disabled={loading}>
                                Eliminar
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
        </Card>

        {/* Card: Calendario */}
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
          {/* Calendario */}
          <div className="lg:col-span-3 xl:col-span-4">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b p-4 lg:p-6">
                <CardTitle className="flex items-center gap-2 text-gray-800 text-lg lg:text-xl">
                  <CalendarDays className="h-5 w-5" />
                  Calendario de Intercambio
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 lg:p-8">
                {/* DEBUG VISUAL: Estado de selección y propietario */}
                <div className="mb-4 p-2 bg-gray-100 rounded text-xs text-gray-700">
                  <div><b>selectedRange:</b> {selectedRange ? `${selectedRange.start?.toLocaleDateString()} - ${selectedRange.end?.toLocaleDateString()}` : 'Ninguno'}</div>
                  <div><b>calendarOwnerId:</b> {calendarOwnerId || 'Ninguno'}</div>
                  <div><b>calendarOwnerPoints:</b> {calendarOwnerPoints}</div>
                </div>
                <div className="flex justify-center">
                  {selectedProperty ? (
                    <ReservationCalendar
                      propertyId={selectedProperty}
                      exchangeMode={true}
                      pointsConfig={{
                        points_per_day: pointsWeekend,
                        points_per_day_weekday: pointsWeekday
                      }}
                      ownerIdForReservation={calendarOwnerId}
                      ownerPoints={calendarOwnerPoints}
                      selectedDates={selectedRange ? [selectedRange.start, selectedRange.end] : []}
                      onSelectedDatesChange={dates => {
                        if (dates.length === 2) setSelectedRange({ start: dates[0], end: dates[1] });
                        else setSelectedRange(null);
                      }}
                      onReservationCreated={handleCalendarReservationUpdate} 
                      onSelectSlot={handleSelectSlot}
                      disabledDays={bookedDays}
                    />
                  ) : (
                    <div className="text-gray-500 py-10 text-center text-sm">
                      Seleccione una propiedad para ver el calendario.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel lateral */}
          <div className="space-y-4 lg:space-y-6">
            {/* Selector de propietario */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b p-3 lg:p-4">
                <CardTitle className="flex items-center gap-2 text-gray-800 text-sm lg:text-base">
                  <Users className="h-4 w-4 lg:h-5 lg:w-5" />
                  Propietario
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 lg:p-4">
                <div className="space-y-3 lg:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Propietario para intercambio:</label>
                    <select
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                      value={calendarOwnerId}
                      onChange={e => setCalendarOwnerId(e.target.value)}
                      disabled={filteredCalendarOwners.length === 0}
                    >
                      {filteredCalendarOwners.length === 0 && <option value="">No hay propietarios disponibles</option>}
                      {filteredCalendarOwners.map(o => (
                        <option key={o.id} value={o.id}>{o.first_name} {o.last_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Coins className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Puntos disponibles:</span>
                    </div>
                    <Badge variant="outline">{calendarOwnerPoints}</Badge>
                  </div>
                  <div className="flex items-center justify-center">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      Intercambio
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botón de crear reserva */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-3 lg:p-4">
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
                  disabled={!selectedRange?.start || !selectedRange?.end || !calendarOwnerId}
                  size="default"
                  onClick={() => setShowReservationModal(true)}
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Crear Reserva
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
            {/* --- Formulario de reserva manual junto al calendario --- */}
            <div className="mb-4 p-4 bg-indigo-50 rounded-md border border-indigo-200">
              <h4 className="font-semibold mb-2 text-indigo-900">Reserva manual de intercambio</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Propietario:</label>
                  <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    value={manualOwnerId}
                    onChange={e => setManualOwnerId(e.target.value)}
                    disabled={filteredOwners.length === 0}
                  >
                    <option value="">Selecciona propietario</option>
                    {filteredOwners.map(o => (
                      <option key={o.id} value={o.id}>{o.first_name} {o.last_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio:</label>
                  <input
                    type="date"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    value={manualStart}
                    onChange={e => setManualStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin:</label>
                  <input
                    type="date"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    value={manualEnd}
                    onChange={e => setManualEnd(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={handleManualReservation} 
                disabled={loading || !manualOwnerId || !selectedProperty || !manualStart || !manualEnd}
              >
                {loading && manualMsg.startsWith('Reserva') ? 'Creando...' : 'Crear Reserva Manual'}
              </Button>
              {manualMsg && <div className="mt-3 text-sm text-green-600 font-medium">{manualMsg.split(' ')[0]} {manualMsg.split(' ')[1]}</div>}
            </div>
            {/* Modal de confirmación de reserva */}
            <Dialog open={showReservationModal} onOpenChange={setShowReservationModal}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      Confirmar Reserva de Intercambio
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mb-4">
                    {selectedRange && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <p className="text-sm font-medium text-blue-900">Fechas seleccionadas:</p>
                        </div>
                        <p className="text-sm text-blue-800">
                          {format(selectedRange.start, 'dd/MM/yyyy')} - {format(selectedRange.end, 'dd/MM/yyyy')}
                        </p>
                      </div>
                    )}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Propiedad:</span>
                        <span className="text-sm text-gray-900">{properties.find(p => p.id === selectedProperty)?.title}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Propietario:</span>
                        <span className="text-sm text-gray-900">{owners.find(o => o.id === calendarOwnerId)?.first_name} {owners.find(o => o.id === calendarOwnerId)?.last_name}</span>
                      </div>
                    </div>
                    {/* Cálculo de puntos necesarios para el rango seleccionado */}
                    {selectedRange && (() => {
                      let total = 0;
                      let d = new Date(selectedRange.start);
                      const endDate = new Date(selectedRange.end);
                      while (d <= endDate) {
                        if ([0, 6].includes(d.getDay())) {
                          total += pointsWeekend;
                        } else {
                          total += pointsWeekday;
                        }
                        d.setDate(d.getDate() + 1);
                      }
                      return (
                        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Coins className="h-4 w-4 text-yellow-600" />
                            <p className="text-sm font-medium text-yellow-900">Información de Puntos</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-yellow-800">Puntos necesarios:</span>
                              <span className="text-sm font-bold text-yellow-900">{total}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-yellow-800">Puntos disponibles:</span>
                              <span className="text-sm font-bold text-yellow-900">{calendarOwnerPoints}</span>
                            </div>
                          </div>
                          {calendarOwnerPoints < total && (
                            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                              El propietario seleccionado no tiene puntos suficientes para esta reserva.
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowReservationModal(false)}>Cancelar</Button>
                    {selectedRange && (() => {
                      let total = 0;
                      let d = new Date(selectedRange.start);
                      const endDate = new Date(selectedRange.end);
                      while (d <= endDate) {
                        if ([0, 6].includes(d.getDay())) {
                          total += pointsWeekend;
                        } else {
                          total += pointsWeekday;
                        }
                        d.setDate(d.getDate() + 1);
                      }
                      return (
                        <Button
                          onClick={() => {
                            handleConfirmCalendarReservation();
                            setShowReservationModal(false);
                          }}
                          disabled={calendarOwnerPoints < total}
                        >
                          Confirmar
                        </Button>
                      );
                    })()}
                  </DialogFooter>
                </DialogContent>
              </Dialog>

        {/* Sección: Gestión de Puntos y Asignación Manual (Acordeón) */}
        <Accordion type="multiple" className="w-full space-y-1" defaultValue={['puntos_admin']}>
          <AccordionItem value="puntos_admin" className="border border-gray-200 rounded-md shadow-sm bg-white">
            <AccordionTrigger className="px-4 py-3 text-md font-semibold text-gray-700 hover:bg-gray-50 rounded-t-md">
              Gestión de Puntos (Administrativo)
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2 border-t border-gray-200">
                <div className="mb-4">
                  <label htmlFor="admin-owner-select" className="block text-sm font-medium text-gray-700 mb-1">Propietario:</label>
                  <select
                    id="admin-owner-select"
                    className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    value={adminSelectedOwner}
                    onChange={e => setAdminSelectedOwner(e.target.value)}
                    disabled={owners.length === 0}
                  >
                    {owners.map(o => (
                      <option key={o.id} value={o.id}>{o.first_name} {o.last_name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3 text-sm text-gray-700">Puntos actuales (gestión): <b className="text-gray-900">{adminOwnerPoints}</b></div>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-3">
                  <div>
                    <label htmlFor="admin-points-delta" className="block text-sm font-medium text-gray-700 mb-1 whitespace-nowrap">Sumar/Restar Puntos:</label>
                    <input
                      id="admin-points-delta"
                      type="number"
                      className="block w-full max-w-[120px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                      value={adminPointsDelta}
                      onChange={e => setAdminPointsDelta(Number(e.target.value))}
                    />
                  </div>
                  <Button size="sm" onClick={handleUpdateAdminOwnerPoints} disabled={loading || !adminSelectedOwner} className="mt-4 sm:mt-0 self-start sm:self-center">
                    {loading && adminPointsMsg.startsWith('Puntos') ? 'Actualizando...' : 'Actualizar Puntos'}
                  </Button>
                </div>
                {adminPointsMsg && <div className="mt-2 text-sm text-green-600 font-medium">{adminPointsMsg.split(' ')[0]} {adminPointsMsg.split(' ')[1]}</div>}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

    </div>
  );
};

export default AdminExchangePanel;