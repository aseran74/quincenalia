import React from 'react';
import { Button } from '@/components/ui/button';

interface ExchangeReservationCardProps {
  startDate: string;
  endDate: string;
  points: number;
  status: string;
  ownerName: string;
  actions?: React.ReactNode; // Botones o menú contextual
}

const statusStyles: Record<string, string> = {
  aprobada: 'bg-blue-100 text-blue-800',
  pendiente: 'bg-yellow-100 text-yellow-800',
  anulada: 'bg-red-100 text-red-800',
  default: 'bg-gray-100 text-gray-800',
};

const ExchangeReservationCard: React.FC<ExchangeReservationCardProps> = ({
  startDate,
  endDate,
  points,
  status,
  ownerName,
  actions,
}) => {
  return (
    <div className="border rounded-lg p-5 shadow-sm bg-white w-full flex flex-col gap-2">
      <div className="flex justify-between items-start mb-3">
        <span className="font-semibold text-gray-800 truncate pr-2">
          {startDate} a {endDate}
        </span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.default} whitespace-nowrap`}>
          {status}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-1">{ownerName}</p>
      <p className="text-sm text-gray-600 mb-3">{points} puntos</p>
      {actions && (
        <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 pt-3 mt-3 w-full">
          {actions}
        </div>
      )}
    </div>
  );
};

export default ExchangeReservationCard; 