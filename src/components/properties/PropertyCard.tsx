import React, { FC, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Property } from '../../../lib/supabase'
import { Calendar } from '@/components/ui/calendar';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

interface PropertyCardProps extends Property {
  selectedRange?: DateRange;
}

export const PropertyCard: FC<PropertyCardProps> = ({
  id,
  title,
  description,
  price,
  location,
  bedrooms,
  bathrooms,
  area,
  image_url,
  agent,
  features,
  share1_price,
  share1_status,
  share2_price,
  share2_status,
  share3_price,
  share3_status,
  share4_price,
  share4_status,
  selectedRange
}) => {
  // Agrupar características por categoría
  const groupedFeatures = features?.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, typeof features>);

  const [busyDates, setBusyDates] = useState<Date[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const fetchReservations = async () => {
      // Traer reservas normales
      const { data: propRes, error: err1 } = await supabase
        .from('property_reservations')
        .select('start_date, end_date')
        .eq('property_id', id);
      // Traer reservas de intercambio
      const { data: exchRes, error: err2 } = await supabase
        .from('exchange_reservations')
        .select('start_date, end_date')
        .eq('property_id', id);
      if ((!err1 && propRes) || (!err2 && exchRes)) {
        const all = [...(propRes || []), ...(exchRes || [])];
        const dates: Date[] = [];
        all.forEach((r: any) => {
          const start = new Date(r.start_date);
          const end = new Date(r.end_date);
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
          }
        });
        setBusyDates(dates);
      } else {
        setBusyDates([]);
      }
    };
    fetchReservations();
  }, [id]);

  const getReserveUrl = () => {
    let url = `/dashboard/owner/exchange?propertyId=${id}`;
    if (selectedRange && selectedRange.from && selectedRange.to) {
      url += `&from=${format(selectedRange.from, 'yyyy-MM-dd')}&to=${format(selectedRange.to, 'yyyy-MM-dd')}`;
    }
    return url;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow max-w-xl mx-auto">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <img
            src={image_url}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-2">{location}</p>
        <p className="text-gray-500 text-sm line-clamp-2">{description}</p>
        
        <div className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Precio Total: ${price.toLocaleString()}</span>
            <div className="flex gap-4 text-gray-600">
              <span>{bedrooms} 🛏️</span>
              <span>{bathrooms} 🚿</span>
              <span>{area}m² 📏</span>
            </div>
          </div>

          {/* Características */}
          {groupedFeatures && Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-semibold capitalize">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {categoryFeatures?.map(feature => (
                  <span
                    key={feature.id}
                    className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-sm"
                  >
                    {feature.icon} {feature.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
          
          {/* Shares eliminados para esta vista */}
          
          {agent && (
            <div className="text-sm mt-4 text-gray-600">
              <span className="font-semibold">Agente:</span> {agent.first_name} {agent.last_name} - {agent.phone}
            </div>
          )}

          {/* Calendario acordeón */}
          <div className="mt-4">
            <button
              className="flex items-center gap-2 text-blue-700 font-semibold hover:underline focus:outline-none"
              onClick={() => setShowCalendar((v) => !v)}
              aria-expanded={showCalendar}
            >
              {showCalendar ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showCalendar ? 'Ocultar disponibilidad' : 'Ver disponibilidad'}
            </button>
            {showCalendar && (
              <div className="pt-4">
                <h4 className="text-sm font-semibold mb-2">Disponibilidad</h4>
                <Calendar
                  mode="multiple"
                  selected={busyDates}
                  disabled={busyDates}
                  locale={es}
                  numberOfMonths={2}
                  showOutsideDays
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        <Button asChild className="w-full">
          <Link
            to={`/properties/${id}`}
            className="w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Ver detalles
          </Link>
        </Button>
        <Button asChild className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold">
          <Link
            to={getReserveUrl()}
            className="w-full px-3 py-2 text-center text-sm font-semibold"
          >
            Reservar
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 