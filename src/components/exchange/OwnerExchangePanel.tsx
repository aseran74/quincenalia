import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Sparkles, MapPin, Calendar as CalendarIcon, Users, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Property {
  id: string;
  title: string;
  location: string;
  points_per_night: number;
  weekend_points_per_night: number;
  max_guests: number;
  images: string[];
  description: string;
}

interface OwnerPoints {
  id: string;
  owner_id: string;
  points: number;
  created_at: string;
  updated_at: string;
}

const OwnerExchangePanel: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [reservationCost, setReservationCost] = useState(0);

  // Cargar propiedades disponibles para intercambio
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('exchange_properties')
          .select(`
            id,
            title,
            location,
            points_per_night,
            weekend_points_per_night,
            max_guests,
            images,
            description
          `)
          .eq('available', true);

        if (error) throw error;
        setProperties(data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las propiedades',
          variant: 'destructive',
        });
      }
    };

    fetchProperties();
  }, []);

  // Cargar puntos del propietario
  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('owner_points')
          .select('points')
          .eq('owner_id', user.id)
          .single();

        if (error) throw error;
        setPoints(data?.points || 0);
      } catch (error) {
        console.error('Error fetching points:', error);
      }
    };

    fetchPoints();
  }, []);

  // Calcular costo de la reserva
  useEffect(() => {
    if (selectedProperty && selectedDates.length >= 2) {
      const startDate = selectedDates[0];
      const endDate = selectedDates[1];
      const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let totalCost = 0;
      for (let i = 0; i < nights; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dayOfWeek = currentDate.getDay();
        
        // 0 = Domingo, 6 = Sábado (fin de semana)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          totalCost += selectedProperty.weekend_points_per_night;
        } else {
          totalCost += selectedProperty.points_per_night;
        }
      }
      
      setReservationCost(totalCost);
    }
  }, [selectedProperty, selectedDates]);

  const handleReserve = async () => {
    if (!selectedProperty || selectedDates.length < 2) {
      toast({
        title: 'Error',
        description: 'Selecciona una propiedad y fechas válidas',
        variant: 'destructive',
      });
      return;
    }

    if (points < reservationCost) {
      toast({
        title: 'Puntos insuficientes',
        description: `Necesitas ${reservationCost} puntos, pero solo tienes ${points}`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Llamar a la función RPC para crear la reserva
      const { data, error } = await supabase.rpc('create_exchange_reservation', {
        property_id: selectedProperty.id,
        start_date: selectedDates[0].toISOString().split('T')[0],
        end_date: selectedDates[1].toISOString().split('T')[0],
        points_to_use: reservationCost
      });

      if (error) throw error;

      // Actualizar puntos localmente
      setPoints(points - reservationCost);
      setSelectedDates([]);
      setSelectedProperty(null);
      
      toast({
        title: 'Reserva enviada',
        description: 'Reserva enviada y puntos descontados. Pendiente de aprobación.',
        icon: <Sparkles className="h-6 w-6 text-yellow-300" />,
        className: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 shadow-xl',
      });
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al crear la reserva',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Intercambio de Estancias</h2>
          <p className="text-gray-600">Usa tus puntos para reservar estancias en otras propiedades</p>
        </div>
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <span className="text-lg font-semibold text-gray-900">{points} puntos</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selección de Propiedad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Seleccionar Propiedad</span>
            </CardTitle>
            <CardDescription>
              Elige la propiedad donde quieres hospedarte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={(value) => {
              const property = properties.find(p => p.id === value);
              setSelectedProperty(property || null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una propiedad" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{property.title}</span>
                      <span className="text-sm text-gray-500">{property.location}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedProperty && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">{selectedProperty.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{selectedProperty.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{selectedProperty.max_guests} huéspedes</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>{selectedProperty.points_per_night} pts/noche</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selección de Fechas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>Seleccionar Fechas</span>
            </CardTitle>
            <CardDescription>
              Elige las fechas de tu estancia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Fecha de entrada</label>
              <input
                type="date"
                value={selectedDates[0]?.toISOString().split('T')[0] || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    const newDate = new Date(e.target.value);
                    setSelectedDates([newDate, selectedDates[1] || newDate]);
                  }
                }}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Fecha de salida</label>
              <input
                type="date"
                value={selectedDates[1]?.toISOString().split('T')[0] || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    const newDate = new Date(e.target.value);
                    setSelectedDates([selectedDates[0] || newDate, newDate]);
                  }
                }}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de Reserva */}
      {selectedProperty && selectedDates.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de la Reserva</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Propiedad:</span>
                <span className="font-medium">{selectedProperty.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fechas:</span>
                <span className="font-medium">
                  {selectedDates[0].toLocaleDateString()} - {selectedDates[1].toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Noches:</span>
                <span className="font-medium">
                  {Math.ceil((selectedDates[1].getTime() - selectedDates[0].getTime()) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Costo total:</span>
                <Badge variant="outline" className="text-lg font-semibold">
                  {reservationCost} puntos
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Puntos disponibles:</span>
                <span className="font-medium">{points}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Puntos restantes:</span>
                <span className={`font-medium ${points - reservationCost < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {points - reservationCost}
                </span>
              </div>
            </div>

            <Button
              onClick={handleReserve}
              disabled={loading || points < reservationCost}
              className="w-full mt-6"
            >
              {loading ? 'Procesando...' : 'Confirmar Reserva'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OwnerExchangePanel;