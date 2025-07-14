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
  const isCoOwner = useMemo(() => {
    if (!user || !propiedadSeleccionada) return false;
    const ids = [
      propiedadSeleccionada.share1_owner_id,
      propiedadSeleccionada.share2_owner_id,
      propiedadSeleccionada.share3_owner_id,
      propiedadSeleccionada.share4_owner_id,
    ];
    return ids.includes(user.id);
  }, [user, propiedadSeleccionada]);

  const canExchange = user?.points > 0; // O lógica real de puntos

  // --- Cambiar modo según permisos ---
  useEffect(() => {
    if (mode === 'normal' && !isCoOwner) setMode('exchange');
    if (mode === 'exchange' && !canExchange) setMode('normal');
    // eslint-disable-next-line
  }, [isCoOwner, canExchange]);

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
      // Solo copropietarios
      if (!isCoOwner) {
        toast({ title: 'Error', description: 'Solo copropietarios pueden reservar en este modo.' });
        return;
      }
      const { error } = await supabase
        .from('property_reservations')
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
      <div className="flex gap-4 mb-4 justify-center">
        {MODES.map(opt => (
          <button
            key={opt.value}
            className={`px-4 py-2 rounded ${mode === opt.value ? opt.color + ' ' + opt.text : 'bg-gray-100 text-gray-500'} font-semibold`}
            onClick={() => setMode(opt.value)}
            disabled={
              (opt.value === 'normal' && !isCoOwner) ||
              (opt.value === 'exchange' && !canExchange)
            }
          >
            {opt.label}
          </button>
        ))}
      </div>
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