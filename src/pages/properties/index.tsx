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
import { Slider } from '@/components/ui/slider';
import type { Property } from '@/types/property';
import { Input as ShadInput } from '@/components/ui/input'; // Renombrado para evitar conflicto
import type { Libraries } from '@react-google-maps/api';
import Navbar from '@/components/Navbar';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, staggerFast, scaleIn, easeOut } from '@/components/landing/motion';

// --- Tipos y Constantes ---
type Filters = {
  minPrice: number;
  maxPrice: number;
  bedrooms: number | string;
  bathrooms: number | string;
  propertyTypes: string[];
  features: string[];
  location: string;
  zonas: string[];
  quincenas: string[];
  obraNueva: boolean;
};

const PRICE_SLIDER_MIN = 0;
const PRICE_SLIDER_MAX = 1000000;
const PRICE_SLIDER_STEP = 5000;

const initialFilters: Filters = {
  minPrice: PRICE_SLIDER_MIN,
  maxPrice: PRICE_SLIDER_MAX,
  bedrooms: 'any',
  bathrooms: 'any',
  propertyTypes: [],
  features: [],
  location: '',
  zonas: [],
  quincenas: [],
  obraNueva: false,
};

const formatPriceLabel = (price: number) => {
  if (price >= PRICE_SLIDER_MAX) return '1.000.000€+';
  return `${price.toLocaleString('es-ES')}€`;
};

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
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialFilters.minPrice,
    initialFilters.maxPrice,
  ]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showTypeChecklist, setShowTypeChecklist] = useState(false);
  const [showZonaChecklist, setShowZonaChecklist] = useState(false);
  const [showQuincenaChecklist, setShowQuincenaChecklist] = useState(false);
  const typeChecklistRef = useRef<HTMLDivElement>(null);
  const zonaChecklistRef = useRef<HTMLDivElement>(null);
  const quincenaChecklistRef = useRef<HTMLDivElement>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMapProperty, setSelectedMapProperty] = useState<Property | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const locationInputRef = useRef<HTMLInputElement | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const reduceMotion = useReducedMotion();

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
      setFilters(prev => ({
        ...prev,
        zonas: prev.zonas.includes(zonaParam) ? prev.zonas : [...prev.zonas, zonaParam],
      }));
    }
  }, [searchParams]);

  const applyFilters = (propertiesToFilter: Property[]): Property[] => {
    return propertiesToFilter.filter(property => {
      const minShare = getMinSharePrice(property);
      const priceFilterActive =
        filters.minPrice > PRICE_SLIDER_MIN || filters.maxPrice < PRICE_SLIDER_MAX;

      if (priceFilterActive) {
        if (minShare === null || minShare < 0) return false; 
        if (minShare < filters.minPrice || minShare > filters.maxPrice) return false;
      }
      
      const matchesBedrooms = filters.bedrooms === 'any' || (property.bedrooms != null && property.bedrooms >= Number(filters.bedrooms));
      const matchesBathrooms = filters.bathrooms === 'any' || (property.bathrooms != null && property.bathrooms >= Number(filters.bathrooms));
      const matchesType = filters.propertyTypes.length === 0 || (property.tipo_vivienda && filters.propertyTypes.includes(property.tipo_vivienda));
      const matchesFeatures = filters.features.length === 0 || (property.features && filters.features.every(f => property.features!.includes(f)));
      const matchesLocation = !filters.location || (property.location && property.location.toLowerCase().includes(filters.location.toLowerCase()));
      
      const normalizedPropertyZona = normalizaZonaFiltro(property.zona);
      const matchesZona =
        filters.zonas.length === 0 ||
        filters.zonas.some(z => normalizaZonaFiltro(z) === normalizedPropertyZona);
      
      let matchesQuincena = true;
      if (filters.quincenas.length > 0) {
        matchesQuincena = filters.quincenas.some((q) => {
          const shareStatus = property[`share${q}_status` as 'share1_status' | 'share2_status' | 'share3_status' | 'share4_status'];
          return shareStatus === 'disponible';
        });
      }
      
      let matchesObraNueva = true;
      if (filters.obraNueva) {
        matchesObraNueva = !!(property.features && property.features.includes('Obra nueva'));
      }
      
      const isSold = property.status === 'vendida';

      return matchesBedrooms && matchesBathrooms && matchesType && matchesFeatures && matchesLocation && matchesZona && matchesQuincena && matchesObraNueva && !isSold;
    });
  };

  const filteredProperties = applyFilters(properties);

  const resetFilters = () => {
    setFilters(initialFilters);
    setPriceRange([initialFilters.minPrice, initialFilters.maxPrice]);
    setShowAdvancedFilters(false);
    setShowTypeChecklist(false);
    setShowZonaChecklist(false);
    setShowQuincenaChecklist(false);
    if (locationInputRef.current) locationInputRef.current.value = ''; 
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (typeChecklistRef.current && !typeChecklistRef.current.contains(target)) {
        setShowTypeChecklist(false);
      }
      if (zonaChecklistRef.current && !zonaChecklistRef.current.contains(target)) {
        setShowZonaChecklist(false);
      }
      if (quincenaChecklistRef.current && !quincenaChecklistRef.current.contains(target)) {
        setShowQuincenaChecklist(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFilterCount = () => {
      let count = 0;
      if (filters.minPrice > PRICE_SLIDER_MIN) count++;
      if (filters.maxPrice < PRICE_SLIDER_MAX) count++;
      if (filters.bedrooms !== 'any') count++;
      if (filters.bathrooms !== 'any') count++;
      if (filters.location) count++;
      count += filters.zonas.length;
      count += filters.quincenas.length;
      count += filters.propertyTypes.length;
      count += filters.features.length;
      if (filters.obraNueva) count++;
      return count;
  };
  const numActiveFilters = activeFilterCount();

  const QUINCENA_OPTIONS = [
    { value: '1', label: '1ª quincena' },
    { value: '2', label: '2ª quincena' },
    { value: '3', label: '3ª quincena' },
    { value: '4', label: '4ª quincena' },
  ];

  const toggleInArray = (arr: string[], value: string, checked: boolean | string) =>
    checked ? [...arr, value] : arr.filter(v => v !== value);

  const zonasUnicas = Array.from(new Set(properties.map(p => (p.zona || '').trim()))).filter(z => z).sort();


  const PropertyCard = ({ property }: { property: Property }) => {
    const [imgIdx, setImgIdx] = useState(0);
    const totalImgs = property.images && property.images.length > 0 ? property.images.length : 0;
    let imageUrl = property.images && property.images.length > 0 ? property.images[imgIdx] : '/placeholder-property.jpg';
    if ((!property.images || property.images.length === 0) && (property.zona?.toLowerCase().includes('marruecos') || property.zona?.toLowerCase().includes('marrueco'))) {
      imageUrl = '/marruecos.jpeg';
    }
    const minShare = getMinSharePrice(property);
    const monthly = minShare ? calcularCuotaHipoteca(minShare) : null;
    return (
      <Link to={`/properties/${property.id}`} className="group block h-full">
        <Card className="overflow-hidden h-full flex flex-col border-0 rounded-2xl shadow-sm hover:shadow-xl transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] bg-white ring-1 ring-slate-200/80 hover-lift pressable">
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            <img
              src={imageUrl}
              alt={`Imagen de ${property.title}`}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] group-hover:scale-[1.03]"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-property.jpg'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start gap-2 z-10">
              {minShare ? (
                <span className="bg-white/95 backdrop-blur-sm text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                  Desde {formatPriceSimple(minShare)}
                </span>
              ) : <span />}
              {property.zona && (
                <span className="bg-black/45 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full max-w-[45%] truncate">
                  {property.zona}
                </span>
              )}
            </div>
            {totalImgs > 1 && (
              <>
                <button
                  type="button" aria-label="Anterior"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] z-20 pressable"
                  onClick={e => { e.preventDefault(); e.stopPropagation(); setImgIdx(idx => (idx - 1 + totalImgs) % totalImgs); }}
                > <ChevronLeftIcon className="w-4 h-4" /> </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20">
                  {Array.from({ length: Math.min(totalImgs, 5) }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-[width,background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${i === imgIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/55'}`}
                    />
                  ))}
                </div>
                <button
                  type="button" aria-label="Siguiente"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] z-20 pressable"
                  onClick={e => { e.preventDefault(); e.stopPropagation(); setImgIdx(idx => (idx + 1) % totalImgs); }}
                > <ChevronRightIcon className="w-4 h-4" /> </button>
              </>
            )}
          </div>
          <CardFooter className="bg-white px-4 py-3.5 flex flex-col gap-1.5 items-start text-left border-0">
            <h3 className="text-[15px] font-semibold text-slate-900 truncate w-full leading-snug" title={property.title}>{property.title}</h3>
            {property.location && (
              <p className="text-xs text-slate-500 truncate flex items-center w-full" title={property.location}>
                <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-slate-400" />
                {property.location}
              </p>
            )}
            <div className="flex items-center gap-3 mt-0.5 text-slate-500 text-xs">
              <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" />{property.bedrooms} hab.</span>
              <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{property.bathrooms} baños</span>
              <span className="flex items-center gap-1"><SquareArrowUp className="w-3.5 h-3.5" />{property.area} m²</span>
            </div>
            <div className="w-full pt-2 mt-1 border-t border-slate-100 flex items-end justify-between gap-2">
              <div>
                <p className="text-[11px] text-slate-400">Copropiedad desde</p>
                <p className="text-base font-bold text-[#5C0FF5] leading-tight">
                  {minShare ? formatPriceSimple(minShare) : 'Consultar'}
                </p>
              </div>
              {monthly && (
                <div className="text-right">
                  <p className="text-[11px] text-slate-400">Est. hipoteca*</p>
                  <p className="text-sm font-semibold text-slate-700">{formatPriceSimple(Math.round(monthly))} /mes</p>
                </div>
              )}
            </div>
          </CardFooter>
        </Card>
      </Link>
    );
  };

  // Card pequeño para la columna lateral del mapa
  const PropertyCardSmall = ({ property, isSelected, onClick }: { property: Property; isSelected: boolean; onClick: () => void }) => {
    let imageUrl = property.images && property.images.length > 0 ? property.images[0] : '/placeholder-property.jpg';
    if ((!property.images || property.images.length === 0) && (property.zona?.toLowerCase().includes('marruecos') || property.zona?.toLowerCase().includes('marrueco'))) {
      imageUrl = '/marruecos.jpeg';
    }
    const minShare = getMinSharePrice(property);
    
    return (
      <Card 
        className={`overflow-hidden border-0 rounded-xl shadow-sm hover:shadow-md transition-[transform,box-shadow] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] bg-white cursor-pointer ring-1 pressable ${
          isSelected ? 'ring-2 ring-primary shadow-md' : 'ring-black/5'
        }`}
        onClick={onClick}
      >
        <div className="flex gap-0">
          <div className="relative w-24 h-24 flex-shrink-0">
            <img
              src={imageUrl}
              alt={property.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-property.jpg'; }}
            />
          </div>
          <div className="flex-1 p-2.5 min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 truncate mb-0.5" title={property.title}>
              {property.title}
            </h4>
            {property.location && (
              <p className="text-[11px] text-slate-500 truncate mb-1 flex items-center">
                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                {property.location}
              </p>
            )}
            {minShare && (
              <p className="text-sm font-bold text-[#5C0FF5]">
                {formatPriceSimple(minShare)}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
              <span className="flex items-center gap-0.5"><Bed className="w-3 h-3" />{property.bedrooms}</span>
              <span className="flex items-center gap-0.5"><Bath className="w-3 h-3" />{property.bathrooms}</span>
              <span className="flex items-center gap-0.5"><SquareArrowUp className="w-3 h-3" />{property.area}m²</span>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // --- Panel de filtros (NO componente interno: evita remount del slider al arrastrar) ---
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

  const filterTile = (bg: string, dark = false) =>
    `relative rounded-2xl p-3.5 h-full ${dark ? '' : bg === '#FFFFFF' ? 'ring-1 ring-slate-200/80' : ''}`;
  const filterLabel = (dark = false) =>
    `block text-xs font-medium mb-1.5 ${dark ? 'text-white/80' : 'text-slate-600'}`;
  const filterControl = (dark = false) =>
    dark
      ? 'w-full justify-between text-sm h-10 font-normal rounded-xl bg-white/15 border-white/25 text-white hover:bg-white/25 hover:text-white'
      : 'w-full justify-between text-sm h-10 font-normal rounded-xl bg-white/80 border-0 text-slate-800 hover:bg-white hover:text-slate-800';

  const filterPanel = (      <Card className="bg-white border-0 shadow-md shadow-slate-200/50 rounded-2xl ring-1 ring-slate-200/80">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-[#5C0FF5]/10 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4 text-[#5C0FF5]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Filtros de búsqueda</p>
              <p className="text-xs text-slate-500">Combina zona, quincena, tipo y más</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 items-stretch">
            {/* 1. ¿Dónde buscas? */}
            <div className={filterTile('#CFB8FC')} style={{ backgroundColor: '#CFB8FC' }}>
              <label htmlFor="filterLocation" className={filterLabel()}>¿Dónde buscas?</label>
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
                    className="w-full text-sm pr-8 h-10 rounded-xl bg-white/80 border-0 focus-visible:ring-[#5C0FF5]/30"
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
                  className="w-full text-sm pr-8 h-10 rounded-xl bg-white/80 border-0"
                  value={filters.location}
                  onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  disabled={!isAutocompleteLoaded}
                />
              )}
              {filters.location && (
                <Button variant="ghost" size="icon" className="absolute right-4 top-[42px] h-7 w-7 p-0" onClick={clearLocationFilter} aria-label="Limpiar ubicación">
                  <XIcon className="h-4 w-4 text-muted-foreground"/>
                </Button>
              )}
            </div>

            {/* 2. Zona (multi) */}
            <div className={filterTile('#E8DAD9')} style={{ backgroundColor: '#E8DAD9' }} ref={zonaChecklistRef}>
              <label htmlFor="filterZonaButton" className={filterLabel()}>Zona</label>
              <Button
                id="filterZonaButton" type="button" variant="outline"
                className={filterControl()}
                onClick={() => { setShowZonaChecklist(v => !v); setShowTypeChecklist(false); setShowQuincenaChecklist(false); }}
                aria-expanded={showZonaChecklist}
              >
                <span className="truncate pr-2">
                  {filters.zonas.length === 0 ? 'Todas las zonas'
                    : filters.zonas.length === 1 ? filters.zonas[0]
                    : `${filters.zonas.length} zonas`}
                </span>
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform flex-shrink-0 ${showZonaChecklist ? 'rotate-180' : ''}`} />
              </Button>
              {showZonaChecklist && (
                <div className="absolute z-30 mt-1 left-3 right-3 min-w-[220px] bg-popover border border-border rounded-md shadow-lg p-2 max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-1">
                    {zonasUnicas.map(z => (
                      <div key={z} className="flex items-center space-x-2 hover:bg-[#CFB8FC]/40 rounded p-1.5 text-slate-800">
                        <Checkbox
                          id={`zona-${z}`}
                          checked={filters.zonas.includes(z)}
                          onCheckedChange={(checked) => {
                            setFilters(f => ({ ...f, zonas: toggleInArray(f.zonas, z, checked) }));
                          }}
                          className="h-4 w-4"
                        />
                        <label htmlFor={`zona-${z}`} className="text-sm font-normal leading-none cursor-pointer w-full">
                          {z}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2.5 Quincena (multi) */}
            <div className={filterTile('#FFFFFF')} style={{ backgroundColor: '#FFFFFF' }} ref={quincenaChecklistRef}>
              <label htmlFor="filterQuincenaButton" className={filterLabel()}>Quincena</label>
              <Button
                id="filterQuincenaButton" type="button" variant="outline"
                className={filterControl()}
                onClick={() => { setShowQuincenaChecklist(v => !v); setShowTypeChecklist(false); setShowZonaChecklist(false); }}
                aria-expanded={showQuincenaChecklist}
              >
                <span className="truncate pr-2">
                  {filters.quincenas.length === 0 ? 'Todas'
                    : filters.quincenas.length === 1
                      ? QUINCENA_OPTIONS.find(o => o.value === filters.quincenas[0])?.label
                      : `${filters.quincenas.length} quincenas`}
                </span>
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform flex-shrink-0 ${showQuincenaChecklist ? 'rotate-180' : ''}`} />
              </Button>
              {showQuincenaChecklist && (
                <div className="absolute z-30 mt-1 left-3 right-3 min-w-[200px] bg-popover border border-border rounded-md shadow-lg p-2">
                  <div className="grid grid-cols-1 gap-1">
                    {QUINCENA_OPTIONS.map(opt => (
                      <div key={opt.value} className="flex items-center space-x-2 hover:bg-[#CFB8FC]/40 rounded p-1.5 text-slate-800">
                        <Checkbox
                          id={`quincena-${opt.value}`}
                          checked={filters.quincenas.includes(opt.value)}
                          onCheckedChange={(checked) => {
                            setFilters(f => ({ ...f, quincenas: toggleInArray(f.quincenas, opt.value, checked) }));
                          }}
                          className="h-4 w-4"
                        />
                        <label htmlFor={`quincena-${opt.value}`} className="text-sm font-normal leading-none cursor-pointer w-full">
                          {opt.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Tipo de Vivienda */}
            <div className={filterTile('#FFFFFF')} style={{ backgroundColor: '#FFFFFF' }} ref={typeChecklistRef}>
              <label htmlFor="filterTypeButton" className={filterLabel()}>Tipo de Vivienda</label>
              <Button
                id="filterTypeButton" type="button" variant="outline"
                className={filterControl()}
                onClick={() => { setShowTypeChecklist(v => !v); setShowZonaChecklist(false); setShowQuincenaChecklist(false); }} aria-expanded={showTypeChecklist}
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
                  className="absolute z-30 mt-1 left-3 right-3 min-w-[250px] max-w-[350px] bg-popover border border-border rounded-md shadow-lg p-2"
                  style={{ maxHeight: '240px', overflowY: 'auto' }}
                >
                  <div className="grid grid-cols-1 gap-1">
                    {TIPO_VIVIENDA_OPTIONS.map(type => (
                      <div key={type} className="flex items-center space-x-2 hover:bg-[#CFB8FC]/40 rounded p-1.5 text-slate-800">
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
            <div className={filterTile('#CFB8FC')} style={{ backgroundColor: '#CFB8FC' }}>
              <label htmlFor="filterBedrooms" className={filterLabel()}>Dormitorios (mín.)</label>
              <Select
                value={String(filters.bedrooms)}
                onValueChange={value => setFilters({ ...filters, bedrooms: value === 'any' ? 'any' : Number(value) })}
              >
                <SelectTrigger id="filterBedrooms" className="text-sm h-10 rounded-xl bg-white/80 border-0">
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
            
            {/* 5. Baños */}
            <div className={filterTile('#E8DAD9')} style={{ backgroundColor: '#E8DAD9' }}>
              <label htmlFor="filterBathrooms" className={filterLabel()}>Baños (mín.)</label>
              <Select
                value={String(filters.bathrooms)}
                onValueChange={value => setFilters({ ...filters, bathrooms: value === 'any' ? 'any' : Number(value) })}
              >
                <SelectTrigger id="filterBathrooms" className="text-sm h-10 w-full rounded-xl bg-white/80 border-0">
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

            {/* 6-7. Precio */}
            <div className={`${filterTile('#FFFFFF')} sm:col-span-2 md:col-span-2 lg:col-span-2`} style={{ backgroundColor: '#FFFFFF' }}>
              <div className="flex items-center justify-between mb-2">
                <label className={filterLabel()}>Precio copropiedad</label>
                <span className="text-xs font-semibold text-slate-800 tabular-nums">
                  {formatPriceLabel(priceRange[0])} – {formatPriceLabel(priceRange[1])}
                </span>
              </div>
              <div className="px-2 pt-2 pb-1">
                <Slider
                  min={PRICE_SLIDER_MIN}
                  max={PRICE_SLIDER_MAX}
                  step={PRICE_SLIDER_STEP}
                  minStepsBetweenThumbs={1}
                  value={priceRange}
                  onValueChange={(values) => {
                    const min = Math.min(values[0], values[1]);
                    const max = Math.max(values[0], values[1]);
                    setPriceRange([min, max]);
                  }}
                  onValueCommit={(values) => {
                    const min = Math.min(values[0], values[1]);
                    const max = Math.max(values[0], values[1]);
                    setPriceRange([min, max]);
                    setFilters(prev => ({
                      ...prev,
                      minPrice: min,
                      maxPrice: max,
                    }));
                  }}
                  className="w-full"
                  aria-label="Rango de precio"
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-slate-400">
                <span>0€</span>
                <span>paso 5.000€</span>
                <span>1.000.000€+</span>
              </div>
            </div>
          </div>

          {/* Misma línea: Más filtros · Obra nueva · Buscar · Limpiar */}
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 items-stretch">
            <div className={filterTile('#FFFFFF')} style={{ backgroundColor: '#FFFFFF' }}>
              <button
                type="button"
                className="text-sm px-3 h-10 inline-flex items-center justify-center gap-2 font-semibold w-full rounded-xl text-[#5C0FF5] bg-transparent hover:bg-[#CFB8FC]/40 transition-colors"
                onClick={() => setShowAdvancedFilters(v => !v)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {showAdvancedFilters ? 'Menos filtros' : 'Más filtros'}
                {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            <div className={`${filterTile('#E8DAD9')} flex items-center justify-center gap-2`} style={{ backgroundColor: '#E8DAD9' }}>
              <input
                type="checkbox"
                id="filterObraNueva"
                checked={filters.obraNueva}
                onChange={e => setFilters(prev => ({ ...prev, obraNueva: e.target.checked }))}
                className="mr-1"
              />
              <Building2 className="w-5 h-5 text-[#5C0FF5] mr-1 shrink-0" />
              <label htmlFor="filterObraNueva" className="text-sm cursor-pointer select-none text-slate-800 whitespace-nowrap">Obra nueva</label>
            </div>

            <div className={filterTile('#E8DAD9')} style={{ backgroundColor: '#E8DAD9' }}>
              <button
                type="button"
                className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-xl font-semibold bg-[#E8DAD9] text-slate-900 hover:bg-[#d9c8c6] transition-colors"
                onClick={() => {
                  setShowFilters(false);
                  document.getElementById('resultados-propiedades')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                <Search className="w-4 h-4" />
                Buscar
              </button>
            </div>

            <div className={filterTile('#FFFFFF')} style={{ backgroundColor: '#FFFFFF' }}>
              <button
                type="button"
                onClick={() => {
                  resetFilters();
                  if (searchParams.has('zona')) {
                    const next = new URLSearchParams(searchParams);
                    next.delete('zona');
                    setSearchParams(next, { replace: true });
                  }
                }}
                disabled={numActiveFilters === 0}
                className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-slate-700 bg-transparent hover:bg-slate-100 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Limpiar{numActiveFilters > 0 ? ` (${numActiveFilters})` : ''}
              </button>
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

          {/* Chips de filtros activos */}
          {(filters.zonas.length > 0 || filters.quincenas.length > 0 || filters.propertyTypes.length > 0 || filters.features.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.zonas.map(z => (
                <button
                  key={`chip-zona-${z}`}
                  type="button"
                  onClick={() => setFilters(f => ({ ...f, zonas: f.zonas.filter(x => x !== z) }))}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium hover:bg-primary/20"
                >
                  {z} <X className="w-3 h-3" />
                </button>
              ))}
              {filters.quincenas.map(q => (
                <button
                  key={`chip-q-${q}`}
                  type="button"
                  onClick={() => setFilters(f => ({ ...f, quincenas: f.quincenas.filter(x => x !== q) }))}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium hover:bg-primary/20"
                >
                  {QUINCENA_OPTIONS.find(o => o.value === q)?.label || `Q${q}`} <X className="w-3 h-3" />
                </button>
              ))}
              {filters.propertyTypes.map(t => (
                <button
                  key={`chip-type-${t}`}
                  type="button"
                  onClick={() => setFilters(f => ({ ...f, propertyTypes: f.propertyTypes.filter(x => x !== t) }))}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-medium hover:bg-slate-200"
                >
                  {t} <X className="w-3 h-3" />
                </button>
              ))}
              {filters.features.map(feat => (
                <button
                  key={`chip-feat-${feat}`}
                  type="button"
                  onClick={() => setFilters(f => ({ ...f, features: f.features.filter(x => x !== feat) }))}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-medium hover:bg-slate-200"
                >
                  {feat} <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
  );
  // --- FIN panel de filtros ---

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
      <>
        <Navbar />
        <div className="min-h-screen bg-white">
          <div className="container mx-auto p-4 animate-pulse pt-24">
            <div className="h-10 bg-slate-100 rounded-xl w-1/3 mb-6" />
            <div className="h-36 bg-slate-100 rounded-2xl mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden rounded-2xl border-0">
                  <div className="w-full aspect-[4/3] bg-slate-200" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                    <div className="h-6 bg-slate-200 rounded w-1/3 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        <div className={`${view === 'map' ? 'max-w-[1600px] w-full mx-auto px-3 sm:px-4' : 'container mx-auto px-4'} py-6 pt-24 pb-12`}>
        <motion.div
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-5 sm:mb-7"
          initial={reduceMotion ? false : 'hidden'}
          animate={reduceMotion ? undefined : 'show'}
          variants={staggerFast}
        >
          <motion.div variants={fadeUp}>
            <Button asChild variant="ghost" className="rounded-full px-3 mb-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 -ml-2">
              <Link to="/"> <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver </Link>
            </Button>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1.5">Buscador</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Explorar propiedades</h1>
            <p className="text-sm text-slate-500 mt-1.5">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'resultado' : 'resultados'}
              {numActiveFilters > 0 && ` · ${numActiveFilters} filtro${numActiveFilters === 1 ? '' : 's'} activo${numActiveFilters === 1 ? '' : 's'}`}
            </p>
          </motion.div>
          <motion.div variants={fadeUp}>
          <Tabs value={view} onValueChange={(v) => setView(v as 'grid' | 'map')} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-2 sm:w-auto rounded-full bg-[#CFB8FC] p-1 shadow-sm h-auto">
              <TabsTrigger value="grid" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-800 px-4 py-2 transition-[background-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]">
                <LayoutGrid className="h-4 w-4 mr-2" /> Lista
              </TabsTrigger>
              <TabsTrigger value="map" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-800 px-4 py-2 transition-[background-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]">
                <MapPin className="h-4 w-4 mr-2" /> Mapa
              </TabsTrigger>
            </TabsList>
          </Tabs>
          </motion.div>
        </motion.div>

        <div className="block sm:hidden mb-4">
          <Button
            className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-50 rounded-full shadow-sm ring-1 ring-slate-200/80"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            aria-controls="filtros-busqueda"
            variant="secondary"
          >
            <Filter className="w-5 h-5 text-primary" />
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            {numActiveFilters > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-semibold">{numActiveFilters}</span>
            )}
          </Button>
        </div>

        <div
          id="filtros-busqueda"
          className={`${showFilters ? 'mb-6 block' : 'mb-0 hidden'} sm:mb-6 sm:block`}
        >
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, transform: 'translateY(10px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.35, ease: easeOut }}
          >
            {filterPanel}
          </motion.div>
        </div>

        <div id="resultados-propiedades">
        {view === 'grid' ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
            initial={reduceMotion ? false : 'hidden'}
            animate={reduceMotion ? undefined : 'show'}
            variants={staggerFast}
          >
            {filteredProperties.length > 0 ? (
              filteredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  variants={scaleIn}
                  transition={{
                    duration: 0.3,
                    ease: easeOut,
                    delay: reduceMotion ? 0 : Math.min(index, 8) * 0.04,
                  }}
                >
                  <PropertyCard property={property} />
                </motion.div>
              ))
            ) : (
              <motion.div
                variants={fadeUp}
                className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-16 text-slate-500 bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-sm"
              >
                  <Search className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                  <p className="font-semibold text-slate-800">No hay propiedades que coincidan</p>
                  <p className="text-sm mt-1">Prueba a modificar o limpiar los filtros.</p>
                  {numActiveFilters > 0 && <Button variant="link" size="sm" onClick={resetFilters} className="mt-2 text-primary">Limpiar filtros</Button>}
              </motion.div>
            )}
          </motion.div>
        ) : (
          isAutocompleteLoaded && ( 
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 h-[520px] md:h-[620px] lg:h-[calc(100vh-170px)] lg:min-h-[680px]">
              {/* Columna lateral con cards pequeñas - Solo en escritorio */}
              <motion.div
                className="hidden lg:block w-full lg:w-72 xl:w-80 flex-shrink-0 h-full"
                initial={reduceMotion ? false : { opacity: 0, transform: 'translateX(-8px)' }}
                animate={{ opacity: 1, transform: 'translateX(0px)' }}
                transition={{ duration: 0.3, ease: easeOut }}
              >
                <div className="bg-white border-0 rounded-2xl shadow-sm ring-1 ring-slate-200/80 p-3 h-full overflow-y-auto">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 sticky top-0 bg-white pb-2 z-10">
                    {filteredProperties.length} {filteredProperties.length === 1 ? 'propiedad' : 'propiedades'}
                  </h3>
                  <div className="space-y-2.5">
                    {filteredProperties.length > 0 ? (
                      filteredProperties
                        .filter(p => p.latitude && p.longitude)
                        .map((property, index) => (
                          <motion.div
                            key={property.id}
                            initial={reduceMotion ? false : { opacity: 0, transform: 'translateY(8px)' }}
                            animate={{ opacity: 1, transform: 'translateY(0px)' }}
                            transition={{ duration: 0.25, ease: easeOut, delay: Math.min(index, 6) * 0.04 }}
                          >
                          <PropertyCardSmall
                            property={property}
                            isSelected={selectedMapProperty?.id === property.id}
                            onClick={() => setSelectedMapProperty(property)}
                          />
                          </motion.div>
                        ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm">No hay propiedades</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
              
              {/* Mapa - Columna principal más grande en PC */}
              <motion.div
                className="flex-1 w-full rounded-2xl overflow-hidden shadow-sm relative bg-slate-200 min-h-[420px] lg:min-h-0 ring-1 ring-slate-200/80"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35, ease: easeOut }}
              >
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={selectedMapProperty && selectedMapProperty.latitude && selectedMapProperty.longitude 
                    ? { lat: Number(selectedMapProperty.latitude), lng: Number(selectedMapProperty.longitude) }
                    : { lat: 40.4637, lng: -3.7492 }
                  }
                  zoom={selectedMapProperty ? 12 : 5}
                  options={{ mapTypeControl: false, streetViewControl: false, fullscreenControl: true, styles: [ ] }}
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
                      <div className="relative w-[240px] h-[210px] bg-card rounded-md shadow-xl overflow-hidden font-sans">
                        <a
                          href={`${window.location.origin}/properties/${selectedMapProperty.id}`}
                          target="_blank" rel="noopener noreferrer"
                          className="block w-full h-[130px] overflow-hidden"
                          aria-label={`Ver detalles de ${selectedMapProperty.title}`}
                        >
                          {selectedMapProperty.images && selectedMapProperty.images.length > 0 ? (
                            <img
                              src={selectedMapProperty.images[carouselIndex]}
                              alt={`Imagen de ${selectedMapProperty.title}`}
                              className="w-full h-full object-cover transition-opacity duration-300"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-property.jpg'; }}
                            />
                          ) : (
                            <img src="/placeholder-property.jpg" alt="Propiedad sin imagen" className="w-full h-full object-cover" />
                          )}
                        </a>
                        <div className="p-3">
                          <a
                            href={`${window.location.origin}/properties/${selectedMapProperty.id}`}
                            className="font-semibold text-sm block hover:underline truncate text-card-foreground"
                            target="_blank" rel="noopener noreferrer"
                            onClick={(e) => { e.stopPropagation(); }}
                          >
                            {selectedMapProperty.title}
                          </a>
                          <div className="text-base font-bold mt-0.5 text-[#5C0FF5]">
                            {getMinSharePrice(selectedMapProperty) ? formatPriceSimple(getMinSharePrice(selectedMapProperty)!) : 'N/A'}
                            <span className="text-xs font-normal text-muted-foreground ml-1">/copropiedad</span>
                          </div>
                           <div className="text-xs text-muted-foreground mt-1">
                              {selectedMapProperty.bedrooms} hab. • {selectedMapProperty.bathrooms} baños • {selectedMapProperty.area} m²
                          </div>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </motion.div>
            </div>
          )
        )}
        </div>
      </div>
      </div>
    </>
  );
};

export default PropertiesPage;
