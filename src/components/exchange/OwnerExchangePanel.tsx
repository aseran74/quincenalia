import { toast } from '@/components/ui/use-toast';
import { Sparkles } from 'lucide-react';

if (!error) {
  setPoints(points - reservationCost);
  setSelectedDates([]);
  toast({
    title: 'Reserva enviada',
    description: 'Reserva enviada y puntos descontados. Pendiente de aprobación.',
    icon: <Sparkles className="h-6 w-6 text-yellow-300" />,
    className: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 shadow-xl',
  });
} else {
  alert('Error al crear la reserva: ' + error.message);
} 