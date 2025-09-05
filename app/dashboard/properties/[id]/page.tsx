import * as React from 'react';
import { notFound } from 'next/navigation';
import { PropertyDetails } from '../../../components/properties/PropertyDetails';

// Datos de ejemplo - Reemplazar con datos reales de tu base de datos
const mockProperty = {
  id: '1',
  title: 'Casa Moderna en el Centro',
  description: 'Hermosa casa moderna con acabados de lujo y excelente ubicación en el centro de la ciudad. Esta propiedad cuenta con espacios amplios, iluminación natural y una distribución perfecta para familias.',
  price: 250000,
  location: 'Centro Histórico',
  bedrooms: 3,
  bathrooms: 2,
  area: 150,
  imageUrl: '/images/house-1.jpg',
  status: 'available' as const,
  features: [
    'Jardín privado',
    'Cocina integral',
    'Sala de estar',
    'Comedor',
    'Terraza',
    'Estacionamiento techado',
  ],
  yearBuilt: 2020,
  parkingSpaces: 2,
  propertyType: 'Casa',
};

interface PropertyPageProps {
  params: {
    id: string;
  };
}

export default function PropertyPage({ params }: PropertyPageProps) {
  // Aquí deberías buscar la propiedad en tu base de datos usando el ID
  const property = mockProperty;

  if (!property) {
    notFound();
  }

  const handleEdit = () => {
    // Implementar lógica de edición
    console.log('Editar propiedad:', property.id);
  };

  const handleDelete = () => {
    // Implementar lógica de eliminación
    console.log('Eliminar propiedad:', property.id);
  };

  return (
    <div className="container mx-auto py-8">
      <PropertyDetails
        {...property}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
} 