import React, { useState, useEffect, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

const MODES = [
  { value: 'normal', label: 'Reserva normal', color: 'bg-green-200', text: 'text-green-800' },
  { value: 'exchange', label: 'Intercambio', color: 'bg-blue-200', text: 'text-blue-800' },
];

export default function UnifiedReservationCalendar({ propiedadSeleccionada, owners, pointsConfig, onPointsChange }) {
  const { user } = useAuth();
  const [mode, setMode] = useState('normal');
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState({ from: undefined, to: undefined });
  const [ownerPoints, setOwnerPoints] = useState(0);

  // --- Lista de copropietarios con datos ---
  const coOwnerData = [
    { id: propiedadSeleccionada?.share1_owner_id, label: 'share1' },
    { id: propiedadSeleccionada?.share2_owner_id, label: 'share2' },
    { id: propiedadSeleccionada?.share3_owner_id, label: 'share3' },
    { id: propiedadSeleccionada?.share4_owner_id, label: 'share4' },
  ].filter(o => !!o.id);
  // --- Lista de IDs de copropietarios (como string, sin espacios) ---
  const coOwners = coOwnerData.map(o => String(o.id).trim());
  // --- Estado para el copropietario seleccionado (solo admin) ---
  const [selectedOwnerId, setSelectedOwnerId] = useState(coOwners[0] || '');
  useEffect(() => { setSelectedOwnerId(coOwners[0] || ''); }, [coOwners]);
  // --- Detectar si es admin ---
  const isAdmin = user?.role === 'admin';
  // --- Detectar si el usuario es copropietario (comparando como string, sin espacios) ---
  const isCoOwner = useMemo(() => {
    if (!user || !propiedadSeleccionada) return false;
    return coOwners.includes(String(user.id).trim());
  }, [user, coOwners, propiedadSeleccionada]);

  // --- Cargar reservas normales y de intercambio juntas ---
  const fetchAllReservations = async () => {
    setLoading(true);
    try {
      const { data: normal, error: err1 } = await supabase
        .from('property_reservations')
        .select('*, owner:profiles!fk_owner_profile (id, first_name, last_name)')
        .eq('property_id', propiedadSeleccionada.id);
      if (err1) throw err1;
      const { data: exchange, error: err2 } = await supabase
        .from('exchange_reservations')
        .select('*')
        .eq('property_id', propiedadSeleccionada.id);
      if (err2) throw err2;
      // Añadimos tipo
      const all = [
        ...(normal || []).map(r => ({ ...r, type: 'normal' })),
        ...(exchange || []).map(r => ({ ...r, type: 'exchange' })),
      ];
      setReservas(all);
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propiedadSeleccionada?.id) fetchAllReservations();
    // eslint-disable-next-line
  }, [propiedadSeleccionada?.id]);

  // --- Días ocupados ---
  const bookedDays = useMemo(() => {
    const days = [];
    reservas.forEach(res => {
      let current = new Date(res.start_date);
      const end = new Date(res.end_date);
      while (current <= end) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    });
    return days;
  }, [reservas]);

  // --- Permisos de modo ---
  const canExchange = user?.points > 0; // O lógica real de puntos

  // --- Determinar modos permitidos ---
  let allowedModes = MODES;
  let forcedMode = null;
  if (!isAdmin) {
    if (isCoOwner) {
      allowedModes = MODES.filter(m => m.value === 'normal');
      forcedMode = 'normal';
    } else {
      allowedModes = MODES.filter(m => m.value === 'exchange');
      forcedMode = 'exchange';
    }
  }
  // Si solo hay un modo permitido, forzamos ese modo
  useEffect(() => {
    if (forcedMode && mode !== forcedMode) setMode(forcedMode);
    // eslint-disable-next-line
  }, [forcedMode]);

  // --- Crear reserva (modal simplificado) ---
  const handleCreateReservation = async () => {
    if (!selectedRange.from || !selectedRange.to) return;
    // Validación de conflicto en tiempo real
    await fetchAllReservations();
    const conflict = reservas.some(res => {
      const resStart = new Date(res.start_date);
      const resEnd = new Date(res.end_date);
      return (
        (selectedRange.from <= resEnd && selectedRange.to >= resStart)
      );
    });
    if (conflict) {
      toast({ title: 'Error', description: 'Fechas ocupadas por otra reserva.' });
      return;
    }
    // Insert según modo
    if (mode === 'normal') {
      // Admin puede reservar para cualquier copropietario
      const ownerIdToUse = isAdmin ? selectedOwnerId : user.id;
      if (!isAdmin && !isCoOwner) {
        toast({ title: 'Error', description: 'Solo copropietarios pueden reservar en este modo.' });
        return;
      }
      const { error } = await supabase
        .from('property_reservations')
        .insert({
          property_id: propiedadSeleccionada.id,
          owner_id: ownerIdToUse,
          start_date: selectedRange.from,
          end_date: selectedRange.to,
          status: 'pending',
        });
      if (error) {
        toast({ title: 'Error', description: error.message });
        return;
      }
    } else {
      // Intercambio
      if (!canExchange) {
        toast({ title: 'Error', description: 'No tienes puntos suficientes.' });
        return;
      }
      const { error } = await supabase
        .from('exchange_reservations')
        .insert({
          property_id: propiedadSeleccionada.id,
          owner_id: user.id,
          start_date: selectedRange.from,
          end_date: selectedRange.to,
          status: 'pending',
        });
      if (error) {
        toast({ title: 'Error', description: error.message });
        return;
      }
    }
    toast({ title: 'Reserva creada', description: 'Reserva registrada correctamente.' });
    setModalOpen(false);
    setSelectedRange({ from: undefined, to: undefined });
    fetchAllReservations();
  };

  // --- Render ---
  return (
    <div className="w-full max-w-3xl mx-auto px-2 md:px-8 lg:px-16 py-4 md:py-8">
      {/* Debug info copropietarios y usuario */}
      <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
        <div><b>Copropietarios:</b> {[
          propiedadSeleccionada?.share1_owner_id,
          propiedadSeleccionada?.share2_owner_id,
          propiedadSeleccionada?.share3_owner_id,
          propiedadSeleccionada?.share4_owner_id
        ].filter(Boolean).join(', ') || 'Ninguno'}</div>
        <div><b>Tu ID:</b> {user?.id || 'No logueado'}</div>
        {!isCoOwner && mode === 'normal' && (
          <div className="mt-1 text-red-600 font-semibold">No puedes reservar en modo normal porque no eres copropietario de esta propiedad.</div>
        )}
      </div>
      <div className="flex gap-4 mb-4 justify-center">
        {allowedModes.map(opt => (
          <button
            key={opt.value}
            className={`px-4 py-2 rounded ${mode === opt.value ? opt.color + ' ' + opt.text : 'bg-gray-100 text-gray-500'} font-semibold`}
            onClick={() => setMode(opt.value)}
            disabled={false}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {/* Mensaje según permisos */}
      {!isAdmin && isCoOwner && (
        <div className="mb-2 text-green-700 text-xs font-semibold">Solo puedes hacer reservas normales porque eres copropietario de esta propiedad.</div>
      )}
      {!isAdmin && !isCoOwner && (
        <div className="mb-2 text-blue-700 text-xs font-semibold">Solo puedes hacer reservas de intercambio porque no eres copropietario de esta propiedad.</div>
      )}
      <Calendar
        mode="range"
        selected={selectedRange}
        onSelect={setSelectedRange}
        disabled={date => bookedDays.some(bd => bd.toDateString() === date.toDateString())}
        modifiers={{ booked: bookedDays }}
        modifiersClassNames={{ booked: 'bg-red-200 text-red-700' }}
        className="mb-6"
      />
      <div className="flex justify-center">
        <button
          className="px-6 py-2 bg-primary text-white rounded shadow font-semibold"
          onClick={() => setModalOpen(true)}
          disabled={!selectedRange.from || !selectedRange.to}
        >
          Reservar semana seleccionada
        </button>
      </div>
      {/* Listado de reservas */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Reservas existentes</h3>
        <ul className="space-y-2">
          {reservas.map((res, i) => (
            <li key={i} className={`rounded px-3 py-2 flex items-center gap-2 ${res.type === 'normal' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
              <span className="font-bold">{res.owner?.first_name || 'owner'}:</span>
              <span>{new Date(res.start_date).toLocaleDateString()} - {new Date(res.end_date).toLocaleDateString()}</span>
              <span className="ml-auto text-xs px-2 py-1 rounded-full bg-white border font-semibold">{res.type === 'normal' ? 'Normal' : 'Intercambio'}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Modal simplificado */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirmar reserva</h2>
            <p className="mb-2">Propiedad: <span className="font-semibold">{propiedadSeleccionada.title}</span></p>
            <p className="mb-2">Fechas: <span className="font-semibold">{selectedRange.from?.toLocaleDateString()} - {selectedRange.to?.toLocaleDateString()}</span></p>
            <p className="mb-4">Tipo: <span className="font-semibold capitalize">{mode === 'normal' ? 'Normal' : 'Intercambio'}</span></p>
            {/* Selector de copropietario solo para admin en modo normal */}
            {isAdmin && mode === 'normal' && (
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">Copropietario:</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={selectedOwnerId}
                  onChange={e => setSelectedOwnerId(e.target.value)}
                >
                  {coOwnerData.map(o => (
                    <option key={o.id} value={o.id}>{o.id}</option>
                  ))}
                </select>
              </div>
            )}
            {/* Mensaje de ayuda si el usuario es copropietario pero no se detecta */}
            {!isAdmin && !isCoOwner && mode === 'normal' && (
              <div className="mb-2 text-red-600 text-xs font-semibold">Si eres copropietario y no puedes reservar, revisa que tu usuario esté correctamente asignado en la propiedad.</div>
            )}
            <div className="flex gap-4 mt-6">
              <button className="flex-1 py-2 rounded bg-primary text-white font-semibold" onClick={handleCreateReservation}>Confirmar</button>
              <button className="flex-1 py-2 rounded bg-gray-200 text-gray-700 font-semibold" onClick={() => setModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 