import * as React from 'react';
import Image from 'next/image';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Separator } from '../../../components/ui/separator';

interface PropertyDetailsProps {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  imageUrl: string;
  status: 'available' | 'sold' | 'rented';
  features: string[];
  yearBuilt: number;
  parkingSpaces: number;
  propertyType: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PropertyDetails({
  title,
  description,
  price,
  location,
  bedrooms,
  bathrooms,
  area,
  imageUrl,
  status,
  features,
  yearBuilt,
  parkingSpaces,
  propertyType,
  onEdit,
  onDelete,
}: PropertyDetailsProps) {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="relative h-[400px] w-full mb-6 rounded-lg overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
        />
        <Badge 
          className="absolute top-4 right-4 text-lg px-4 py-2"
          variant={status === 'available' ? 'default' : status === 'sold' ? 'destructive' : 'secondary'}
        >
          {status.toUpperCase()}
        </Badge>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-xl text-gray-600">{location}</p>
        </div>
        <div className="text-3xl font-bold text-primary">
          ${price.toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles principales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛏️</span>
                <div>
                  <p className="font-semibold">{bedrooms}</p>
                  <p className="text-sm text-gray-600">Habitaciones</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚿</span>
                <div>
                  <p className="font-semibold">{bathrooms}</p>
                  <p className="text-sm text-gray-600">Baños</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📏</span>
                <div>
                  <p className="font-semibold">{area}m²</p>
                  <p className="text-sm text-gray-600">Área</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚗</span>
                <div>
                  <p className="font-semibold">{parkingSpaces}</p>
                  <p className="text-sm text-gray-600">Estacionamientos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información adicional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Tipo de propiedad:</span> {propertyType}
              </div>
              <div>
                <span className="font-semibold">Año de construcción:</span> {yearBuilt}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Descripción</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{description}</p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Características</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <span>✓</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-4 justify-end">
        <Button
          variant="outline"
          onClick={onEdit}
        >
          Editar propiedad
        </Button>
        <Button
          variant="destructive"
          onClick={onDelete}
        >
          Eliminar propiedad
        </Button>
      </div>
    </div>
  );
} 