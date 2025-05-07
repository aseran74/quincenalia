import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LayoutGrid, MapPin, Home, Bed, Bath, Building, TreePalm, SquareArrowUp, Building2, Warehouse, UserCheck, Waves, Sparkles, ParkingCircle, Wind, SlidersHorizontal, ChevronDown, ChevronUp, Filter, X, Plus, Minus, Check, Search, Trash2, ArrowLeft, Info, ChevronLeft, ChevronRight, X as XIcon
} from 'lucide-react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { Property } from '@/types/property';

// --- Tipos y Constantes ---
type Filters = {
  minPrice: number | string;
  maxPrice: number | string;
  bedrooms: number | string;
  bathrooms: number | string;
  propertyTypes: string[];
  features: string[];
  location: string;
};

const initialFilters: Filters = {
  minPrice: 'any',
  maxPrice: 'any',
  bedrooms: 'any',
  bathrooms: 'any',
  propertyTypes: [],
  features: [],
  location: '',
};

const priceOptions = [
    { value: 50000, label: '50.000€' },
    { value: 100000, label: '100.000€' },
    { value: 150000, label: '150.000€' },
    { value: 200000, label: '200.000€' },
    { value: 300000, label: '300.000€' },
    { value: 500000, label: '500.000€' },
    { value: 750000, label: '750.000€' },
    { value: 1000000, label: '1.000.000€+' },
];

const roomOptions = [
    { value: 1, label: '1+' },
    { value: 2, label: '2+' },
    { value: 3, label: '3+' },
    { value: 4, label: '4+' },
    { value: 5, label: '5+' },
];

const propertyTypesWithIcons = [
  { value: 'Piso', label: 'Piso', icon: <Building className="w-4 h-4 text-muted-foreground" /> },
  { value: 'Ático', label: 'Ático', icon: <SquareArrowUp className="w-4 h-4 text-muted-foreground" /> },
  { value: 'Dúplex', label: 'Dúplex', icon: <Building2 className="w-4 h-4 text-muted-foreground" /> },
  { value: 'Casa independiente', label: 'Casa independiente', icon: <Home className="w-4 h-4 text-muted-foreground" /> },
  { value: 'Casa pareada', label: 'Casa pareada', icon: <Home className="w-4 h-4 text-muted-foreground" /> },
  { value: 'Casa adosada', label: 'Casa adosada', icon: <Home className="w-4 h-4 text-muted-foreground" /> },
  { value: 'Casa rústica', label: 'Casa rústica', icon: <TreePalm className="w-4 h-4 text-muted-foreground" /> },
];

const FEATURES_LIST = [
  { key: 'Piscina', label: 'Piscina', icon: <Waves className="w-4 h-4 text-blue-500" /> },
  { key: 'Jardín', label: 'Jardín', icon: <TreePalm className="w-4 h-4 text-green-600" /> },
  { key: 'Garaje', label: 'Garaje', icon: <ParkingCircle className="w-4 h-4 text-gray-700" /> },
  { key: 'Terraza', label: 'Terraza', icon: <SquareArrowUp className="w-4 h-4 text-yellow-500" /> },
  { key: 'Aire acondicionado', label: 'Aire Acond.', icon: <Wind className="w-4 h-4 text-cyan-500" /> },
  { key: 'Ascensor', label: 'Ascensor', icon: <ChevronUp className="w-4 h-4 text-purple-500" /> },
  { key: 'Trastero', label: 'Trastero', icon: <Warehouse className="w-4 h-4 text-orange-500" /> },
  { key: 'Vistas al mar', label: 'Vistas al mar', icon: <Waves className="w-4 h-4 text-blue-400" /> },
  { key: 'Vivienda accesible', label: 'Accesible', icon: <UserCheck className="w-4 h-4 text-pink-500" /> },
  { key: 'Vivienda de lujo', label: 'Lujo', icon: <Sparkles className="w-4 h-4 text-amber-600" /> },
];

const formatPriceSimple = (price: number) => {
  return price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

// Helper para obtener el precio de copropiedad más bajo
function getMinSharePrice(property: Property): number | null {
  const shares = [property.share1_price, property.share2_price, property.share3_price, property.share4_price].filter((p): p is number => typeof p === 'number');
  if (shares.length === 0) return null;
  return Math.min(...shares);
}

const calcularCuotaHipoteca = (precio: number) => {
  // Hipoteca a 25 años, 3% interés, 80% financiación
  const principal = precio * 0.8;
  const years = 25;
  const interest = 0.03;
  const n = years * 12;
  const monthlyRate = interest / 12;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
};

// Helper para obtener el icono del marcador solo si Google Maps está cargado
const getMarkerIcon = () => {
  if (window.google && window.google.maps) {
    return {
      url: '/map-marker-svgrepo-com.svg',
      scaledSize: new window.google.maps.Size(40, 40),
    };
  }
  return undefined;
};

export const PropertiesPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showTypeChecklist, setShowTypeChecklist] = useState(false);
  const typeChecklistRef = useRef<HTMLDivElement>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMapProperty, setSelectedMapProperty] = useState<Property | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('properties').select('*');
        if (error) throw error;
        setProperties(data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const applyFilters = (propertiesToFilter: Property[]): Property[] => {
    return propertiesToFilter.filter(property => {
      const minShare = getMinSharePrice(property);
      const minPriceFilter = filters.minPrice === 'any' ? -Infinity : Number(filters.minPrice);
      const maxPriceFilter = filters.maxPrice === 'any' ? Infinity : Number(filters.maxPrice);
      if (minShare === null || minShare < 0) return false;
      if (minShare < minPriceFilter || minShare > maxPriceFilter) return false;
      const matchesBedrooms = filters.bedrooms === 'any' || property.bedrooms >= Number(filters.bedrooms);
      const matchesBathrooms = filters.bathrooms === 'any' || property.bathrooms >= Number(filters.bathrooms);
      const matchesType = filters.propertyTypes.length === 0 || (property.type && filters.propertyTypes.includes(property.type));
      const matchesFeatures = filters.features.length === 0 || (property.features && filters.features.every(f => property.features!.includes(f)));
      const matchesLocation = !filters.location || (property.location && property.location.toLowerCase().includes(filters.location.toLowerCase()));
      return matchesBedrooms && matchesBathrooms && matchesType && matchesFeatures && matchesLocation;
    });
  };

  const filteredProperties = applyFilters(properties);

  const resetFilters = () => {
    setFilters(initialFilters);
    setShowAdvancedFilters(false);
    setShowTypeChecklist(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeChecklistRef.current && !typeChecklistRef.current.contains(event.target as Node)) {
        setShowTypeChecklist(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFilterCount = () => {
      let count = 0;
      if (filters.minPrice !== 'any') count++;
      if (filters.maxPrice !== 'any') count++;
      if (filters.bedrooms !== 'any') count++;
      if (filters.bathrooms !== 'any') count++;
      count += filters.propertyTypes.length;
      count += filters.features.length;
      return count;
  };
  const numActiveFilters = activeFilterCount();

  const PropertyCard = ({ property }: { property: Property }) => {
    const [imgIdx, setImgIdx] = useState(0);
    const totalImgs = property.images && property.images.length > 0 ? property.images.length : 0;
    useEffect(() => {
      if (totalImgs <= 1) return;
      const interval = setInterval(() => {
        setImgIdx(idx => (idx + 1) % totalImgs);
      }, 2500);
      return () => clearInterval(interval);
    }, [totalImgs]);
    const imageUrl = property.images && property.images.length > 0 ? property.images[imgIdx] : '/placeholder-property.jpg';
    const minShare = getMinSharePrice(property);
    const monthly = minShare ? calcularCuotaHipoteca(minShare) : null;
    return (
      <Link to={`/properties/${property.id}`} className="group block h-full">
        <Card className="overflow-hidden h-80 flex flex-col border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 bg-card p-0">
          <div className="relative w-full h-full flex-1">
            <img
              src={imageUrl}
              alt={`Imagen de ${property.title}`}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 z-0"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-property.jpg'; }}
            />
            <div className="absolute inset-0 z-10 flex flex-col justify-between">
              {/* Badge minShare y precio total */}
              <div className="flex justify-between items-start p-4">
                {minShare && (
                  <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full shadow z-20">
                    Desde {formatPriceSimple(minShare)}
                  </span>
                )}
                <span className="bg-white/80 text-xs text-muted-foreground px-2 py-1 rounded shadow z-20 ml-auto">
                  Precio total: {formatPriceSimple(property.price)}
                </span>
              </div>
              {/* Contenido principal sobre la imagen */}
              <div className="flex-1 flex flex-col justify-center items-start px-6 pb-6 pt-2 z-20">
                <div className="bg-gray-900/70 rounded-lg px-4 py-3 backdrop-blur-sm w-fit max-w-full">
                  <h3 className="text-lg font-bold mb-2 text-white drop-shadow truncate w-full" title={property.title}>
                    {property.title}
                  </h3>
                  <div className="flex items-center text-xs text-gray-200 space-x-3 mb-2">
                    <span className="flex items-center" title={`${property.bedrooms} habitaciones`}>
                      <Bed className="w-3.5 h-3.5 mr-1"/> {property.bedrooms}
                    </span>
                    <span className="flex items-center" title={`${property.bathrooms} baños`}>
                      <Bath className="w-3.5 h-3.5 mr-1"/> {property.bathrooms}
                    </span>
                    <span className="flex items-center" title={`${property.area} m²`}>
                      <SquareArrowUp className="w-3.5 h-3.5 mr-1"/> {property.area}m²
                    </span>
                  </div>
                  {property.location && (
                    <p className="text-xs text-gray-200 mb-1 flex items-center">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0"/>
                      <span className="truncate">{property.location}</span>
                    </p>
                  )}
                </div>
              </div>
              {/* Footer sobre la imagen */}
              {monthly && (
                <div className="px-6 pb-4 pt-2">
                  <span className="inline-block bg-primary/90 text-white font-semibold text-base px-4 py-2 rounded-lg shadow">
                    {formatPriceSimple(Math.round(monthly))} <span className="text-xs text-gray-200 font-normal">/mes*</span>
                  </span>
                </div>
              )}
              {/* Puntos del carrusel si hay varias imágenes */}
              {totalImgs > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                  {property.images.map((_, i) => (
                    <span key={i} className={`w-2 h-2 rounded-full ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`}></span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </Link>
    );
  };

  const FilterSection = () => (
    <Card className="mb-6 bg-card border shadow-sm rounded-lg">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* ¿Dónde buscas? */}
          <div>
            <label htmlFor="filterLocation" className="block text-xs font-medium text-muted-foreground mb-1">¿Dónde buscas?</label>
            <input
              id="filterLocation"
              type="text"
              value={filters.location}
              onChange={e => setFilters({ ...filters, location: e.target.value })}
              placeholder="Ciudad, zona, playa..."
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {/* Tipo de Vivienda */}
          <div className="relative w-full sm:w-auto sm:min-w-[200px]" ref={typeChecklistRef}>
            <label htmlFor="filterTypeButton" className="block text-xs font-medium text-muted-foreground mb-1">Tipo de Vivienda</label>
            <Button
                id="filterTypeButton"
                type="button"
                variant="outline"
                className="w-full justify-between text-sm h-9 font-normal"
                onClick={() => setShowTypeChecklist(v => !v)}
                aria-expanded={showTypeChecklist}
            >
                <span className="truncate pr-2">
                    {filters.propertyTypes.length === 0
                    ? 'Cualquiera'
                    : filters.propertyTypes.length === 1
                    ? propertyTypesWithIcons.find(t => t.value === filters.propertyTypes[0])?.label || 'Seleccionado'
                    : `${filters.propertyTypes.length} tipos seleccionados`
                    }
                </span>
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform flex-shrink-0 ${showTypeChecklist ? 'rotate-180' : ''}`} />
            </Button>
            {showTypeChecklist && (
                <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto bg-popover border border-border rounded-md shadow-lg p-2 space-y-1">
                {propertyTypesWithIcons
                    .map(type => (
                    <div key={type.value} className="flex items-center space-x-2 hover:bg-accent rounded p-1.5">
                         <Checkbox
                            id={`type-${type.value}`}
                            checked={filters.propertyTypes.includes(type.value)}
                            onCheckedChange={(checked) => {
                            setFilters(f => ({
                                ...f,
                                propertyTypes: checked
                                ? [...f.propertyTypes, type.value]
                                : f.propertyTypes.filter(v => v !== type.value)
                            }));
                            }}
                            className="h-4 w-4"
                         />
                         <label
                            htmlFor={`type-${type.value}`}
                            className="text-sm font-medium leading-none flex items-center gap-2 cursor-pointer w-full"
                         >
                            {type.icon}
                            {type.label}
                         </label>
                    </div>
                ))}
                </div>
            )}
          </div>
          {/* Precio Min */}
          <div>
             <label htmlFor="filterMinPrice" className="block text-xs font-medium text-muted-foreground mb-1">Precio Mín.</label>
             <Select
                value={String(filters.minPrice)}
                onValueChange={value => setFilters({ ...filters, minPrice: value === 'any' ? 'any' : Number(value) })}
             >
                <SelectTrigger id="filterMinPrice" className="text-sm h-9">
                    <SelectValue placeholder="Mínimo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="any" className="text-sm">Cualquiera</SelectItem>
                    {priceOptions.map(opt => (
                       (filters.maxPrice === 'any' || opt.value < Number(filters.maxPrice)) &&
                       <SelectItem key={`min-${opt.value}`} value={String(opt.value)} className="text-sm">{opt.label}</SelectItem>
                    ))}
                </SelectContent>
             </Select>
          </div>
          {/* Precio Max */}
          <div>
             <label htmlFor="filterMaxPrice" className="block text-xs font-medium text-muted-foreground mb-1">Precio Máx.</label>
             <Select
                value={String(filters.maxPrice)}
                onValueChange={value => setFilters({ ...filters, maxPrice: value === 'any' ? 'any' : Number(value) })}
             >
                <SelectTrigger id="filterMaxPrice" className="text-sm h-9">
                    <SelectValue placeholder="Máximo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="any" className="text-sm">Cualquiera</SelectItem>
                    {priceOptions.map(opt => (
                        (filters.minPrice === 'any' || opt.value > Number(filters.minPrice)) &&
                        <SelectItem key={`max-${opt.value}`} value={String(opt.value)} className="text-sm">{opt.label}</SelectItem>
                    ))}
                     {priceOptions[priceOptions.length - 1].value < Infinity && (
                           <SelectItem value={String(Infinity)} className="text-sm">1.000.000€+</SelectItem>
                     )}
                </SelectContent>
             </Select>
          </div>
          {/* Habitaciones */}
          <div>
             <label htmlFor="filterBedrooms" className="block text-xs font-medium text-muted-foreground mb-1">Habitaciones (mín.)</label>
             <Select
                value={String(filters.bedrooms)}
                onValueChange={value => setFilters({ ...filters, bedrooms: value === 'any' ? 'any' : Number(value) })}
             >
                <SelectTrigger id="filterBedrooms" className="text-sm h-9">
                    <SelectValue placeholder="Hab." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="any" className="text-sm">Cualquiera</SelectItem>
                    {roomOptions.map(opt => (
                        <SelectItem key={`bed-${opt.value}`} value={String(opt.value)} className="text-sm">{opt.label}</SelectItem>
                    ))}
                </SelectContent>
             </Select>
          </div>
          {/* Baños */}
          <div>
             <label htmlFor="filterBathrooms" className="block text-xs font-medium text-muted-foreground mb-1">Baños (mín.)</label>
             <Select
                value={String(filters.bathrooms)}
                onValueChange={value => setFilters({ ...filters, bathrooms: value === 'any' ? 'any' : Number(value) })}
             >
                <SelectTrigger id="filterBathrooms" className="text-sm h-9">
                    <SelectValue placeholder="Baños" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="any" className="text-sm">Cualquiera</SelectItem>
                    {roomOptions.map(opt => (
                        <SelectItem key={`bath-${opt.value}`} value={String(opt.value)} className="text-sm">{opt.label}</SelectItem>
                    ))}
                </SelectContent>
             </Select>
          </div>
        </div>
        {/* Fila para Tipo y Botón Avanzados */}
        <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
           {/* Botón Avanzados y Reset */}
           <div className="flex flex-col sm:flex-row gap-2 items-center pt-2 sm:pt-0">
               <Button
                  variant="ghost"
                  className="text-[16px] px-3 h-10 flex items-center text-primary hover:bg-transparent gap-2 font-semibold"
                  onClick={() => setShowAdvancedFilters(v => !v)}
                >
                  <SlidersHorizontal className="w-5 h-5 mr-1" />
                  {showAdvancedFilters ? 'Menos filtros' : 'Más filtros'}
                  {showAdvancedFilters ? <ChevronUp className="w-5 h-5 ml-1" /> : <ChevronDown className="w-5 h-5 ml-1" />}
                </Button>
                {numActiveFilters > 0 && (
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs text-muted-foreground h-9">
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Limpiar ({numActiveFilters})
                    </Button>
                )}
           </div>
        </div>
        {/* Características Adicionales (condicional) */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-border animate-fade-in">
            <label className="block text-sm font-medium text-foreground mb-3">Características</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2">
              {FEATURES_LIST.map(feature => (
                <div key={feature.key} className="flex items-center space-x-2">
                   <Checkbox
                      id={`feature-${feature.key}`}
                      checked={filters.features.includes(feature.key)}
                      onCheckedChange={(checked) => {
                         setFilters(prevFilters => ({
                            ...prevFilters,
                            features: checked
                            ? [...prevFilters.features, feature.key]
                            : prevFilters.features.filter(f => f !== feature.key),
                         }));
                      }}
                      className="h-4 w-4"
                   />
                   <label
                      htmlFor={`feature-${feature.key}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1.5"
                   >
                      <span className="flex-shrink-0">{feature.icon}</span>
                      {feature.label}
                   </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Carrusel automático
  useEffect(() => {
    if (!selectedMapProperty || !selectedMapProperty.images || selectedMapProperty.images.length <= 1) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % selectedMapProperty.images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedMapProperty]);

  // Reset índice al cambiar de propiedad
  useEffect(() => {
    setCarouselIndex(0);
  }, [selectedMapProperty]);

 if (loading) {
    return (
      <div className="container mx-auto p-4 animate-pulse">
         <div className="flex justify-between items-center mb-6"> <div className="h-8 bg-gray-200 rounded w-1/4"></div> <div className="h-10 bg-gray-200 rounded w-32"></div> </div> <div className="h-40 bg-gray-200 rounded mb-6"></div>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {[...Array(6)].map((_, i) => ( <Card key={i} className="overflow-hidden"> <div className="w-full h-48 bg-gray-300" /> <CardContent className="p-4 space-y-2"> <div className="h-5 bg-gray-300 rounded w-3/4" /> <div className="h-4 bg-gray-300 rounded w-1/2" /> <div className="h-6 bg-gray-300 rounded w-1/3 mt-2" /> </CardContent> </Card> ))} </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button asChild variant="secondary" className="flex items-center gap-2">
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
              Volver a inicio
            </Link>
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Propiedades</h1>
          <Tabs defaultValue={view} onValueChange={(v) => setView(v as 'grid' | 'map')} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-2 sm:w-auto">
              <TabsTrigger value="grid"> <LayoutGrid className="h-4 w-4 mr-2" /> Lista </TabsTrigger>
              <TabsTrigger value="map"> <MapPin className="h-4 w-4 mr-2" /> Mapa </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="block sm:hidden mb-4">
          <Button
            className="w-full flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            aria-controls="filtros-busqueda"
          >
            <Filter className="w-5 h-5" />
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            {numActiveFilters > 0 && (
              <span className="ml-2 bg-white text-primary rounded-full px-2 py-0.5 text-xs">{numActiveFilters}</span>
            )}
          </Button>
        </div>
        <div id="filtros-busqueda" className={`transition-all duration-300 ${showFilters ? 'max-h-[2000px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'} overflow-hidden sm:max-h-none sm:opacity-100 sm:mb-6`}>
          <FilterSection />
        </div>
        <div className="mb-6 text-sm text-muted-foreground">
          {filteredProperties.length} {filteredProperties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
          {numActiveFilters > 0 && <span className='ml-1'>(con {numActiveFilters} {numActiveFilters === 1 ? 'filtro aplicado' : 'filtros aplicados'})</span>}
        </div>
        {view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-12 text-muted-foreground bg-card border rounded-lg">
                  <Search className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                  <p className="font-semibold">No hay propiedades que coincidan</p>
                  <p className="text-sm mt-1">Prueba a modificar o limpiar los filtros.</p>
                  {numActiveFilters > 0 && <Button variant="link" size="sm" onClick={resetFilters} className="mt-2 text-primary">Limpiar filtros</Button>}
              </div>
            )}
          </div>
        ) : (
          <div className="h-[65vh] w-full rounded-lg overflow-hidden border shadow-sm relative">
            <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''} onLoad={() => setMapsLoaded(true)}>
              <GoogleMap
                mapContainerClassName="w-full h-full"
                center={{ lat: 40.4637, lng: -3.7492 }}
                zoom={5}
                options={{}}
                onClick={() => setSelectedMapProperty(null)}
              >
                {mapsLoaded && filteredProperties
                  .filter(p => p.latitude && p.longitude)
                  .map((property) => (
                    <Marker
                      key={property.id}
                      position={{ lat: Number(property.latitude), lng: Number(property.longitude) }}
                      title={property.title}
                      onClick={() => setSelectedMapProperty(property)}
                      icon={getMarkerIcon()}
                    />
                  ))}
                {selectedMapProperty && selectedMapProperty.latitude && selectedMapProperty.longitude && (
                  <InfoWindow
                    position={{ lat: Number(selectedMapProperty.latitude), lng: Number(selectedMapProperty.longitude) }}
                    onCloseClick={() => setSelectedMapProperty(null)}
                    options={{ pixelOffset: new window.google.maps.Size(0, -15) }}
                  >
                    <div className="relative min-w-[230px] max-w-[270px] h-[200px] bg-card rounded-lg shadow-xl overflow-hidden font-poppins">
                      <a
                        href={`${window.location.origin}/propiedades/${selectedMapProperty.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full h-full"
                        aria-label={`Ver detalles de ${selectedMapProperty.title}`}
                      >
                        {selectedMapProperty.images && selectedMapProperty.images.length > 0 ? (
                          <img
                            src={selectedMapProperty.images[carouselIndex]}
                            alt={`Imagen de ${selectedMapProperty.title}`}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-property.jpg'; }}
                          />
                        ) : (
                          <img
                            src="/placeholder-property.jpg"
                            alt="Propiedad sin imagen"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </a>
                      {/* Botones del carrusel, superpuestos si hay múltiples imágenes */}
                      {selectedMapProperty.images && selectedMapProperty.images.length > 1 && (
                        <>
                          <button
                            type="button"
                            aria-label="Imagen anterior"
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 shadow-md z-20 transition-colors"
                            onClick={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCarouselIndex((prevIndex) => (prevIndex - 1 + selectedMapProperty.images!.length) % selectedMapProperty.images!.length);
                            }}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="Siguiente imagen"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 shadow-md z-20 transition-colors"
                            onClick={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCarouselIndex((prevIndex) => (prevIndex + 1) % selectedMapProperty.images!.length);
                            }}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {/* Información de la propiedad, superpuesta en la parte inferior de la card */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/60 to-transparent text-white z-10">
                        <a
                          href={`${window.location.origin}/propiedades/${selectedMapProperty.id}`}
                          className="font-semibold text-sm block hover:underline truncate"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => { e.stopPropagation(); }}
                        >
                          {selectedMapProperty.title}
                        </a>
                        <div className="text-base font-bold mt-0.5">
                          {getMinSharePrice(selectedMapProperty) ? formatPriceSimple(getMinSharePrice(selectedMapProperty)!) : 'N/A'}
                          <span className="text-xs font-normal opacity-90 ml-1">/copropiedad</span>
                        </div>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>
          </div>
        )}
      </div>
    </>
  );
};

export default PropertiesPage; 