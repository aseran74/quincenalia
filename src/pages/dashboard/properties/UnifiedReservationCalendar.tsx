import React, { useState, useEffect, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { format, addDays, isSameDay, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, Users, Clock, MapPin, Star, Coins, UserCheck, Building2 } from 'lucide-react';

export default function UnifiedReservationCalendar({ propiedadSeleccionada, pointsConfig }) {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reservas, setReservas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState({ from: undefined, to: undefined });
  const [selectedUser, setSelectedUser] = useState('');
  const [reservationType, setReservationType] = useState('normal');
  const [allUsers, setAllUsers] = useState([]);
  const [coOwners, setCoOwners] = useState([]);

  // --- NUEVO: Calcular días ocupados (asincrónico) ---
  const [bookedDays, setBookedDays] = useState([]);
  useEffect(() => {
    async function fetchBookedDays() {
      if (!propiedadSeleccionada?.id) {
        setBookedDays([]);
        return;
      }
      // Traer reservas normales y de intercambio
      const [{ data: normal }, { data: exchange }] = await Promise.all([
        supabase.from('property_reservations').select('start_date, end_date').eq('property_id', propiedadSeleccionada.id),
        supabase.from('exchange_reservations').select('start_date, end_date').eq('property_id', propiedadSeleccionada.id)
      ]);
      const all = [...(normal || []), ...(exchange || [])];
      const days = [];
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
  }, [propiedadSeleccionada?.id, modalOpen]);

  // Cargar usuario actual
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUser(profile);
      }
    };
    getUser();
  }, []);

  // Cargar usuarios (solo owners y copropietarios de la propiedad seleccionada)
  useEffect(() => {
    const loadUsers = async () => {
      if (!propiedadSeleccionada) {
        setAllUsers([]);
        return;
      }

      // Obtener los IDs de copropietarios de la propiedad
      const coOwnerIds = [
        propiedadSeleccionada.share1_owner_id,
        propiedadSeleccionada.share2_owner_id,
        propiedadSeleccionada.share3_owner_id,
        propiedadSeleccionada.share4_owner_id,
      ].filter(id => id && id !== 'null' && id !== 'undefined');

      // Cargar solo los usuarios que son copropietarios de esta propiedad específica
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role')
        .in('id', coOwnerIds)
        .order('first_name');
      
      setAllUsers(data || []);
      
      // Debug: mostrar información de usuarios cargados
      console.log('=== USUARIOS CARGADOS ===');
      console.log('IDs de copropietarios de la propiedad:', coOwnerIds);
      console.log('Usuarios encontrados:', data?.map(u => `${u.first_name} ${u.last_name} (${u.id})`) || []);
      console.log('========================');
    };
    loadUsers();
  }, [propiedadSeleccionada?.id]); // Recargar cuando cambie la propiedad

  // Determinar copropietarios de la propiedad
  useEffect(() => {
    if (propiedadSeleccionada) {
      const coOwnerIds = [
        propiedadSeleccionada.share1_owner_id,
        propiedadSeleccionada.share2_owner_id,
        propiedadSeleccionada.share3_owner_id,
        propiedadSeleccionada.share4_owner_id,
      ].filter(id => id && id !== 'null' && id !== 'undefined');
      setCoOwners(coOwnerIds);
      
      // Debug: mostrar información de la propiedad seleccionada
      console.log('=== PROPIEDAD SELECCIONADA ===');
      console.log('Título:', propiedadSeleccionada.title);
      console.log('ID:', propiedadSeleccionada.id);
      console.log('Share1 Owner ID:', propiedadSeleccionada.share1_owner_id);
      console.log('Share2 Owner ID:', propiedadSeleccionada.share2_owner_id);
      console.log('Share3 Owner ID:', propiedadSeleccionada.share3_owner_id);
      console.log('Share4 Owner ID:', propiedadSeleccionada.share4_owner_id);
      console.log('Copropietarios filtrados:', coOwnerIds);
      console.log('Total de copropietarios:', coOwnerIds.length);
      console.log('==============================');
      
      // Limpiar usuario seleccionado cuando cambia la propiedad
      setSelectedUser('');
    } else {
      setCoOwners([]);
    }
  }, [propiedadSeleccionada]);

  // Verificar si el usuario actual es admin
  const isAdmin = user?.role === 'admin';

  // Verificar si el usuario actual es copropietario
  const isCoOwner = useMemo(() => {
    if (!user || !propiedadSeleccionada) return false;
    return coOwners.includes(user.id);
  }, [user, coOwners, propiedadSeleccionada]);

  // Cargar reservas
  const fetchReservations = async () => {
    if (!propiedadSeleccionada?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reservations_unified')
        .select('*, user:profiles(id, first_name, last_name, email)')
        .eq('property_id', propiedadSeleccionada.id);
      
      if (error) throw error;
      setReservas(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las reservas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [propiedadSeleccionada?.id]);

  // Verificar si un día está ocupado
  const isDayBooked = (day) => {
    return bookedDays.some(bookedDay => isSameDay(bookedDay, day));
  };

  // Verificar si hay conflicto en el rango seleccionado
  const hasConflict = (from, to) => {
    // También chequea los días ocupados
    if (!from || !to) return false;
    let d = new Date(from);
    while (d <= to) {
      if (bookedDays.some(bd => bd.toDateString() === d.toDateString())) {
        return true;
      }
      d.setDate(d.getDate() + 1);
    }
    return false;
  };

  // Calcular puntos necesarios para intercambio
  const calculatePoints = (from, to) => {
    if (!pointsConfig) return 0;
    
    let total = 0;
    let current = new Date(from);
    const end = new Date(to);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        total += pointsConfig.points_per_day || 10;
    } else {
        total += pointsConfig.points_per_day_weekday || 5;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return total;
  };

  // Crear reserva
  const createReservation = async () => {
    if (!selectedRange.from || !selectedRange.to) {
      toast({
        title: "Error",
        description: "Selecciona un rango de fechas",
        variant: "destructive"
      });
      return;
    }

    if (hasConflict(selectedRange.from, selectedRange.to)) {
      toast({
        title: "Error",
        description: "Las fechas seleccionadas están ocupadas",
        variant: "destructive"
      });
      return;
    }

    const userId = isAdmin ? selectedUser : user.id;
    
    // Validar que el tipo de reserva sea correcto según el usuario
    let type;
    if (isAdmin) {
      // Para admin, verificar que el tipo seleccionado sea válido para el usuario
      const userIsCoOwner = isUserCoOwner(userId);
      const validType = userIsCoOwner ? 'normal' : 'exchange';
      
      if (reservationType !== validType) {
        toast({
          title: "Error",
          description: `Este usuario ${userIsCoOwner ? 'es copropietario' : 'no es copropietario'}, solo puede hacer reservas ${userIsCoOwner ? 'normales' : 'de intercambio'}`,
          variant: "destructive"
        });
        return;
      }
      type = reservationType;
    } else {
      // Para usuarios no admin, tipo automático según si es copropietario
      type = isCoOwner ? 'normal' : 'exchange';
    }

    // Si es intercambio, verificar y restar puntos
    if (type === 'exchange') {
      const pointsNeeded = calculatePoints(selectedRange.from, selectedRange.to);
      
      // Obtener puntos actuales del usuario
      const { data: pointsData } = await supabase
        .from('owner_points')
        .select('points')
        .eq('owner_id', userId)
        .single();

      const currentPoints = pointsData?.points || 0;
      
      if (currentPoints < pointsNeeded) {
        toast({
          title: "Error",
          description: `No tienes suficientes puntos. Necesitas ${pointsNeeded}, tienes ${currentPoints}`,
          variant: "destructive"
        });
        return;
      }

      // Restar puntos
      await supabase
        .from('owner_points')
        .update({ points: currentPoints - pointsNeeded })
        .eq('owner_id', userId);
    }

    // Crear la reserva
    try {
      let error;
      if (type === 'normal') {
        // Crear en property_reservations
        const { error: normalError } = await supabase
          .from('property_reservations')
          .insert({
            property_id: propiedadSeleccionada.id,
            owner_id: userId,
            start_date: selectedRange.from,
            end_date: selectedRange.to,
            status: 'aprobada'
          });
        error = normalError;
      } else {
        // Crear en exchange_reservations
        const pointsNeeded = calculatePoints(selectedRange.from, selectedRange.to);
        const { error: exchangeError } = await supabase
          .from('exchange_reservations')
          .insert({
            property_id: propiedadSeleccionada.id,
            owner_id: userId,
            start_date: selectedRange.from,
            end_date: selectedRange.to,
            status: 'aprobada',
            points: pointsNeeded,
            points_used: pointsNeeded
          });
        error = exchangeError;
      }

      if (error) throw error;

      toast({
        title: "Éxito",
        description: type === 'exchange' 
          ? `Reserva de intercambio creada. Se descontaron ${calculatePoints(selectedRange.from, selectedRange.to)} puntos.`
          : "Reserva normal creada exitosamente"
      });

    setModalOpen(false);
    setSelectedRange({ from: undefined, to: undefined });
      fetchReservations();
      // Forzar actualización de días ocupados
      setTimeout(() => {
        const fetchBookedDays = async () => {
          if (!propiedadSeleccionada?.id) return;
          const [{ data: normal }, { data: exchange }] = await Promise.all([
            supabase.from('property_reservations').select('start_date, end_date').eq('property_id', propiedadSeleccionada.id),
            supabase.from('exchange_reservations').select('start_date, end_date').eq('property_id', propiedadSeleccionada.id)
          ]);
          const all = [...(normal || []), ...(exchange || [])];
          const days = [];
          all.forEach(r => {
            let d = new Date(r.start_date);
            const end = new Date(r.end_date);
            while (d <= end) {
              days.push(new Date(d));
              d.setDate(d.getDate() + 1);
            }
          });
          setBookedDays(days);
        };
        fetchBookedDays();
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la reserva",
        variant: "destructive"
      });
    }
  };

  // Filtrar usuarios según el contexto
  const getAvailableUsers = () => {
  if (isAdmin) {
      // Admin puede seleccionar cualquier usuario
      return allUsers;
    } else if (isCoOwner) {
      // Copropietario solo puede reservar como normal
      return [user];
    } else {
      // Usuario no copropietario solo puede hacer intercambio
      return [user];
    }
  };

  // Verificar si un usuario específico es copropietario de la propiedad
  const isUserCoOwner = (userId) => {
    if (!propiedadSeleccionada || !userId) return false;
    
    // Verificar si el usuario está en la lista de copropietarios
    const isCoOwner = coOwners.includes(userId);
    
    // Debug: mostrar información de verificación
    console.log(`Verificando si usuario ${userId} es copropietario de ${propiedadSeleccionada.title}:`, isCoOwner);
    
    return isCoOwner;
  };

  // Determinar automáticamente el tipo de reserva según el usuario seleccionado
  const getAutoReservationType = (userId) => {
    if (!userId) return 'normal';
    return isUserCoOwner(userId) ? 'normal' : 'exchange';
  };

  // Actualizar automáticamente el tipo de reserva cuando cambia el usuario seleccionado
  useEffect(() => {
    if (isAdmin && selectedUser) {
      const autoType = getAutoReservationType(selectedUser);
      setReservationType(autoType);
    }
  }, [selectedUser, isAdmin, coOwners]);

  // Obtener usuarios separados por tipo para el selector
  const getUsersByType = () => {
    if (!propiedadSeleccionada || allUsers.length === 0) {
      return { coOwners: [], nonCoOwners: [] };
    }
    
    // Ahora allUsers solo contiene los copropietarios reales de la propiedad
    const coOwnerUsers = allUsers; // Todos los usuarios cargados son copropietarios
    const nonCoOwnerUsers = []; // No hay usuarios no copropietarios en la lista
    
    // Debug: mostrar información de copropietarios
    console.log('Propiedad seleccionada:', propiedadSeleccionada.title);
    console.log('IDs de copropietarios:', coOwners);
    console.log('Copropietarios encontrados:', coOwnerUsers.map(u => `${u.first_name} ${u.last_name} (${u.id})`));
    
    return {
      coOwners: coOwnerUsers,
      nonCoOwners: nonCoOwnerUsers
    };
  };

  // Obtener mensaje informativo según el contexto
  const getContextMessage = () => {
    if (!isAdmin) {
      if (isCoOwner) {
        return {
          type: 'info',
          message: 'Como copropietario, solo puedes hacer reservas normales',
          icon: 'UserCheck'
        };
      } else {
        return {
          type: 'warning',
          message: 'Como usuario no propietario, solo puedes hacer reservas de intercambio',
          icon: 'Coins'
        };
      }
    }
    return null;
  };

  const contextMessage = getContextMessage();
  const usersByType = getUsersByType();

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalReservas = reservas.length;
    const reservasNormales = reservas.filter(r => r.type === 'normal').length;
    const reservasIntercambio = reservas.filter(r => r.type === 'exchange').length;
    const diasOcupados = bookedDays.length;
    
    return { totalReservas, reservasNormales, reservasIntercambio, diasOcupados };
  }, [reservas, bookedDays]);

    return (
    <div className="space-y-6 w-full max-w-none lg:max-w-7xl xl:max-w-8xl mx-auto px-4 lg:px-8">
              {/* Header con información de la propiedad */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 lg:p-6 border border-blue-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 lg:gap-4 mb-4 lg:mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg lg:text-xl font-bold text-gray-900">
                  {propiedadSeleccionada?.title || 'Propiedad Seleccionada'}
                </h2>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Calendario de Reservas
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={isCoOwner ? "default" : "secondary"} className="flex items-center gap-1">
                <UserCheck className="h-3 w-3" />
                {isCoOwner ? "Copropietario" : "Usuario"}
              </Badge>
              {isAdmin && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Administrador
                </Badge>
              )}
            </div>
          </div>

          {/* Mensaje informativo de contexto */}
          {contextMessage && (
            <div className={`p-3 rounded-lg border ${
              contextMessage.type === 'info' 
                ? 'bg-blue-50 border-blue-200 text-blue-800' 
                : 'bg-yellow-50 border-yellow-200 text-yellow-800'
            }`}>
              <div className="flex items-center gap-2">
                {contextMessage.icon === 'UserCheck' ? (
                  <UserCheck className="h-4 w-4" />
                ) : (
                  <Coins className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{contextMessage.message}</span>
            </div>
          </div>
        )}

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-6">
          <div className="bg-white rounded-lg p-3 lg:p-5 border border-blue-200">
            <div className="flex items-center gap-2 mb-1 lg:mb-2">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total Reservas</span>
            </div>
            <p className="text-xl lg:text-3xl font-bold text-gray-900">{stats.totalReservas}</p>
          </div>
          <div className="bg-white rounded-lg p-3 lg:p-5 border border-green-200">
            <div className="flex items-center gap-2 mb-1 lg:mb-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Normales</span>
            </div>
            <p className="text-xl lg:text-3xl font-bold text-gray-900">{stats.reservasNormales}</p>
          </div>
          <div className="bg-white rounded-lg p-3 lg:p-5 border border-purple-200">
            <div className="flex items-center gap-2 mb-1 lg:mb-2">
              <Coins className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Intercambios</span>
            </div>
            <p className="text-xl lg:text-3xl font-bold text-gray-900">{stats.reservasIntercambio}</p>
          </div>
          <div className="bg-white rounded-lg p-3 lg:p-5 border border-orange-200">
            <div className="flex items-center gap-2 mb-1 lg:mb-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Días Ocupados</span>
            </div>
            <p className="text-xl lg:text-3xl font-bold text-gray-900">{stats.diasOcupados}</p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
        {/* Calendario */}
        <div className="lg:col-span-3 xl:col-span-4">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b p-4 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-gray-800 text-lg lg:text-xl">
                <CalendarDays className="h-5 w-5" />
                Selecciona tus fechas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 lg:p-8">
              <div className="flex justify-center">
      <Calendar
        mode="range"
        selected={selectedRange}
        onSelect={setSelectedRange}
                  disabled={date => bookedDays.some(d => d.toDateString() === date.toDateString())}
                  className="rounded-lg border-0 shadow-sm"
                  locale={es}
                  classNames={{
                    day_selected: "bg-blue-600 text-white hover:bg-blue-700",
                    day_today: "bg-blue-100 text-blue-900 font-bold",
                    day_disabled: "bg-red-100 text-red-400 cursor-not-allowed",
                    day_range_middle: "bg-blue-100 text-blue-900",
                    day_range_end: "bg-blue-600 text-white",
                    day_range_start: "bg-blue-600 text-white",
                  }}
                />
              </div>
              
              {/* Leyenda */}
              <div className="mt-6 lg:mt-8 p-4 lg:p-6 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">Leyenda del Calendario</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 rounded border border-red-300"></div>
                    <span className="text-sm text-gray-600">Ocupados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 rounded border border-blue-300"></div>
                    <span className="text-sm text-gray-600">Disponibles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span className="text-sm text-gray-600">Seleccionados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 rounded border-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">Hoy</span>
      </div>
      </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4 lg:space-y-6">
          {/* Información de la propiedad */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b p-3 lg:p-4">
              <CardTitle className="flex items-center gap-2 text-gray-800 text-sm lg:text-base">
                <Building2 className="h-4 w-4 lg:h-5 lg:w-5" />
                Información
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 lg:p-4">
              <div className="space-y-3 lg:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Copropietarios:</span>
                  </div>
                  <Badge variant="outline">{coOwners.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Reservas activas:</span>
                  </div>
                  <Badge variant="outline">{reservas.length}</Badge>
                </div>
                {pointsConfig && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Coins className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Puntos fin de semana:</span>
                    </div>
                    <Badge variant="outline">{pointsConfig.points_per_day || 10}</Badge>
              </div>
            )}
              </div>
            </CardContent>
          </Card>

          {/* Reservas recientes */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b p-3 lg:p-4">
              <CardTitle className="flex items-center gap-2 text-gray-800 text-sm lg:text-base">
                <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
                Reservas Recientes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 lg:p-4">
              <div className="space-y-2 lg:space-y-3 max-h-40 lg:max-h-48 overflow-y-auto">
                {reservas.length === 0 ? (
                  <div className="text-center py-3 lg:py-4">
                    <CalendarDays className="h-6 w-6 lg:h-8 lg:w-8 text-gray-400 mx-auto mb-1 lg:mb-2" />
                    <p className="text-xs lg:text-sm text-gray-500">No hay reservas activas</p>
                  </div>
                ) : (
                  reservas.slice(0, 4).map((reserva, index) => (
                    <div key={index} className="p-2 lg:p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-1 lg:mb-2">
                        <div className="flex items-center gap-1 lg:gap-2">
                          <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-blue-500"></div>
                          <span className="text-xs lg:text-sm font-medium text-gray-900 truncate">
                            {reserva.user?.first_name} {reserva.user?.last_name}
                          </span>
                        </div>
                        <Badge 
                          variant={reserva.type === 'exchange' ? 'secondary' : 'default'}
                          className="text-xs flex-shrink-0"
                        >
                          {reserva.type === 'exchange' ? 'Intercambio' : 'Normal'}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        {format(new Date(reserva.start_date), 'dd/MM/yyyy')} - {format(new Date(reserva.end_date), 'dd/MM/yyyy')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Botón de crear reserva */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-3 lg:p-4">
              <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                    disabled={!selectedRange.from || !selectedRange.to}
                    size="default"
                  >
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Crear Reserva
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg lg:text-xl">
                      <CalendarDays className="h-5 w-5 lg:h-6 lg:w-6" />
                      Crear Nueva Reserva
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Columna izquierda - Formulario */}
                    <div className="space-y-4">
                      {/* Rango seleccionado */}
                      {selectedRange.from && selectedRange.to && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <p className="text-sm font-medium text-blue-900">Fechas seleccionadas:</p>
                          </div>
                          <p className="text-sm text-blue-800">
                            {format(selectedRange.from, 'dd/MM/yyyy')} - {format(selectedRange.to, 'dd/MM/yyyy')}
                          </p>
                        </div>
                      )}

                      {/* Selector de usuario (solo para admin) */}
                      {isAdmin && (
                        <div>
                          <Label htmlFor="user-select" className="flex items-center gap-2 text-sm font-medium">
                            <Users className="h-4 w-4" />
                            Copropietario de {propiedadSeleccionada?.title}
                          </Label>
                          <div className="text-xs text-gray-500 mt-1 mb-2">
                            {usersByType.coOwners.length} copropietario{usersByType.coOwners.length !== 1 ? 's' : ''} de esta propiedad
                          </div>
                          <Select value={selectedUser} onValueChange={setSelectedUser}>
                            <SelectTrigger className="mt-2 h-12">
                              <SelectValue placeholder="Seleccionar copropietario" />
                            </SelectTrigger>
                            <SelectContent>
                              {usersByType.coOwners.length === 0 && (
                                <SelectItem value="" disabled>No hay copropietarios en esta propiedad</SelectItem>
                              )}
                              {usersByType.coOwners.map((u) => (
                                <SelectItem key={u.id} value={u.id}>
                                  {u.first_name} {u.last_name} ({u.email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
              </div>
            )}

                      {/* Información de puntos para intercambio */}
                      {((isAdmin && reservationType === 'exchange') || (!isAdmin && !isCoOwner)) && (
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Coins className="h-4 w-4 text-yellow-600" />
                            <p className="text-sm font-medium text-yellow-900">Reserva de Intercambio</p>
                          </div>
                          <p className="text-sm text-yellow-800">
                            Puntos necesarios: <span className="font-bold">{calculatePoints(selectedRange.from, selectedRange.to)}</span>
                          </p>
                        </div>
                      )}

                      {/* Botones */}
                      <div className="flex gap-3 pt-4">
                        <Button 
                          onClick={createReservation}
                          className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium"
                        >
                          Confirmar Reserva
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setModalOpen(false)}
                          className="h-12 px-6"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>

                    {/* Columna derecha - Calendario */}
                    <div className="flex justify-center">
                      <Calendar
                        mode="range"
                        selected={selectedRange}
                        onSelect={setSelectedRange}
                        disabled={date => bookedDays.some(d => d.toDateString() === date.toDateString())}
                        className="rounded-lg border shadow-sm"
                        locale={es}
                        classNames={{
                          day_selected: "bg-blue-600 text-white hover:bg-blue-700",
                          day_today: "bg-blue-100 text-blue-900 font-bold",
                          day_disabled: "bg-red-100 text-red-400 cursor-not-allowed",
                          day_range_middle: "bg-blue-100 text-blue-900",
                          day_range_end: "bg-blue-600 text-white",
                          day_range_start: "bg-blue-600 text-white",
                        }}
                      />
            </div>
          </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 