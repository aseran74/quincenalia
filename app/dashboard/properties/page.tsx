import * as React from 'react';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { PropertiesList } from '../../components/properties/PropertiesList';

// Datos de ejemplo - Reemplazar con datos reales de tu base de datos
const mockProperties = [
  {
    id: '1',
    title: 'Casa Moderna en el Centro',
    description: 'Hermosa casa moderna con acabados de lujo y excelente ubicación en el centro de la ciudad.',
    price: 250000,
    location: 'Centro Histórico',
    bedrooms: 3,
    bathrooms: 2,
    area: 150,
    imageUrl: '/images/house-1.jpg',
    status: 'available' as const,
  },
  {
    id: '2',
    title: 'Apartamento con Vista al Mar',
    description: 'Espectacular apartamento con vista al mar, totalmente amueblado y listo para habitar.',
    price: 180000,
    location: 'Zona Costera',
    bedrooms: 2,
    bathrooms: 2,
    area: 90,
    imageUrl: '/images/apartment-1.jpg',
    status: 'sold' as const,
  },
];

export default function PropertiesPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Propiedades</h1>
        <Link href="/dashboard/properties/new">
          <Button>
            Agregar Propiedad
          </Button>
        </Link>
      </div>
      <PropertiesList properties={mockProperties} />
    </div>
  );
} 