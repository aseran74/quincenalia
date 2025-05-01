import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface PropertyFiltersProps {
  onFiltersChange: (filters: any) => void;
}

const PropertyFilters = ({ onFiltersChange }: PropertyFiltersProps) => {
  const [filters, setFilters] = useState({
    bedrooms: '',
    minSize: 0,
    priceRange: [0, 1000000],
    features: {
      pool: false,
      garden: false,
      garage: false,
      terrace: false,
      airConditioning: false,
      heating: false,
      elevator: false,
      security: false,
    }
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Filtros de búsqueda</h3>
        
        {/* Habitaciones */}
        <div className="space-y-4">
          <label className="block text-sm font-medium">
            Número de habitaciones
          </label>
          <Select
            value={filters.bedrooms}
            onValueChange={(value) => handleFilterChange('bedrooms', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar habitaciones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 o más</SelectItem>
              <SelectItem value="2">2 o más</SelectItem>
              <SelectItem value="3">3 o más</SelectItem>
              <SelectItem value="4">4 o más</SelectItem>
              <SelectItem value="5">5 o más</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tamaño mínimo */}
        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">
            Tamaño mínimo (m²)
          </label>
          <Input
            type="number"
            placeholder="Tamaño mínimo"
            value={filters.minSize}
            onChange={(e) => handleFilterChange('minSize', e.target.value)}
            className="w-full"
          />
        </div>

        {/* Rango de precio */}
        <div className="mt-6">
          <label className="block text-sm font-medium mb-4">
            Rango de precio: {filters.priceRange[0]}€ - {filters.priceRange[1]}€
          </label>
          <Slider
            defaultValue={[0, 1000000]}
            max={1000000}
            step={1000}
            value={filters.priceRange}
            onValueChange={(value) => handleFilterChange('priceRange', value)}
            className="mt-2"
          />
        </div>

        {/* Características */}
        <div className="mt-6">
          <label className="block text-sm font-medium mb-4">
            Características
          </label>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(filters.features).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => 
                    handleFilterChange('features', {
                      ...filters.features,
                      [key]: checked
                    })
                  }
                />
                <label htmlFor={key} className="text-sm">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="mt-6 flex space-x-4">
          <Button 
            variant="outline" 
            onClick={() => {
              const resetFilters = {
                bedrooms: '',
                minSize: 0,
                priceRange: [0, 1000000],
                features: Object.fromEntries(
                  Object.keys(filters.features).map(key => [key, false])
                )
              };
              setFilters(resetFilters);
              onFiltersChange(resetFilters);
            }}
          >
            Limpiar filtros
          </Button>
          <Button>Aplicar filtros</Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyFilters; 