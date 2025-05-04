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
      elevator: false,
      storage: false,
      seaView: false,
      accessible: false,
      luxury: false,
    }
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6 text-[16px]">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-[16px]">Filtros de búsqueda</h3>
        
        {/* Habitaciones */}
        <div className="space-y-4">
          <label className="block font-medium text-[16px]">
            Número de habitaciones
          </label>
          <Select
            value={filters.bedrooms}
            onValueChange={(value) => handleFilterChange('bedrooms', value)}
          >
            <SelectTrigger className="text-[16px] min-h-[40px]">
              <SelectValue placeholder="Seleccionar habitaciones" className="text-[16px]" />
            </SelectTrigger>
            <SelectContent className="text-[16px]">
              <SelectItem value="1" className="text-[16px]">1 o más</SelectItem>
              <SelectItem value="2" className="text-[16px]">2 o más</SelectItem>
              <SelectItem value="3" className="text-[16px]">3 o más</SelectItem>
              <SelectItem value="4" className="text-[16px]">4 o más</SelectItem>
              <SelectItem value="5" className="text-[16px]">5 o más</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tamaño mínimo */}
        <div className="mt-6">
          <label className="block font-medium mb-2 text-[16px]">
            Tamaño mínimo (m²)
          </label>
          <Input
            type="number"
            placeholder="Tamaño mínimo"
            value={filters.minSize}
            onChange={(e) => handleFilterChange('minSize', e.target.value)}
            className="w-full text-[16px] min-h-[40px]"
          />
        </div>

        {/* Rango de precio */}
        <div className="mt-6">
          <label className="block font-medium mb-4 text-[16px]">
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
          <label className="block font-medium mb-4 text-base">
            Características
          </label>
          <div className="grid grid-cols-1 gap-5">
            {[
              { key: 'pool', label: 'Piscina' },
              { key: 'garden', label: 'Jardín' },
              { key: 'garage', label: 'Garaje' },
              { key: 'terrace', label: 'Terraza' },
              { key: 'airConditioning', label: 'Aire Acond.' },
              { key: 'elevator', label: 'Ascensor' },
              { key: 'storage', label: 'Trastero' },
              { key: 'seaView', label: 'Vistas al mar' },
              { key: 'accessible', label: 'Accesible' },
              { key: 'luxury', label: 'Lujo' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-4 py-2 text-base">
                <Checkbox
                  id={key}
                  checked={filters.features[key]}
                  onCheckedChange={(checked) => 
                    handleFilterChange('features', {
                      ...filters.features,
                      [key]: checked
                    })
                  }
                  className="w-4 h-4 min-w-[16px] min-h-[16px]"
                  style={{ width: 16, height: 16 }}
                />
                <label htmlFor={key} className="text-base select-none cursor-pointer">
                  {label}
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
              const resetFeatures: typeof filters.features = {
                pool: false,
                garden: false,
                garage: false,
                terrace: false,
                airConditioning: false,
                elevator: false,
                storage: false,
                seaView: false,
                accessible: false,
                luxury: false,
              };
              const resetFilters = {
                bedrooms: '',
                minSize: 0,
                priceRange: [0, 1000000],
                features: resetFeatures
              };
              setFilters(resetFilters);
              onFiltersChange(resetFilters);
            }}
            className="text-[16px] min-h-[40px]"
          >
            Limpiar filtros
          </Button>
          <Button className="text-[16px] min-h-[40px]">Aplicar filtros</Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyFilters; 