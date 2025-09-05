import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Home, Car, Sun, Wind, ArrowUpDown, Warehouse, Eye, Star, Waves } from 'lucide-react';

interface PropertyFiltersProps {
  onFiltersChange: (filters: any) => void;
}

const FEATURES_LIST = [
  { key: 'pool', label: 'Piscina', icon: <Home className="w-4 h-4" /> },
  { key: 'garden', label: 'Jardín', icon: <Home className="w-4 h-4" /> },
  { key: 'garage', label: 'Garaje', icon: <Car className="w-4 h-4" /> },
  { key: 'terrace', label: 'Terraza', icon: <Sun className="w-4 h-4" /> },
  { key: 'airConditioning', label: 'Aire Acond.', icon: <Wind className="w-4 h-4" /> },
  { key: 'elevator', label: 'Ascensor', icon: <ArrowUpDown className="w-4 h-4" /> },
  { key: 'storage', label: 'Trastero', icon: <Warehouse className="w-4 h-4" /> },
  { key: 'seaView', label: 'Vistas al mar', icon: <Waves className="w-4 h-4" /> },
  { key: 'accessible', label: 'Accesible', icon: <Eye className="w-4 h-4" /> },
  { key: 'luxury', label: 'Lujo', icon: <Star className="w-4 h-4" /> },
];

const PropertyFilters = ({ onFiltersChange }: PropertyFiltersProps) => {
  const [filters, setFilters] = useState({
    bedrooms: '',
    minSize: 0,
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
    },
    showFeatures: false,
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6 text-[16px] w-full max-w-xl mx-auto">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-[16px]">Filtros de búsqueda</h3>
        {/* Habitaciones */}
        <div className="mb-4">
          <label className="block font-medium text-[16px] mb-1">
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
        <div className="mb-4">
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
        {/* Características (colapsable) */}
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={filters.showFeatures}
              onCheckedChange={(checked) => handleFilterChange('showFeatures', checked)}
              className="mr-2"
            />
            Ver características
          </label>
          {filters.showFeatures && (
            <div className="mt-4 space-y-2">
              {FEATURES_LIST.map(({ key, label, icon }) => (
                <div key={key} className="flex items-center space-x-3 py-1">
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
                  />
                  <label htmlFor={key} className="text-base select-none cursor-pointer flex items-center gap-2">
                    {icon} {label}
                  </label>
                </div>
              ))}
            </div>
          )}
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
                features: resetFeatures,
                showFeatures: false,
              };
              setFilters(resetFilters);
              onFiltersChange(resetFilters);
            }}
            className="text-[16px] min-h-[40px]"
          >
            Limpiar filtros
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyFilters; 