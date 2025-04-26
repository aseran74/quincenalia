import * as React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';

export default function NewPropertyPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Agregar Nueva Propiedad</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" placeholder="Ingrese el título de la propiedad" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input id="location" placeholder="Ingrese la ubicación" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <Input id="price" type="number" placeholder="Ingrese el precio" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="sold">Vendida</SelectItem>
                    <SelectItem value="rented">Rentada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedrooms">Habitaciones</Label>
                <Input id="bedrooms" type="number" placeholder="Número de habitaciones" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Baños</Label>
                <Input id="bathrooms" type="number" placeholder="Número de baños" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Área (m²)</Label>
                <Input id="area" type="number" placeholder="Área en metros cuadrados" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parkingSpaces">Estacionamientos</Label>
                <Input id="parkingSpaces" type="number" placeholder="Número de estacionamientos" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearBuilt">Año de construcción</Label>
                <Input id="yearBuilt" type="number" placeholder="Año de construcción" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyType">Tipo de propiedad</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">Casa</SelectItem>
                    <SelectItem value="apartment">Apartamento</SelectItem>
                    <SelectItem value="land">Terreno</SelectItem>
                    <SelectItem value="commercial">Comercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Ingrese una descripción detallada de la propiedad"
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Imagen</Label>
              <Input id="imageUrl" type="file" accept="image/*" />
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button">
                Cancelar
              </Button>
              <Button type="submit">
                Guardar Propiedad
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 