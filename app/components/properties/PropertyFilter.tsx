import React from 'react';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { NearbyService } from '../../../lib/supabase';

interface PropertyFilterProps {
  onFilterChange: (filters: PropertyFilters) => void;
}

export interface PropertyFilters {
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  features?: string[];
  nearby_services?: NearbyService[];
  isSharedProperty?: boolean;
}

const NEARBY_SERVICES: { value: NearbyService; label: string }[] = [
  { value: 'playa_cercana', label: 'Playa cercana' },
  { value: 'supermercados', label: 'Supermercados' },
  { value: 'vida_nocturna', label: 'Vida nocturna' },
  { value: 'parques_naturales', label: 'Parques naturales' },
  { value: 'deportes_nauticos', label: 'Deportes náuticos' },
  { value: 'puerto_deportivo', label: 'Puerto deportivo' },
  { value: 'farmacias', label: 'Farmacias' }
];

export const PropertyFilter: React.FC<PropertyFilterProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = React.useState<PropertyFilters>({});
  const [selectedServices, setSelectedServices] = React.useState<NearbyService[]>([]);

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleServiceToggle = (service: NearbyService) => {
    const newServices = selectedServices.includes(service)
      ? selectedServices.filter(s => s !== service)
      : [...selectedServices, service];
    
    setSelectedServices(newServices);
    handleFilterChange('nearby_services', newServices);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h3 className="text-lg font-semibold mb-4">Filtros de Búsqueda</h3>
      
      {/* Ubicación */}
      <div className="space-y-2">
        <Label>Ubicación</Label>
        <Input 
          type="text" 
          placeholder="Ingresa una ubicación"
          onChange={(e) => handleFilterChange('location', e.target.value)}
        />
      </div>

      {/* Precio */}
      <div className="space-y-2">
        <Label>Rango de Precio</Label>
        <div className="flex gap-4">
          <Input 
            type="number" 
            placeholder="Mínimo"
            onChange={(e) => handleFilterChange('minPrice', Number(e.target.value))}
          />
          <Input 
            type="number" 
            placeholder="Máximo"
            onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
          />
        </div>
      </div>

      {/* Habitaciones y Baños */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Habitaciones</Label>
          <Select onValueChange={(value) => handleFilterChange('bedrooms', Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Cualquiera" />
            </SelectTrigger>
            <SelectContent>
              {[1,2,3,4,5].map(num => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'habitación' : 'habitaciones'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Baños</Label>
          <Select onValueChange={(value) => handleFilterChange('bathrooms', Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Cualquiera" />
            </SelectTrigger>
            <SelectContent>
              {[1,2,3,4].map(num => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'baño' : 'baños'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metros cuadrados */}
      <div className="space-y-2">
        <Label>Metros Cuadrados</Label>
        <div className="flex gap-4">
          <Input 
            type="number" 
            placeholder="Mín m²"
            onChange={(e) => handleFilterChange('minArea', Number(e.target.value))}
          />
          <Input 
            type="number" 
            placeholder="Máx m²"
            onChange={(e) => handleFilterChange('maxArea', Number(e.target.value))}
          />
        </div>
      </div>

      {/* Servicios Cercanos */}
      <div className="space-y-2">
        <Label>Servicios Cercanos</Label>
        <div className="grid grid-cols-2 gap-2">
          {NEARBY_SERVICES.map(service => (
            <label key={service.value} className="flex items-center space-x-2">
              <Checkbox
                checked={selectedServices.includes(service.value)}
                onCheckedChange={() => handleServiceToggle(service.value)}
              />
              <span className="text-sm">{service.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Copropiedad */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Checkbox
            checked={filters.isSharedProperty}
            onCheckedChange={(checked) => handleFilterChange('isSharedProperty', checked)}
          />
          <span>Mostrar solo copropiedades</span>
        </Label>
      </div>
    </div>
  );
}; 