import * as React from 'react';
import { useState, useEffect, FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { HiOutlineArrowLeft, HiOutlinePhoto, HiOutlineTrash, HiOutlineHome, HiOutlineUser, HiOutlineDocumentText, HiOutlineSparkles, HiOutlineCake, HiOutlineKey } from "react-icons/hi2";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from '@/components/ui/command';
import { FaSwimmingPool, FaHotTub, FaChild, FaGamepad, FaUmbrellaBeach, FaParking, FaShoppingCart, FaGlassCheers, FaTree, FaWater, FaShip, FaPrescriptionBottleAlt } from 'react-icons/fa';
import { GoogleMap, Marker, useLoadScript, Autocomplete } from '@react-google-maps/api';
import { geocodeAddress } from '@/utils/geocoding';
import { Checkbox } from '@/components/ui/checkbox';
import { addDays, format } from 'date-fns';
import { Wind, Warehouse, ChevronUp, Square, Home, ParkingCircle, Trees, Waves, UserCheck, Sparkles } from 'lucide-react';
import AddProperty2 from '../AddProperty2';
import EditProperty from '../EditProperty';

type ShareStatus = 'disponible' | 'reservada' | 'vendida';

const NEARBY_SERVICES = [
  { key: 'playa_cercana', label: 'Playa cercana', icon: <FaUmbrellaBeach className="w-6 h-6 text-cyan-500" /> },
  { key: 'supermercados', label: 'Supermercados', icon: <FaShoppingCart className="w-6 h-6 text-green-500" /> },
  { key: 'vida_nocturna', label: 'Vida nocturna', icon: <FaGlassCheers className="w-6 h-6 text-purple-500" /> },
  { key: 'parques_naturales', label: 'Parques naturales', icon: <FaTree className="w-6 h-6 text-green-600" /> },
  { key: 'deportes_nauticos', label: 'Deportes náuticos', icon: <FaWater className="w-6 h-6 text-blue-500" /> },
  { key: 'puerto_deportivo', label: 'Puerto deportivo', icon: <FaShip className="w-6 h-6 text-blue-600" /> },
  { key: 'farmacias', label: 'Farmacias', icon: <FaPrescriptionBottleAlt className="w-6 h-6 text-red-500" /> },
];

interface Property {
  id?: string;
  title: string;
  description?: string;
  price: number;
  status?: ShareStatus;
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  user_id: string | null;
  agent_id?: string | null;
  features?: string[];
  // Share 1: 1ª quincena Julio + 10 sem
  share1_status: ShareStatus;
  share1_owner_id: string | null;
  share1_price: number;
  // Share 2: 2ª quincena Julio + 10 sem
  share2_status: ShareStatus;
  share2_owner_id: string | null;
  share2_price: number;
  // Share 3: 1ª quincena Agosto + 10 sem
  share3_status: ShareStatus;
  share3_owner_id: string | null;
  share3_price: number;
  // Share 4: 2ª quincena Agosto + 10 sem
  share4_status: ShareStatus;
  share4_owner_id: string | null;
  share4_price: number;
  nearby_services?: string[];
  tipo_vivienda?: string;
  features_extra?: string[];
  destacada?: boolean;
  zona?: string;
  lavabos?: number;
}

const FEATURES = [
  { key: 'piscina_privada', label: 'Piscina privada', icon: <FaSwimmingPool className="w-6 h-6 text-blue-500" /> },
  { key: 'jacuzzi', label: 'Jacuzzi', icon: <FaHotTub className="w-6 h-6 text-pink-500" /> },
  { key: 'juegos_ninos', label: 'Juegos para niños', icon: <FaChild className="w-6 h-6 text-yellow-500" /> },
  { key: 'videoconsolas', label: 'Videoconsolas', icon: <FaGamepad className="w-6 h-6 text-green-500" /> },
  { key: 'acceso_playa', label: 'Acceso playa', icon: <FaUmbrellaBeach className="w-6 h-6 text-cyan-500" /> },
  { key: 'parking_gratuito', label: 'Parking gratuito', icon: <FaParking className="w-6 h-6 text-gray-700" /> },
];

const TIPO_VIVIENDA_OPTIONS = [
  { value: 'Piso', label: 'Piso' },
  { value: 'Ático', label: 'Ático' },
  { value: 'Dúplex', label: 'Dúplex' },
  { value: 'Casa independiente', label: 'Casa independiente' },
  { value: 'Casa pareada', label: 'Casa pareada' },
  { value: 'Casa adosada', label: 'Casa adosada' },
  { value: 'Casa rústica', label: 'Casa rústica' },
];

const FEATURES_EXTRA = [
  'Aire acondicionado',
  'Armarios empotrados',
  'Ascensor',
  'Balcón',
  'Terraza',
  'Exterior',
  'Garaje',
  'Jardín',
  'Piscina',
  'Trastero',
  'Vivienda accesible',
  'Vistas al mar',
  'Vivienda de lujo',
];

const FEATURES_EXTRA_ICONS: Record<string, JSX.Element> = {
  'Aire acondicionado': <Wind className="w-5 h-5 text-cyan-500" />,
  'Armarios empotrados': <Warehouse className="w-5 h-5 text-yellow-700" />,
  'Ascensor': <ChevronUp className="w-5 h-5 text-purple-500" />,
  'Balcón': <Square className="w-5 h-5 text-yellow-500" />,
  'Terraza': <Square className="w-5 h-5 text-yellow-500" />,
  'Exterior': <Home className="w-5 h-5 text-gray-700" />,
  'Garaje': <ParkingCircle className="w-5 h-5 text-gray-700" />,
  'Jardín': <Trees className="w-5 h-5 text-green-600" />,
  'Piscina': <Waves className="w-5 h-5 text-blue-500" />,
  'Trastero': <Warehouse className="w-5 h-5 text-orange-500" />,
  'Vivienda accesible': <UserCheck className="w-5 h-5 text-pink-500" />,
  'Vistas al mar': <Waves className="w-5 h-5 text-blue-400" />,
  'Vivienda de lujo': <Sparkles className="w-5 h-5 text-amber-600" />,
};

const GOOGLE_MAPS_API_KEY = "AIzaSyBy4MuV_fOnPJF-WoxQbBlnKj8dMF6KuxM";
const GOOGLE_MAPS_LIBRARIES: ["places"] = ["places"];

interface PropertyFormProps {
  isEditing?: boolean;
}

// Función auxiliar para obtener las fechas fijas de cada quincena
const QUINCENAS = [
  // share1: 1ª quincena Julio
  { share: 1, start: (year: number) => `${year}-07-01`, end: (year: number) => `${year}-07-15` },
  // share2: 2ª quincena Julio
  { share: 2, start: (year: number) => `${year}-07-16`, end: (year: number) => `${year}-07-31` },
  // share3: 1ª quincena Agosto
  { share: 3, start: (year: number) => `${year}-08-01`, end: (year: number) => `${year}-08-15` },
  // share4: 2ª quincena Agosto
  { share: 4, start: (year: number) => `${year}-08-16`, end: (year: number) => `${year}-08-31` },
];

// Función para validar UUID
function isValidUUID(uuid: string | null | undefined) {
  return typeof uuid === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uuid);
}

const ZONAS_OPTIONS = [
  'Costa de levante.',
  'Canarias.',
  'Baleares.',
  'Costa Catalana',
  'Anadalucia',
  'Euskadi.',
  'Asturias.',
  'Galicia',
  'Murcia',
  'Zonas de interior.'
];

const PropertyForm: FC<PropertyFormProps> = ({ isEditing = false }) => {
  if (isEditing) {
    return <EditProperty />;
  }
  return <AddProperty2 />;
};

export default PropertyForm; 