import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { format, isWeekend, addDays } from 'date-fns';
import ReservationCalendar from '@/pages/dashboard/properties/ReservationCalendar';

interface Property {
  id: string;
  title: string;
}

interface ExchangeProperty {
  id: string;
  property_id: string;
  start_date: string;
  end_date: string;
  points_per_day: number;
  points_per_day_weekday: number;
  active: boolean;
}

interface Reservation {
  id: string;
  property_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  status: string;
  points: number;
}

interface Owner {
  id: string;
  first_name: string;
  last_name: string;
}

const OwnerExchangePanel: React.FC = () => {
  const { user } = useAuth();
  const [points, setPoints] = useState<number>(0);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [exchangeConfig, setExchangeConfig] = useState<ExchangeProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [pendingReservations, setPendingReservations] = useState<Reservation[]>([]);
  const [calendarDisabledDates, setCalendarDisabledDates] = useState<Date[]>([]);
  const [reservationCost, setReservationCost] = useState<number>(0);
  const [owners, setOwners] = useState<Owner[]>([]);

  // Cargar puntos y propiedades 100% vendidas
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Obtener puntos del owner
      const { data: pointsData } = await supabase
        .from('owner_points')
        .select('points')
        .eq('owner_id', user?.id)
        .single();
      setPoints(pointsData?.points ?? 1000);
      // Obtener propiedades 100% vendidas (sin filtrar por owner)
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('id, title, share1_status, share2_status, share3_status, share4_status');
      // Filtrar en frontend para asegurarnos que todos los shares cumplen
      const filtered = (propertiesData || []).filter((p: any) =>
        ['vendido', 'vendida'].includes(p.share1_status) &&
        ['vendido', 'vendida'].includes(p.share2_status) &&
        ['vendido', 'vendida'].includes(p.share3_status) &&
        ['vendido', 'vendida'].includes(p.share4_status)
      );
      setProperties(filtered);
      if (filtered && filtered.length > 0) {
        setSelectedProperty(filtered[0].id);
      }
      setLoading(false);
    };
    if (user?.id) fetchData();
  }, [user?.id]);

  // Cargar configuración de puntos y reservas pendientes al cambiar de propiedad
  useEffect(() => {
    const fetchConfigAndReservations = async () => {
      if (!selectedProperty) return;
      // Configuración de puntos
      const { data: configData } = await supabase
        .from('exchange_properties')
        .select('*')
        .eq('property_id', selectedProperty)
        .eq('active', true)
        .single();
      setExchangeConfig(configData);
      // Reservas de intercambio de la propiedad seleccionada (todas, no solo las del owner)
      const { data: reservationsData } = await supabase
        .from('exchange_reservations')
        .select('*')
        .eq('property_id', selectedProperty)
        .order('start_date');
      setPendingReservations(reservationsData || []);
      // Fechas ocupadas (de todas las reservas aprobadas o pendientes)
      const { data: allRes } = await supabase
        .from('exchange_reservations')
        .select('start_date, end_date')
        .eq('property_id', selectedProperty)
        .in('status', ['pendiente', 'aprobada']);
      let disabled: Date[] = [];
      if (allRes) {
        allRes.forEach((r: any) => {
          let d = new Date(r.start_date);
          let end = new Date(r.end_date);
          while (d <= end) {
            disabled.push(new Date(d));
            d = addDays(d, 1);
          }
        });
      }
      setCalendarDisabledDates(disabled);
    };
    if (selectedProperty && user?.id) fetchConfigAndReservations();
  }, [selectedProperty, user?.id]);

  // Calcular el coste de la reserva
  useEffect(() => {
    if (!exchangeConfig || selectedDates.length === 0) {
      setReservationCost(0);
      return;
    }
    let total = 0;
    selectedDates.forEach(date => {
      if (isWeekend(date)) {
        total += exchangeConfig.points_per_day;
      } else {
        total += exchangeConfig.points_per_day_weekday;
      }
    });
    setReservationCost(total);
  }, [exchangeConfig, selectedDates]);

  // Handler para reservar
  const handleReserve = async () => {
    if (!selectedProperty || selectedDates.length === 0 || !user?.id) return;
    if (reservationCost > points) {
      alert('No tienes suficientes puntos');
      return;
    }
    // Crear reserva pendiente
    const start = format(selectedDates[0], 'yyyy-MM-dd');
    const end = format(selectedDates[selectedDates.length - 1], 'yyyy-MM-dd');
    const { error } = await supabase.from('exchange_reservations').insert({
      property_id: selectedProperty,
      owner_id: user.id,
      start_date: start,
      end_date: end,
      status: 'pendiente',
      points: reservationCost,
      points_used: reservationCost
    });
    if (!error) {
      setPoints(points - reservationCost);
      setSelectedDates([]);
      alert('Reserva enviada y puntos descontados. Pendiente de aprobación.');
    } else {
      alert('Error al crear la reserva: ' + error.message);
    }
  };

  // Handler para actualizar puntos tras reservar
  const handlePointsChange = (newPoints: number) => {
    setPoints(newPoints);
  };

  // Renderizado
  return (
    <div className="w-full max-w-full p-2 sm:p-4 flex flex-col gap-4">
      <Card className="mb-4 w-full max-w-full">
        <CardHeader>
          <CardTitle>Intercambio de Estancias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2 font-semibold">Tus puntos: <span className="text-blue-600">{points}</span></div>
          <div className="mb-2">
            <label className="font-medium">Propiedad:</label>
            <select
              className="ml-2 border rounded px-2 py-1 w-full max-w-xs"
              value={selectedProperty}
              onChange={e => setSelectedProperty(e.target.value)}
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          {exchangeConfig && (
            <div className="mb-2 text-sm text-gray-600">
              <div>Precio entre semana: <b>{exchangeConfig.points_per_day_weekday} puntos/día</b></div>
              <div>Precio fin de semana: <b>{exchangeConfig.points_per_day} puntos/día</b></div>
            </div>
          )}
          {/* Calendario de selección de fechas */}
          <div className="my-4">
            <ReservationCalendar
              propertyId={selectedProperty}
              exchangeMode={true}
              pointsConfig={exchangeConfig ? {
                points_per_day: exchangeConfig.points_per_day,
                points_per_day_weekday: exchangeConfig.points_per_day_weekday
              } : undefined}
              ownerPoints={points}
              onPointsChange={handlePointsChange}
            />
          </div>
        </CardContent>
      </Card>
      <Card className="w-full max-w-full">
        <CardHeader>
          <CardTitle>Reservas Pendientes/Aprobadas</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Cards en móvil y tablet */}
          <div className="space-y-4 lg:hidden">
            {pendingReservations.length === 0 ? (
              <div className="text-gray-500">No hay reservas para esta propiedad.</div>
            ) : (
              pendingReservations.map(r => (
                <div key={r.id} className="border rounded-lg p-4 shadow-sm bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-semibold text-gray-800 truncate pr-2">
                      {r.start_date} a {r.end_date}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.status === 'aprobada' ? 'bg-blue-100 text-blue-800' : r.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : r.status === 'anulada' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'} whitespace-nowrap`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {(() => {
                      const owner = owners.find(o => o.id === r.owner_id);
                      return owner ? `${owner.first_name} ${owner.last_name}` : r.owner_id;
                    })()}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    {r.points} puntos
                  </p>
                  {/* Aquí puedes añadir acciones si lo deseas */}
                </div>
              ))
            )}
          </div>
          {/* Tabla solo en escritorio grande */}
          <div className="hidden lg:block overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propietario</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha inicio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha fin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntos</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingReservations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">No hay reservas para esta propiedad.</td>
                  </tr>
                ) : (
                  pendingReservations.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-medium">
                        {(() => {
                          const owner = owners.find(o => o.id === r.owner_id);
                          return owner ? `${owner.first_name} ${owner.last_name}` : r.owner_id;
                        })()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{r.start_date}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{r.end_date}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.status === 'aprobada' ? 'bg-blue-100 text-blue-800' : r.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : r.status === 'anulada' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'} whitespace-nowrap`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{r.points}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerExchangePanel; 