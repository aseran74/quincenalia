import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { HiOutlineArrowLeft, HiOutlinePencil, HiOutlineHome, HiOutlineUser, HiOutlineDocumentText } from "react-icons/hi2";
import { FaSwimmingPool, FaHotTub, FaChild, FaGamepad, FaUmbrellaBeach, FaParking, FaShoppingCart, FaGlassCheers, FaTree, FaWater, FaShip, FaPrescriptionBottleAlt } from 'react-icons/fa';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

type ShareStatus = 'disponible' | 'reservado' | 'vendido';

interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  status?: ShareStatus;
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  location?: string;
  share1_status?: ShareStatus;
  share2_status?: ShareStatus;
  share3_status?: ShareStatus;
  share4_status?: ShareStatus;
  features?: string[];
  agent_id?: string;
  copropiedad?: string;
  nearby_services?: string[];
  tipo_vivienda?: string;
  features_extra?: string[];
  zona?: string;
  lavabos?: number;
}

interface Agent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  photo_url?: string;
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'disponible':
      return 'bg-green-500';
    case 'reservado':
      return 'bg-yellow-500';
    case 'vendido':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const formatStatus = (status?: string) => {
  if (!status) return 'No definido';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const FEATURES = [
  { key: 'piscina_privada', label: 'Piscina privada', icon: <FaSwimmingPool className="w-6 h-6 text-blue-500" /> },
  { key: 'jacuzzi', label: 'Jacuzzi', icon: <FaHotTub className="w-6 h-6 text-pink-500" /> },
  { key: 'juegos_ninos', label: 'Juegos para niños', icon: <FaChild className="w-6 h-6 text-yellow-500" /> },
  { key: 'videoconsolas', label: 'Videoconsolas', icon: <FaGamepad className="w-6 h-6 text-green-500" /> },
  { key: 'acceso_playa', label: 'Acceso playa', icon: <FaUmbrellaBeach className="w-6 h-6 text-cyan-500" /> },
  { key: 'parking_gratuito', label: 'Parking gratuito', icon: <FaParking className="w-6 h-6 text-gray-700" /> },
];

const NEARBY_SERVICES = [
  { key: 'playa_cercana', label: 'Playa cercana', icon: <FaUmbrellaBeach className="w-6 h-6 text-cyan-500" /> },
  { key: 'supermercados', label: 'Supermercados', icon: <FaShoppingCart className="w-6 h-6 text-green-500" /> },
  { key: 'vida_nocturna', label: 'Vida nocturna', icon: <FaGlassCheers className="w-6 h-6 text-purple-500" /> },
  { key: 'parques_naturales', label: 'Parques naturales', icon: <FaTree className="w-6 h-6 text-green-600" /> },
  { key: 'deportes_nauticos', label: 'Deportes náuticos', icon: <FaWater className="w-6 h-6 text-blue-500" /> },
  { key: 'puerto_deportivo', label: 'Puerto deportivo', icon: <FaShip className="w-6 h-6 text-blue-600" /> },
  { key: 'farmacias', label: 'Farmacias', icon: <FaPrescriptionBottleAlt className="w-6 h-6 text-red-500" /> },
];

// Definir tipo para los props de la calculadora
interface MortgageType {
  value: number;
  downPayment: number;
  interest: number;
  years: number;
  result: null | {
    monthly: number;
    total: number;
    totalInterest: number;
  };
}

function MortgageResult({ mortgage }: { mortgage: MortgageType }) {
  const l = mortgage.value - mortgage.downPayment;
  const r = (mortgage.interest / 100) / 12;
  const n = mortgage.years * 12;
  const P = l * r / (1 - Math.pow(1 + r, -n));
  const total = P * n;
  const totalInterest = total - l;
  return (
    <>
      <p>Cuota mensual: <span className="font-bold">€{isFinite(P) ? P.toLocaleString(undefined, {maximumFractionDigits:2}) : '-'}</span></p>
      <p>Total a pagar: <span className="font-bold">€{isFinite(total) ? total.toLocaleString(undefined, {maximumFractionDigits:2}) : '-'}</span></p>
      <p>Total intereses: <span className="font-bold">€{isFinite(totalInterest) ? totalInterest.toLocaleString(undefined, {maximumFractionDigits:2}) : '-'}</span></p>
    </>
  );
}

// Añadir hook para cargar el script de Google Maps
function useGoogleMaps(apiKey: string) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (window.google && window.google.maps) {
      setLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [apiKey]);
  return loaded;
}

// Componente para mostrar el mapa
function PropertyMap({ address }: { address: string }) {
  const apiKey = "AIzaSyBy4MuV_fOnPJF-WoxQbBlnKj8dMF6KuxM";
  const loaded = useGoogleMaps(apiKey);
  const mapRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!loaded || !address || !mapRef.current) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const map = new window.google.maps.Map(mapRef.current!, {
          zoom: 15,
          center: results[0].geometry.location,
        });
        new window.google.maps.Marker({
          map,
          position: results[0].geometry.location,
        });
      }
    });
  }, [loaded, address]);
  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border mt-6">
      {address ? (
        <div ref={mapRef} className="w-full h-full" />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">No hay dirección para mostrar el mapa</div>
      )}
    </div>
  );
}

function isUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

const GOOGLE_MAPS_API_KEY = "AIzaSyBy4MuV_fOnPJF-WoxQbBlnKj8dMF6KuxM";

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [mortgage, setMortgage] = useState<MortgageType>({
    value: property?.price ? property.price / 4 : 0,
    downPayment: property?.price ? (property.price / 4) * 0.2 : 0,
    interest: 1.9,
    years: 20,
    result: null,
  });
  const { isLoaded } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY });
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  if (!id || !isUUID(id)) {
    return <div className="p-8 text-center text-red-500">ID de propiedad no válido</div>;
  }

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true); // Asegúrate de poner loading a true al inicio
    try {
      console.log(`[Vercel Debug] Fetching property with ID: ${id}`);
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*, agent:profiles(*)') // Simplifica el select si solo necesitas depurar esto
        .eq('id', id)
        .single();

      console.log('[Vercel Debug] Raw propertyData from Supabase:', JSON.stringify(propertyData, null, 2));
      console.log('[Vercel Debug] Supabase error:', JSON.stringify(propertyError, null, 2));

      if (propertyError) {
        console.error('[Vercel Debug] Supabase fetch error:', propertyError);
        throw propertyError;
      }

      if (propertyData) {
        console.log('[Vercel Debug] Features received:', JSON.stringify(propertyData.features, null, 2));
        console.log('[Vercel Debug] Features_extra received:', JSON.stringify(propertyData.features_extra, null, 2));
        setProperty(propertyData);
        if (propertyData.agent) {
          setAgent(propertyData.agent);
        }
      } else {
        console.log('[Vercel Debug] No propertyData received from Supabase.');
      }
    } catch (error) {
      console.error('[Vercel Debug] Catch block error in fetchProperty:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar la propiedad (revisar logs de Vercel)',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (property?.price) {
      setMortgage(m => ({
        ...m,
        value: property.price / 4,
        downPayment: (property.price / 4) * 0.2,
      }));
    }
  }, [property?.price]);

  const handleMortgageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMortgage(m => ({ ...m, [name]: Number(value) }));
  };

  const calculateMortgage = () => {
    const l = mortgage.value - mortgage.downPayment;
    const r = (mortgage.interest / 100) / 12;
    const n = mortgage.years * 12;
    const P = l * r / (1 - Math.pow(1 + r, -n));
    const total = P * n;
    const totalInterest = total - l;
    setMortgage(m => ({ ...m, result: { monthly: P, total, totalInterest } }));
  };

  useEffect(() => {
    if (isLoaded && property?.location && !coordinates) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: property.location }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setCoordinates({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
        }
      });
    }
  }, [isLoaded, property?.location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Propiedad no encontrada</h1>
          <Button onClick={() => navigate('/dashboard/admin/properties')}>
            <HiOutlineArrowLeft className="h-5 w-5 mr-2" />
            Volver a propiedades
          </Button>
        </div>
      </div>
    );
  }

  if (property && !Array.isArray(property.features)) {
    property.features = [];
  }

  const shareLabels = [
    '1º quincena Julio + 10 sem',
    '2ª quincena Julio + 10 sem',
    '1º quincena Agosto + 10 sem',
    '2ª quincena Agosto + 10 sem',
  ];
  const shareStatus = [
    property.share1_status,
    property.share2_status,
    property.share3_status,
    property.share4_status,
  ];

  return (
    <div className="container mx-auto px-4 py-8 font-poppins">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard/admin/properties')}
        >
          <HiOutlineArrowLeft className="h-5 w-5 mr-2" />
          Volver
        </Button>
        <Button
          onClick={() => navigate(`/dashboard/admin/properties/${id}/edit`)}
        >
          <HiOutlinePencil className="h-5 w-5 mr-2" />
          Editar
        </Button>
      </div>
      <Card className="mb-8 font-poppins">
        <CardContent className="p-6 font-poppins">
          <div className="mb-8">
            <div className="relative w-full h-96 mb-2">
              {property.images && property.images.length > 0 ? (
                <>
                  <img
                    src={property.images[currentImageIndex]}
                    alt={`${property.title} - Imagen ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {property.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                      {property.images.map((_, index) => (
                        <button
                          key={index}
                          className={`w-3 h-3 rounded-full border-2 border-white ${index === currentImageIndex ? 'bg-blue-600' : 'bg-white/50'}`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white z-10"
                    onClick={() => setCurrentImageIndex((currentImageIndex - 1 + property.images.length) % property.images.length)}
                  >
                    {'<'}
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white z-10"
                    onClick={() => setCurrentImageIndex((currentImageIndex + 1) % property.images.length)}
                  >
                    {'>'}
                  </button>
                </>
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">No hay imágenes disponibles</p>
                </div>
              )}
            </div>
            {property.images && property.images.length > 1 && (
              <div className="flex gap-2 justify-center mt-2">
                {property.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Miniatura ${idx + 1}`}
                    className={`w-16 h-16 object-cover rounded-lg border-2 cursor-pointer transition-all duration-200 ${idx === currentImageIndex ? 'border-blue-600 scale-105' : 'border-gray-300 opacity-70 hover:opacity-100'}`}
                    onClick={() => setCurrentImageIndex(idx)}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
            {property.tipo_vivienda && (
              <div className="mb-2">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold mr-2">{property.tipo_vivienda}</span>
              </div>
            )}
            {property.zona && (
              <div className="flex items-center gap-2 text-gray-700 text-sm">
                <span className="font-semibold">Zona:</span> {property.zona}
              </div>
            )}
            {typeof property.lavabos === 'number' && (
              <div className="flex items-center gap-2 text-gray-700 text-sm">
                <span className="font-semibold">Lavabos:</span> {property.lavabos}
              </div>
            )}
            <div className="flex flex-wrap gap-6 items-center mb-2">
              <div className="flex items-center gap-2">
                <HiOutlineHome className="text-blue-500 w-5 h-5" />
                <span className="font-semibold">{property.bedrooms}</span>
                <span>Habitaciones</span>
              </div>
              <div className="flex items-center gap-2">
                <HiOutlineUser className="text-blue-500 w-5 h-5" />
                <span className="font-semibold">{property.bathrooms}</span>
                <span>Baños</span>
              </div>
              <div className="flex items-center gap-2">
                <HiOutlineDocumentText className="text-blue-500 w-5 h-5" />
                <span className="font-semibold">{property.area}</span>
                <span>m²</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-500">{property.location}</span>
              </div>
              <Badge className={getStatusColor(property.status)}>
                {formatStatus(property.status)}
              </Badge>
            </div>
          </div>
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Copropiedades</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[0,1,2,3].map(idx => {
                const status = shareStatus[idx];
                let bg = 'bg-gray-100 border-gray-300 text-gray-700';
                if (status === 'disponible') bg = 'bg-green-100 border-green-400 text-green-900';
                if (status === 'reservado') bg = 'bg-yellow-100 border-yellow-400 text-yellow-900';
                if (status === 'vendido') bg = 'bg-purple-200 border-purple-500 text-purple-900';
                return (
                  <div key={idx} className={`border rounded-lg p-3 flex flex-col items-center text-xs font-medium ${bg}`}>
                    <span className="text-[11px] font-normal text-center mb-1">{shareLabels[idx]}</span>
                    <span className="px-2 py-1 rounded text-xs font-semibold mb-1 capitalize">
                      {status ? status : 'Sin estado'}
                    </span>
                    <span className="text-blue-700 font-bold">€{(property.price/4).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Descripción</h2>
            <p className="text-gray-600 whitespace-pre-wrap mb-6">{property.description}</p>
            {property.features && property.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Características Destacadas</h3>
                <div className="grid grid-cols-2 gap-4">
                  {FEATURES.filter(f => property.features?.includes(f.key)).map(feature => (
                    <div key={feature.key} className="flex items-center gap-3 p-4 bg-white rounded-lg">
                      <div className="text-2xl">{feature.icon}</div>
                      <span className="font-medium">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {property.features_extra && property.features_extra.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Características ampliadas</h3>
                <div className="grid grid-cols-2 gap-4">
                  {property.features_extra.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 p-4 bg-white rounded-lg">
                      <span className="font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {property?.nearby_services && property.nearby_services.length > 0 && (
              <div id="servicios" className="bg-gray-50 rounded-lg p-6 scroll-mt-24">
                <h2 className="text-xl font-semibold mb-4">Servicios Cercanos</h2>
                <div className="grid grid-cols-2 gap-4">
                  {property.nearby_services.map((service) => {
                    const serviceInfo = NEARBY_SERVICES.find(s => s.key === service);
                    return (
                      <div key={service} className="flex items-center gap-3 p-4 bg-white rounded-lg">
                        {serviceInfo?.icon}
                        <span className="font-medium">{serviceInfo?.label || service}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Dirección en texto */}
            {property.location && (
              <div className="mb-4">
                <span className="font-semibold">Dirección: </span>
                <span className="text-gray-700">{property.location}</span>
              </div>
            )}
            {/* Mapa de Google Maps al final de la columna principal */}
            {isLoaded && coordinates && (
              <div className="w-full h-64 rounded-lg overflow-hidden border mt-6">
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={coordinates}
                  zoom={16}
                >
                  <Marker position={coordinates} />
                </GoogleMap>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 gap-8 font-poppins">
            <div>
              <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2">Agente asignado</h3>
                {agent ? (
                  <div>
                    <p className="font-medium">{agent.first_name} {agent.last_name}</p>
                    <p className="text-sm text-gray-600">Email: {agent.email}</p>
                    <p className="text-sm text-gray-600">Teléfono: {agent.phone}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No hay agente asignado</p>
                )}
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border font-poppins">
                <h3 className="text-lg font-semibold mb-4">Calculadora de Hipoteca</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Valor de la copropiedad</label>
                    <input type="number" name="value" value={mortgage.value} onChange={handleMortgageChange} className="w-full border rounded px-2 py-1" min={0} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Entrada inicial (20%)</label>
                    <input type="number" name="downPayment" value={mortgage.downPayment} onChange={handleMortgageChange} className="w-full border rounded px-2 py-1" min={0} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Interés (%)</label>
                    <input type="number" name="interest" value={mortgage.interest} onChange={handleMortgageChange} className="w-full border rounded px-2 py-1" min={0} step={0.01} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Plazo (años)</label>
                    <input type="number" name="years" value={mortgage.years} onChange={handleMortgageChange} className="w-full border rounded px-2 py-1" min={1} />
                  </div>
                </div>
                <div className="mt-4 bg-white rounded p-3 border">
                  <h4 className="font-semibold mb-2">Resultado</h4>
                  <MortgageResult mortgage={mortgage} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyDetail; 