import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LayoutGrid, MapPin, Home, Bed, Bath, Building, TreePalm, SquareArrowUp, Building2, Warehouse, UserCheck, Waves, Sparkles, ParkingCircle, Wind, SlidersHorizontal, ChevronDown, ChevronUp, Filter, X, Plus, Minus, Check, Search, Trash2, ArrowLeft, Info, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, X as XIcon
} from 'lucide-react';
import { GoogleMap, LoadScript, Marker, InfoWindow, useLoadScript, Autocomplete } from '@react-google-maps/api';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { Property } from '@/types/property';
import { Input as ShadInput } from '@/components/ui/input'; // Renombrado para evitar conflicto
import type { Libraries } from '@react-google-maps/api';
import PropertyMapCard from '@/components/PropertyMapCard';

// --- Tipos y Constantes ---
type Filters = {
  minPrice: number | string;
  maxPrice: number | string;
  bedrooms: number | string;
  bathrooms: number | string;
  propertyTypes: string[];
  features: string[];
  location: string;
  zona: string;
  quincena: string; // '1', '2', '3', '4' o ''
  obraNueva: boolean;
};

const initialFilters: Filters = {
  minPrice: 'any',
  maxPrice: 'any',
  bedrooms: 'any',
  bathrooms: 'any',
  propertyTypes: [],
  features: [],
  location: '',
  zona: '',
  quincena: '',
  obraNueva: false,
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

const TIPO_VIVIENDA_OPTIONS = [
  'Piso o apartamento.',
  'Atico.',
  'Bajo con jardin.',
  'Chalet adosado.',
  'Chalet individual.',
  'Casa rural'
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
  { key: 'Obra nueva', label: 'Obra nueva', icon: <Building2 className="w-4 h-4 text-orange-400" /> },
];

const formatPriceSimple = (price: number) => {
  return price.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

function getMinSharePrice(property: Property): number | null {
  const shares = [property.share1_price, property.share2_price, property.share3_price, property.share4_price].filter((p): p is number => typeof p === 'number' && p > 0);
  if (shares.length > 0) return Math.min(...shares);
  if (property.price && typeof property.price === 'number' && property.price > 0) {
    return property.price / 4;
  }
  return null;
}

const calcularCuotaHipoteca = (precio: number) => {
  // Añadir 7% de gastos de compra
  const precioConGastos = precio * 1.07;
  const principal = precioConGastos * 0.8;
  const years = 25;
  const interest = 0.03;
  const n = years * 12;
  const monthlyRate = interest / 12;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
};

const getMarkerIcon = () => {
  if (typeof window !== 'undefined' && window.google && window.google.maps) {
    return {
      url: '/map-marker-svgrepo-com.svg',
      scaledSize: new window.google.maps.Size(40, 40),
    };
  }
  return undefined;
};

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const AUTOCOMPLETE_LIBRARIES: Libraries = ['places'];

const ZONAS_OPTIONS = [ 
  'Costa de levante.',
  'Canarias.',
  'Baleares.',
  'Marruecos',
  'República Dominicana'
];

function normalizaZonaFiltro(z?: string | null): string {
  return (z || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\./g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

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
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const locationInputRef = useRef<HTMLInputElement | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFiltersModal, setShowMobileFiltersModal] = useState(false);
  const [showMobileResultsModal, setShowMobileResultsModal] = useState(false);

  const { isLoaded: isAutocompleteLoaded, loadError: autocompleteLoadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: AUTOCOMPLETE_LIBRARIES,
  });

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('properties').select('*');
        if (error) console.error('Error al obtener propiedades:', error);
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

  useEffect(() => {
    const zonaParam = searchParams.get('zona');
    if (zonaParam) {
      setFilters(prev => ({ ...prev, zona: zonaParam }));
    }
  }, [searchParams]);

  const applyFilters = (propertiesToFilter: Property[]): Property[] => {
    return propertiesToFilter.filter(property => {
      const minShare = getMinSharePrice(property);
      const minPriceFilter = filters.minPrice === 'any' ? -Infinity : Number(filters.minPrice);
      const maxPriceFilter = filters.maxPrice === 'any' ? Infinity : Number(filters.maxPrice);

      if ((filters.minPrice !== 'any' || filters.maxPrice !== 'any')) {
        if (minShare === null || minShare < 0) return false; 
        if (minShare < minPriceFilter || minShare > maxPriceFilter) return false;
      }
      
      const matchesBedrooms = filters.bedrooms === 'any' || (property.bedrooms != null && property.bedrooms >= Number(filters.bedrooms));
      const matchesBathrooms = filters.bathrooms === 'any' || (property.bathrooms != null && property.bathrooms >= Number(filters.bathrooms));
      const matchesType = filters.propertyTypes.length === 0 || (property.tipo_vivienda && filters.propertyTypes.includes(property.tipo_vivienda));
      const matchesFeatures = filters.features.length === 0 || (property.features && filters.features.every(f => property.features!.includes(f)));
      const matchesLocation = !filters.location || (property.location && property.location.toLowerCase().includes(filters.location.toLowerCase()));
      
      const normalizedPropertyZona = normalizaZonaFiltro(property.zona);
      const normalizedFilterZona = normalizaZonaFiltro(filters.zona);
      const matchesZona = !filters.zona || (normalizedPropertyZona && normalizedPropertyZona === normalizedFilterZona);
      
      // --- FILTRO DE QUINCENA ---
      let matchesQuincena = true;
      if (filters.quincena) {
        const shareStatus = property[`share${filters.quincena}_status` as 'share1_status' | 'share2_status' | 'share3_status' | 'share4_status'];
        matchesQuincena = shareStatus === 'disponible';
      }
      
      // --- FILTRO OBRA NUEVA ---
      let matchesObraNueva = true;
      if (filters.obraNueva) {
        matchesObraNueva = property.features && property.features.includes('Obra nueva');
      }
      
      // --- FILTRO: Excluir propiedades "vendida" ---
      const isSold = property.status === 'vendida';

      return matchesBedrooms && matchesBathrooms && matchesType && matchesFeatures && matchesLocation && matchesZona && matchesQuincena && matchesObraNueva && !isSold;
    });
  };

  const filteredProperties = applyFilters(properties);

  const resetFilters = () => {
    setFilters(initialFilters);
    setShowAdvancedFilters(false);
    setShowTypeChecklist(false);
    if (locationInputRef.current) locationInputRef.current.value = ''; 
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
      if (filters.location) count++;
      if (filters.zona) count++;
      count += filters.propertyTypes.length;
      count += filters.features.length;
      return count;
  };
  const numActiveFilters = activeFilterCount();

  const zonasUnicas = Array.from(new Set(properties.map(p => (p.zona || '').trim()))).filter(z => z).sort();


  const PropertyCard = ({ property }: { property: Property }) => {
    const [imgIdx, setImgIdx] = useState(0);
    const totalImgs = property.images && property.images.length > 0 ? property.images.length : 0;
    let imageUrl = property.images && property.images.length > 0 ? property.images[imgIdx] : '/placeholder-property.jpg';
    // Si la zona es Marruecos y no hay imágenes, usar marruecos.jpeg
    if ((!property.images || property.images.length === 0) && (property.zona?.toLowerCase().includes('marruecos') || property.zona?.toLowerCase().includes('marrueco'))) {
      imageUrl = '/marruecos.jpeg';
    }
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
              <div className="flex justify-between items-start p-4">
                {minShare && (
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow z-20">
                    Desde {formatPriceSimple(minShare)}
                  </span>
                )}
                <span className="bg-background/80 text-xs text-muted-foreground px-2 py-1 rounded shadow z-20 ml-auto">
                  Total: {formatPriceSimple(property.price)}
                </span>
              </div>
              {monthly && (
                <div className="px-6 pb-4 pt-2 flex flex-col items-center">
                  <span className="inline-block bg-primary/90 text-primary-foreground font-semibold text-base px-4 py-2 rounded-lg shadow">
                    {formatPriceSimple(Math.round(monthly || 0))} <span className="text-xs text-gray-200 font-normal">/mes*</span>
                  </span>
                  <span className="text-[10px] text-gray-300 mt-1 text-center">
                    * Incluye un 7% extra en gastos de compra (notaría, registro, gestoría, impuestos)
                  </span>
                </div>
              )}
              {totalImgs > 1 && (
                <>
                  <button
                    type="button" aria-label="Anterior"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1 shadow transition-colors z-20"
                    onClick={e => { e.preventDefault(); e.stopPropagation(); setImgIdx(idx => (idx - 1 + totalImgs) % totalImgs); }}
                  > <ChevronLeftIcon className="w-4 h-4" /> </button>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 z-20">
                    {Array.from({length: totalImgs}).map((_, i) => (
                      <button
                        key={i} type="button" aria-label={`Imagen ${i + 1}`}
                        className={`w-2.5 h-2.5 rounded-full border border-white mx-0.5 ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`}
                        onClick={e => { e.preventDefault(); e.stopPropagation(); setImgIdx(i); }}
                      />
                    ))}
                  </div>
                  <button
                    type="button" aria-label="Siguiente"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1 shadow transition-colors z-20"
                    onClick={e => { e.preventDefault(); e.stopPropagation(); setImgIdx(idx => (idx + 1) % totalImgs); }}
                  > <ChevronRightIcon className="w-4 h-4" /> </button>
                </>
              )}
            </div>
          </div>
          <CardFooter className="bg-card/90 backdrop-blur-sm px-4 py-3 border-t flex flex-col gap-1 items-center text-center">
            <h3 className="text-base font-bold text-card-foreground truncate w-full text-center" title={property.title}>{property.title}</h3>
            {property.location && (
              <p className="text-xs text-muted-foreground truncate flex items-center justify-center w-full text-center" title={property.location}>
                <MapPin className="w-3 h-3 mr-1 flex-shrink-0 text-gray-400" />
                {property.location}
              </p>
            )}
            <div className="flex items-center gap-4 mt-1 justify-center">
              <span className="flex items-center gap-1 text-muted-foreground text-xs"><Bed className="w-4 h-4" />{property.bedrooms}</span>
              <span className="flex items-center gap-1 text-muted-foreground text-xs"><Bath className="w-4 h-4" />{property.bathrooms}</span>
              <span className="flex items-center gap-1 text-muted-foreground text-xs"><SquareArrowUp className="w-4 h-4" />{property.area}m²</span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    );
  };

  const PropertyCardCompact = ({ property }: { property: Property }) => {
    const [imgIdx, setImgIdx] = useState(0);
    const totalImgs = property.images && property.images.length > 0 ? property.images.length : 0;
    let imageUrl = property.images && property.images.length > 0 ? property.images[imgIdx] : '/placeholder-property.jpg';
    // Si la zona es Marruecos y no hay imágenes, usar marruecos.jpeg
    if ((!property.images || property.images.length === 0) && (property.zona?.toLowerCase().includes('marruecos') || property.zona?.toLowerCase().includes('marrueco'))) {
      imageUrl = '/marruecos.jpeg';
    }
    const minShare = getMinSharePrice(property);
    
    return (
      <Link to={`/properties/${property.id}`} className="group block">
        <Card className="overflow-hidden border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 bg-card p-0">
          <div className="flex">
            <div className="w-24 h-20 flex-shrink-0">
              <img
                src={imageUrl}
                alt={`Imagen de ${property.title}`}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-property.jpg'; }}
              />
            </div>
            <div className="flex-1 p-3 min-w-0">
              <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                {property.title}
              </h3>
              <div className="flex items-center text-xs text-muted-foreground mb-2">
                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{property.location}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Bed className="w-3 h-3 mr-1" />
                    <span>{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="w-3 h-3 mr-1" />
                    <span>{property.bathrooms}</span>
                  </div>
                  <div className="flex items-center">
                    <SquareArrowUp className="w-3 h-3 mr-1" />
                    <span>{property.area} m²</span>
                  </div>
                </div>
              </div>
              {minShare && (
                <div className="text-sm font-bold text-primary">
                  {formatPriceSimple(minShare)}
                  <span className="text-xs font-normal text-muted-foreground ml-1">/copropiedad</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </Link>
    );
  };

  // --- AJUSTADO FilterSection ---
  const FilterSection = () => {
    const handlePlaceSelected = () => {
      if (autocompleteRef.current) {
        const place = autocompleteRef.current.getPlace();
        if (place && place.formatted_address) {
          setFilters(prevFilters => ({ ...prevFilters, location: place.formatted_address }));
        } else if (locationInputRef.current && locationInputRef.current.value === '') {
          setFilters(prevFilters => ({ ...prevFilters, location: '' }));
        }
      }
    };
    const clearLocationFilter = () => {
      if (locationInputRef.current) locationInputRef.current.value = '';
      setFilters(prevFilters => ({ ...prevFilters, location: '' }));
    };

    return (
      <Card className="bg-card border shadow-sm rounded-lg">
        <CardContent className="p-4 md:p-5">
          {/* MODIFIED: Adjusted grid for better responsiveness */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 items-end">
            {/* 1. ¿Dónde buscas? */}
            <div className="relative">
              <label htmlFor="filterLocation" className="block text-xs font-medium text-muted-foreground mb-1.5">¿Dónde buscas?</label>
              {isAutocompleteLoaded ? (
                <Autocomplete
                  onLoad={(ref) => autocompleteRef.current = ref}
                  onPlaceChanged={handlePlaceSelected}
                  options={{ fields: ['formatted_address', 'geometry', 'name'] }}
                >
                  <ShadInput
                    id="filterLocation"
                    ref={locationInputRef}
                    type="text"
                    placeholder="Ciudad, zona, playa..."
                    className="w-full text-sm pr-8 h-10" // MODIFIED: Ensure h-10
                    defaultValue={filters.location}
                    onBlur={e => {
                      if (!autocompleteRef.current?.getPlace()) { 
                        setFilters(prev => ({ ...prev, location: e.target.value }));
                      }
                    }}
                  />
                </Autocomplete>
              ) : (
                <ShadInput
                  id="filterLocation"
                  ref={locationInputRef}
                  type="text"
                  placeholder="Cargando autocompletado..."
                  className="w-full text-sm pr-8 h-10" // MODIFIED: Ensure h-10
                  value={filters.location}
                  onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  disabled={!isAutocompleteLoaded}
                />
              )}
              {filters.location && (
                <Button variant="ghost" size="icon" className="absolute right-1 top-[29px] h-7 w-7 p-0" onClick={clearLocationFilter} aria-label="Limpiar ubicación">
                  <XIcon className="h-4 w-4 text-muted-foreground"/>
                </Button>
              )}
            </div>

            {/* 2. Zona */}
            <div>
              <label htmlFor="filterZona" className="block text-xs font-medium text-muted-foreground mb-1.5">Zona</label>
              <Select
                value={filters.zona || 'all'}
                onValueChange={zona => setFilters(prev => ({ ...prev, zona: zona === 'all' ? '' : zona }))}
              >
                <SelectTrigger id="filterZona" className="w-full text-sm h-10">
                  <SelectValue placeholder="Todas las zonas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las zonas</SelectItem>
                  {zonasUnicas.map(z => (
                    <SelectItem key={z} value={z}>{z}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2.5 Quincena/Copropiedad */}
            <div>
              <label htmlFor="filterQuincena" className="block text-xs font-medium text-muted-foreground mb-1.5">Quincena</label>
              <Select
                value={filters.quincena || 'all'}
                onValueChange={quincena => setFilters(prev => ({ ...prev, quincena: quincena === 'all' ? '' : quincena }))}
              >
                <SelectTrigger id="filterQuincena" className="w-full text-sm h-10">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="1">1ª quincena</SelectItem>
                  <SelectItem value="2">2ª quincena</SelectItem>
                  <SelectItem value="3">3ª quincena</SelectItem>
                  <SelectItem value="4">4ª quincena</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 3. Tipo de Vivienda */}
            <div className="relative w-full" ref={typeChecklistRef}>
              <label htmlFor="filterTypeButton" className="block text-xs font-medium text-muted-foreground mb-1.5">Tipo de Vivienda</label>
              <Button
                id="filterTypeButton" type="button" variant="outline"
                className="w-full justify-between text-sm h-10 font-normal"
                onClick={() => setShowTypeChecklist(v => !v)} aria-expanded={showTypeChecklist}
              >
                <span className="truncate pr-2">
                  {filters.propertyTypes.length === 0 ? 'Cualquiera'
                    : filters.propertyTypes.length === 1 ? TIPO_VIVIENDA_OPTIONS.find(t => t === filters.propertyTypes[0]) || 'Seleccionado'
                    : `${filters.propertyTypes.length} tipos`}
                </span>
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform flex-shrink-0 ${showTypeChecklist ? 'rotate-180' : ''}`} />
              </Button>
              {showTypeChecklist && (
                <div
                  className="absolute z-30 mt-1 w-full min-w-[250px] max-w-[350px] bg-popover border border-border rounded-md shadow-lg p-2"
                  style={{ maxHeight: '240px', overflowY: 'auto' }}
                >
                  <div className="grid grid-cols-1 gap-1">
                    {TIPO_VIVIENDA_OPTIONS.map(type => (
                      <div key={type} className="flex items-center space-x-2 hover:bg-accent rounded p-1.5">
                        <Checkbox
                          id={`type-${type}`} checked={filters.propertyTypes.includes(type)}
                          onCheckedChange={checked => {
                            setFilters(f => ({ ...f, propertyTypes: checked ? [...f.propertyTypes, type] : f.propertyTypes.filter(v => v !== type) }));
                          }}
                          className="h-4 w-4"
                        />
                        <label htmlFor={`type-${type}`} className="text-sm font-normal leading-none flex items-center gap-2 cursor-pointer w-full">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Dormitorios */}
            <div>
              <label htmlFor="filterBedrooms" className="block text-xs font-medium text-muted-foreground mb-1.5">Dormitorios (mín.)</label>
              <Select
                value={String(filters.bedrooms)}
                onValueChange={value => setFilters({ ...filters, bedrooms: value === 'any' ? 'any' : Number(value) })}
              >
                <SelectTrigger id="filterBedrooms" className="text-sm h-10">
                  <SelectValue placeholder="Cualquiera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any" className="text-sm">Cualquiera</SelectItem>
                  {roomOptions.map(opt => (
                    <SelectItem key={`bed-${opt.value}`} value={String(opt.value)} className="text-sm">{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* --- START REORDERED AND RESTRUCTURED SECTION --- */}
            {/* 5. Baños (mín.) - Moved and reordered */}
            <div>
              <label htmlFor="filterBathrooms" className="block text-xs font-medium text-muted-foreground mb-1.5">Baños (mín.)</label>
              <Select
                value={String(filters.bathrooms)}
                onValueChange={value => setFilters({ ...filters, bathrooms: value === 'any' ? 'any' : Number(value) })}
              >
                <SelectTrigger id="filterBathrooms" className="text-sm h-10 w-full"> {/* MODIFIED: h-10 */}
                  <SelectValue placeholder="Cualquiera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any" className="text-sm">Cualquiera</SelectItem>
                  {roomOptions.map(opt => (
                    <SelectItem key={`bath-${opt.value}`} value={String(opt.value)} className="text-sm">{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 6. Precio Mín. - Reordered */}
            <div>
              <label htmlFor="filterMinPrice" className="block text-xs font-medium text-muted-foreground mb-1.5">Precio Mín.</label> {/* MODIFIED: mb-1.5 */}
              <Select
                value={String(filters.minPrice)}
                onValueChange={value => setFilters({ ...filters, minPrice: value === 'any' ? 'any' : Number(value) })}
              >
                <SelectTrigger id="filterMinPrice" className="text-sm h-10 w-full"> {/* MODIFIED: h-10 */}
                  <SelectValue placeholder="Cualquiera" />
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

            {/* 7. Precio Máx. - Reordered */}
            <div>
              <label htmlFor="filterMaxPrice" className="block text-xs font-medium text-muted-foreground mb-1.5">Precio Máx.</label> {/* MODIFIED: mb-1.5 */}
              <Select
                value={String(filters.maxPrice)}
                onValueChange={value => setFilters({ ...filters, maxPrice: value === 'any' ? 'any' : Number(value) })}
              >
                <SelectTrigger id="filterMaxPrice" className="text-sm h-10 w-full"> {/* MODIFIED: h-10 */}
                  <SelectValue placeholder="Cualquiera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any" className="text-sm">Cualquiera</SelectItem>
                  {priceOptions.map(opt => (
                    (filters.minPrice === 'any' || opt.value > Number(filters.minPrice)) &&
                    <SelectItem key={`max-${opt.value}`} value={String(opt.value)} className="text-sm">{opt.label}</SelectItem>
                  ))}
                  {/* Removed String(Infinity) option as 'any' or last option "1.000.000€+" covers it effectively */}
                </SelectContent>
              </Select>
            </div>
            
            {/* 8. Más filtros Button - Reordered */}
            <div className="w-full sm:w-auto flex items-end"> {/* This wrapper helps align the button correctly */}
              <Button
                variant="ghost"
                className="text-sm px-3 h-10 flex items-center text-primary hover:bg-primary/90 hover:text-primary-foreground gap-2 font-semibold w-full" // MODIFIED: hover styles, text-sm
                onClick={() => setShowAdvancedFilters(v => !v)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-1" /> {/* MODIFIED: slightly smaller icon */}
                {showAdvancedFilters ? 'Menos filtros' : 'Más filtros'}
                {showAdvancedFilters ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
              </Button>
            </div>
            {/* --- END REORDERED AND RESTRUCTURED SECTION --- */}

            {/* 9. Obra nueva */}
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="filterObraNueva"
                checked={filters.obraNueva}
                onChange={e => setFilters(prev => ({ ...prev, obraNueva: e.target.checked }))}
                className="mr-1"
              />
              <Building2 className="w-5 h-5 text-orange-400 mr-1" />
              <label htmlFor="filterObraNueva" className="text-sm cursor-pointer select-none">Obra nueva</label>
            </div>
          </div>

          {/* Características Adicionales (condicional) */}
          {showAdvancedFilters && (
            <div id="advanced-features-filter" className="mt-6 pt-6 border-t border-border animate-fade-in">
              <label className="block text-sm font-medium text-foreground mb-3">Características Adicionales</label>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3">
                {FEATURES_LIST.map(feature => (
                  <div key={feature.key} className="flex items-center space-x-2">
                     <Checkbox
                        id={`feature-${feature.key}`} checked={filters.features.includes(feature.key)}
                        onCheckedChange={(checked) => {
                           setFilters(prevFilters => ({ ...prevFilters, features: checked ? [...prevFilters.features, feature.key] : prevFilters.features.filter(f => f !== feature.key) }));
                        }}
                        className="h-4 w-4"
                     />
                     <label htmlFor={`feature-${feature.key}`} className="text-sm font-normal leading-none flex items-center gap-1.5 cursor-pointer">
                        <span className="flex-shrink-0">{feature.icon}</span>
                        {feature.label}
                     </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón Limpiar Filtros */}
          {numActiveFilters > 0 && (
            <div className="mt-6 pt-5 border-t border-border flex justify-end">
                <Button variant="ghost" onClick={resetFilters} className="text-sm text-primary hover:text-primary/80">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpiar filtros ({numActiveFilters})
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  // --- FIN FilterSection ---

  useEffect(() => {
    if (!selectedMapProperty || !selectedMapProperty.images || selectedMapProperty.images.length <= 1) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % (selectedMapProperty.images?.length || 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedMapProperty]);

  useEffect(() => setCarouselIndex(0), [selectedMapProperty]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 animate-pulse">
         <div className="flex justify-between items-center mb-6"> <div className="h-8 bg-muted rounded w-1/4"></div> <div className="h-10 bg-muted rounded w-32"></div> </div> <div className="h-40 bg-muted rounded mb-6"></div>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {[...Array(6)].map((_, i) => ( <Card key={i} className="overflow-hidden"> <div className="w-full h-48 bg-muted-foreground/20" /> <CardContent className="p-4 space-y-2"> <div className="h-5 bg-muted-foreground/20 rounded w-3/4" /> <div className="h-4 bg-muted-foreground/20 rounded w-1/2" /> <div className="h-6 bg-muted-foreground/20 rounded w-1/3 mt-2" /> </CardContent> </Card> ))} </div>
      </div>
    );
  }

  return (
    <>
      <div className={`${view === 'map' ? 'lg:container lg:mx-auto lg:px-4 lg:py-6' : 'container mx-auto px-4 py-6'}`}>
        {/* Header - Oculto en móvil cuando está en vista mapa */}
        <div className={`${view === 'map' ? 'hidden lg:block' : 'block'} mb-6`}>
          <Button asChild variant="secondary" className="flex items-center gap-2">
            <Link to="/"> <ArrowLeft className="w-4 h-4" /> Volver a inicio </Link>
          </Button>
        </div>

        <div className={`${view === 'map' ? 'hidden lg:flex' : 'flex'} flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-4`}>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Propiedades</h1>
          <Tabs defaultValue={view} onValueChange={(v) => setView(v as 'grid' | 'map')} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-2 sm:w-auto">
              <TabsTrigger value="grid"> <LayoutGrid className="h-4 w-4 mr-2" /> Lista </TabsTrigger>
              <TabsTrigger value="map"> <MapPin className="h-4 w-4 mr-2" /> Mapa </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Botón de filtros móvil - Solo en vista grid */}
        <div className={`${view === 'grid' ? 'block' : 'hidden'} sm:hidden mb-4`}>
          <Button
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            aria-controls="filtros-busqueda"
          >
            <Filter className="w-5 h-5" />
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            {numActiveFilters > 0 && (
              <span className="ml-2 bg-background text-primary rounded-full px-2 py-0.5 text-xs font-semibold">{numActiveFilters}</span>
            )}
          </Button>
        </div>

        {/* Sección de filtros - Oculta en móvil cuando está en vista mapa */}
        <div 
          id="filtros-busqueda" 
          className={`${view === 'map' ? 'hidden lg:block' : 'block'} transition-all duration-300 ease-in-out ${showFilters || view === 'map' ? 'max-h-[2000px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'} overflow-hidden sm:max-h-none sm:opacity-100 sm:mb-6`}
        >
          <FilterSection />
        </div>

        {view === 'grid' && (
          <div className="mb-6 text-sm text-muted-foreground">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
            {numActiveFilters > 0 && <span className='ml-1'>(con {numActiveFilters} {numActiveFilters === 1 ? 'filtro aplicado' : 'filtros aplicados'})</span>}
          </div>
        )}

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
          isAutocompleteLoaded && ( 
            <>
              {/* Vista Desktop - Layout original */}
              <div className="hidden lg:flex flex-col lg:flex-row gap-6">
                {/* Sidebar con cards de propiedades */}
                <div className="lg:w-1/3 xl:w-1/4">
                  <div className="sticky top-6">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">
                      Propiedades ({filteredProperties.length})
                    </h3>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {filteredProperties.length > 0 ? (
                        filteredProperties.map((property) => (
                          <div 
                            key={property.id}
                            className={`cursor-pointer transition-all duration-200 ${
                              selectedMapProperty?.id === property.id 
                                ? 'ring-2 ring-primary shadow-lg' 
                                : 'hover:shadow-md'
                            }`}
                            onClick={() => setSelectedMapProperty(property)}
                          >
                            <PropertyCardCompact property={property} />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground bg-card border rounded-lg">
                          <Search className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                          <p className="font-semibold text-sm">No hay propiedades que coincidan</p>
                          <p className="text-xs mt-1">Prueba a modificar o limpiar los filtros.</p>
                          {numActiveFilters > 0 && (
                            <Button variant="link" size="sm" onClick={resetFilters} className="mt-2 text-primary text-xs">
                              Limpiar filtros
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mapa más grande */}
                <div className="lg:w-2/3 xl:w-3/4">
                  <div className="w-full h-[500px] lg:h-[600px] xl:h-[700px] rounded-lg overflow-hidden border shadow-sm relative bg-muted">
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={{ lat: 40.4637, lng: -3.7492 }} 
                      zoom={5}
                      options={{ mapTypeControl: false, streetViewControl: false, fullscreenControl: false, styles: [ ] }}
                      onClick={() => setSelectedMapProperty(null)}
                    >
                      {filteredProperties
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
                          options={{ pixelOffset: typeof window !== "undefined" && window.google ? new window.google.maps.Size(0, -40) : undefined }} 
                        >
                          <PropertyMapCard
                            property={selectedMapProperty}
                            minSharePrice={getMinSharePrice(selectedMapProperty)}
                            currentImageIndex={carouselIndex}
                            formatPrice={formatPriceSimple}
                            isMobile={false}
                          />
                        </InfoWindow>
                      )}
                    </GoogleMap>
                  </div>
                </div>
              </div>

              {/* Vista Móvil - Mapa en pantalla completa con botones flotantes */}
              <div className="lg:hidden fixed top-16 left-0 right-0 bottom-0 z-30">
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: 'calc(100vh - 64px)' }}
                  center={{ lat: 40.4637, lng: -3.7492 }} 
                  zoom={5}
                  options={{ mapTypeControl: false, streetViewControl: false, fullscreenControl: false, styles: [ ] }}
                  onClick={() => setSelectedMapProperty(null)}
                >
                  {filteredProperties
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
                      options={{ pixelOffset: typeof window !== "undefined" && window.google ? new window.google.maps.Size(0, -40) : undefined }} 
                    >
                      <PropertyMapCard
                        property={selectedMapProperty}
                        minSharePrice={getMinSharePrice(selectedMapProperty)}
                        currentImageIndex={carouselIndex}
                        formatPrice={formatPriceSimple}
                        isMobile={true}
                      />
                    </InfoWindow>
                  )}
                </GoogleMap>

                {/* Botones flotantes para móvil */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-4 z-50">
                  {/* Botón de Volver */}
                  <Button
                    onClick={() => window.history.back()}
                    className="bg-gray-600 text-white hover:bg-gray-700 shadow-lg rounded-full px-5 py-6 flex items-center gap-2 font-semibold"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Volver
                  </Button>

                  {/* Botón de Filtros */}
                  <Button
                    onClick={() => setShowMobileFiltersModal(true)}
                    className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg rounded-full px-5 py-6 flex items-center gap-2 font-semibold"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                    Filtros
                    {numActiveFilters > 0 && (
                      <span className="bg-primary text-white rounded-full px-2 py-0.5 text-xs font-bold ml-1">
                        {numActiveFilters}
                      </span>
                    )}
                  </Button>

                  {/* Botón de Resultados */}
                  <Button
                    onClick={() => setShowMobileResultsModal(true)}
                    className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg rounded-full px-5 py-6 flex items-center gap-2 font-semibold"
                  >
                    <LayoutGrid className="w-5 h-5" />
                    <span className="text-sm">{filteredProperties.length}</span>
                  </Button>

                  {/* Botón de Vista Lista */}
                  <Button
                    onClick={() => setView('grid')}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg rounded-full px-5 py-6 flex items-center gap-2 font-semibold"
                  >
                    <LayoutGrid className="w-5 h-5" />
                    Lista
                  </Button>
                </div>
              </div>

              {/* Modal de Filtros para Móvil */}
              {showMobileFiltersModal && (
                <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
                  <div className="bg-background w-full max-h-[90vh] rounded-t-2xl overflow-y-auto animate-slide-up">
                    <div className="sticky top-0 bg-background border-b px-4 py-3 flex items-center justify-between z-10">
                      <h2 className="text-lg font-bold">Filtros</h2>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowMobileFiltersModal(false)}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="p-4">
                      <FilterSection />
                      <div className="mt-4 sticky bottom-0 bg-background pt-4 border-t">
                        <Button
                          onClick={() => setShowMobileFiltersModal(false)}
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Aplicar filtros
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal de Resultados para Móvil */}
              {showMobileResultsModal && (
                <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
                  <div className="bg-background w-full max-h-[90vh] rounded-t-2xl overflow-hidden flex flex-col">
                    <div className="sticky top-0 bg-background border-b px-4 py-3 flex items-center justify-between z-10">
                      <h2 className="text-lg font-bold">Propiedades ({filteredProperties.length})</h2>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowMobileResultsModal(false)}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="overflow-y-auto flex-1 p-4">
                      {filteredProperties.length > 0 ? (
                        <div className="space-y-3">
                          {filteredProperties.map((property) => (
                            <div 
                              key={property.id}
                              onClick={() => {
                                setSelectedMapProperty(property);
                                setShowMobileResultsModal(false);
                              }}
                            >
                              <PropertyCardCompact property={property} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <Search className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                          <p className="font-semibold">No hay propiedades que coincidan</p>
                          <p className="text-sm mt-1">Prueba a modificar o limpiar los filtros.</p>
                          {numActiveFilters > 0 && (
                            <Button 
                              variant="link" 
                              size="sm" 
                              onClick={() => {
                                resetFilters();
                                setShowMobileResultsModal(false);
                              }} 
                              className="mt-2 text-primary"
                            >
                              Limpiar filtros
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )
        )}
      </div>
    </>
  );
};

export default PropertiesPage;