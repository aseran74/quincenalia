import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Bed, Bath, Square, MapPin, Phone, Mail, Building, SquareArrowUp, Building2, Home, TreePalm } from 'lucide-react';
import { FaSwimmingPool, FaHotTub, FaChild, FaGamepad, FaUmbrellaBeach, FaParking, FaStore, FaHospital, 
  FaBus, FaSchool, FaUtensils, FaShoppingCart, FaMapMarkerAlt, FaImages, FaInfoCircle, 
  FaUserTie, FaSearch, FaArrowLeft, FaGlassCheers, FaTree, FaWater, FaShip, FaPrescriptionBottleAlt, FaUsers } from 'react-icons/fa';
import { GoogleMap, Marker } from '@react-google-maps/api';
import type { Property } from '@/types/property';
import ContactForm from '@/components/ContactForm';

const FEATURES = [
  { key: 'piscina_privada', label: 'Piscina privada', icon: <FaSwimmingPool className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" /> },
  { key: 'jacuzzi', label: 'Jacuzzi', icon: <FaHotTub className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" /> },
  { key: 'juegos_ninos', label: 'Juegos para niños', icon: <FaChild className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" /> },
  { key: 'videoconsolas', label: 'Videoconsolas', icon: <FaGamepad className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" /> },
  { key: 'acceso_playa', label: 'Acceso playa', icon: <FaUmbrellaBeach className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-500" /> },
  { key: 'parking_gratuito', label: 'Parking gratuito', icon: <FaParking className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" /> },
];

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

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"];

const PROPERTY_PERIODS = [
  { label: '1ª quincena Julio + 10 sem', key: 'share1' },
  { label: '2ª quincena Julio + 10 sem', key: 'share2' },
  { label: '1ª quincena Agosto + 10 sem', key: 'share3' },
  { label: '2ª quincena Agosto + 10 sem', key: 'share4' }
];

const SERVICE_ICONS: { [key: string]: React.ReactNode } = {
  playa_cercana: <FaUmbrellaBeach className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-500" />,
  supermercados: <FaShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />,
  vida_nocturna: <FaGlassCheers className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />,
  parques_naturales: <FaTree className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />,
  deportes_nauticos: <FaWater className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />,
  puerto_deportivo: <FaShip className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />,
  farmacias: <FaPrescriptionBottleAlt className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />,
  default: <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
};

function MortgageCalculator({ propertyPrice }: { propertyPrice: number }) {
  const sharePrice = useMemo(() => propertyPrice * 0.25, [propertyPrice]);
  const [mortgage, setMortgage] = useState<MortgageType>({
    value: sharePrice,
    downPayment: sharePrice * 0.3,
    interest: 2.1,
    years: 20,
    result: null
  });
  useEffect(() => {
    const calculateMortgage = () => {
      const loanAmount = mortgage.value - mortgage.downPayment;
      if (loanAmount <= 0 || mortgage.interest <= 0 || mortgage.years <= 0) {
          setMortgage(prev => ({ ...prev, result: null }));
          return;
      }
      const monthlyInterestRate = (mortgage.interest / 100) / 12;
      const numberOfPayments = mortgage.years * 12;
      let monthlyPayment: number;
      if (monthlyInterestRate === 0) {
          monthlyPayment = loanAmount / numberOfPayments;
      } else {
          monthlyPayment = loanAmount * monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));
      }
      const totalPayment = monthlyPayment * numberOfPayments;
      const totalInterest = totalPayment - loanAmount;
      if (isFinite(monthlyPayment) && isFinite(totalPayment) && isFinite(totalInterest)) {
          setMortgage(prev => ({
              ...prev,
              result: {
                  monthly: monthlyPayment,
                  total: totalPayment,
                  totalInterest: totalInterest
              }
          }));
      } else {
           setMortgage(prev => ({ ...prev, result: null }));
      }
    };
    calculateMortgage();
  }, [mortgage.value, mortgage.downPayment, mortgage.interest, mortgage.years]);
  useEffect(() => {
    const newSharePrice = propertyPrice * 0.25;
    setMortgage(prev => ({
      ...prev,
      value: newSharePrice,
      downPayment: newSharePrice * 0.3
    }));
  }, [propertyPrice]);
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        Cálculo basado en el precio de una copropiedad (<span className='font-medium'>{(sharePrice).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>)
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="mortgageValue" className="block text-xs sm:text-sm text-gray-600 mb-1">Precio Copropiedad (€)</label>
          <Input
            id="mortgageValue"
            type="number"
            value={mortgage.value}
            readOnly
            className="bg-gray-100"
          />
        </div>
        <div>
          <label htmlFor="downPayment" className="block text-xs sm:text-sm text-gray-600 mb-1">Entrada (30%) (€)</label>
          <Input
            id="downPayment"
            type="number"
            value={mortgage.downPayment}
            readOnly
            className="bg-gray-100"
          />
        </div>
        <div>
          <label htmlFor="interestRate" className="block text-xs sm:text-sm text-gray-600 mb-1">Interés Anual (%)</label>
          <Input
            id="interestRate"
            type="number"
            value={mortgage.interest}
            onChange={(e) => setMortgage(prev => ({ ...prev, interest: Number(e.target.value) || 0 }))}
            step="0.1"
            min="0"
          />
        </div>
        <div>
          <label htmlFor="loanTerm" className="block text-xs sm:text-sm text-gray-600 mb-1">Plazo (años)</label>
          <Input
            id="loanTerm"
            type="number"
            value={mortgage.years}
            onChange={(e) => setMortgage(prev => ({ ...prev, years: Number(e.target.value) || 0 }))}
            min="1"
          />
        </div>
      </div>
      {mortgage.result && mortgage.result.monthly > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm">
          <p className="text-base sm:text-lg font-semibold text-blue-700 mb-1">
            Cuota mensual: {mortgage.result.monthly.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-gray-700">Total a pagar: {mortgage.result.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
          <p className="text-gray-600">Total intereses: {mortgage.result.totalInterest.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
        </div>
      )}
       {mortgage.result && mortgage.result.monthly <= 0 && (
           <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-sm text-yellow-800">
               Revisa los datos introducidos para calcular la cuota.
        </div>
      )}
    </div>
  );
}

function isValidAgent(agent: any): agent is Property['agent'] {
  return agent && typeof agent === 'object' && 'id' in agent && 'first_name' in agent && 'last_name' in agent && 'email' in agent;
}

function useGoogleMaps(apiKey: string | undefined) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!apiKey) {
      console.warn("Google Maps API Key no proporcionada.");
      return;
    }
    if (window.google && window.google.maps) {
      setLoaded(true);
      return;
    }
    const scriptId = 'google-maps-script';
    if (document.getElementById(scriptId)) {
      return;
    }
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setLoaded(true);
    script.onerror = () => console.error("Error cargando Google Maps script.");
    document.body.appendChild(script);
  }, [apiKey]);
  return loaded;
}

const calculateMonthlyPayment = (totalPrice: number): number => {
  if (totalPrice <= 0) return 0;
  const sharePrice = totalPrice * 0.25;
  const downPayment = sharePrice * 0.3;
  const loanAmount = sharePrice - downPayment;
  if (loanAmount <= 0) return 0;
  const interestRate = 2.1 / 100 / 12;
  const numberOfPayments = 20 * 12;
  if (interestRate === 0) return loanAmount / numberOfPayments;
  const monthlyPayment = loanAmount * interestRate * Math.pow(1 + interestRate, numberOfPayments) / 
    (Math.pow(1 + interestRate, numberOfPayments) - 1);
  return isFinite(monthlyPayment) ? Math.round(monthlyPayment) : 0;
};

export const PropertyDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const mapsLoaded = useGoogleMaps(GOOGLE_MAPS_API_KEY);
  const [showContactForm, setShowContactForm] = useState(false);
  const contactFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapsLoaded && property?.location && !coordinates) {
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: property.location }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            setCoordinates({
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng(),
            });
          } else {
            console.warn(`Geocode no tuvo éxito para la dirección "${property.location}" por la siguiente razón: ${status}`);
          }
        });
      }
    }
  }, [mapsLoaded, property?.location, coordinates]);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const { data: propertyData, error } = await supabase
          .from('properties')
          .select(`
            *,
            agent:profiles ( * )
          `)
          .eq('id', id)
          .single();
        if (error) {
            if (error.code === 'PGRST116') {
                setProperty(null);
            } else {
                throw error;
            }
        } else if (propertyData) {
        const formattedProperty: Property = {
          ...propertyData,
          type: propertyData.tipo_vivienda || propertyData.type || '',
          agent: isValidAgent(propertyData.agent) ? propertyData.agent : null,
          latitude: typeof propertyData.latitude === 'number' ? propertyData.latitude : null,
          longitude: typeof propertyData.longitude === 'number' ? propertyData.longitude : null,
          images: Array.isArray(propertyData.images) ? propertyData.images : [],
          features: Array.isArray(propertyData.features) ? propertyData.features : [],
          nearby_services: Array.isArray(propertyData.nearby_services) ? propertyData.nearby_services : [],
          location: propertyData.location || 'Ubicación no especificada',
          share1_price: propertyData.share1_price ?? null,
          share1_status: propertyData.share1_status ?? null,
          share2_price: propertyData.share2_price ?? null,
          share2_status: propertyData.share2_status ?? null,
          share3_price: propertyData.share3_price ?? null,
          share3_status: propertyData.share3_status ?? null,
          share4_price: propertyData.share4_price ?? null,
          share4_status: propertyData.share4_status ?? null,
        };
        setProperty(formattedProperty);
        } else {
            setProperty(null);
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProperty();
    } else {
        setLoading(false);
        setProperty(null);
    }
  }, [id]);

  const nextImage = () => {
    if (property?.images && property.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images!.length);
    }
  };
  const previousImage = () => {
    if (property?.images && property.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images!.length) % property.images!.length);
    }
  };
  const handleContactClick = () => {
    setShowContactForm(true);
    setTimeout(() => {
        contactFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/4 bg-gray-200 rounded mb-6"></div>
          <div className="h-[300px] sm:h-[400px] lg:h-[500px] bg-gray-200 rounded-lg mb-4" />
          <div className="h-6 w-3/4 mx-auto bg-gray-200 rounded mb-2" />
          <div className="h-6 w-1/4 mx-auto bg-gray-200 rounded mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded"/>
              <div className="h-40 bg-gray-200 rounded"/>
              <div className="h-48 bg-gray-200 rounded"/>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded"/>
              <div className="h-64 bg-gray-200 rounded"/>
              <div className="h-56 bg-gray-200 rounded"/>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
         <Button variant="outline" onClick={() => navigate('/')} className="mb-6">
           <FaArrowLeft className="mr-2 h-4 w-4" /> Volver a la búsqueda
         </Button>
        <h1 className="text-2xl font-bold text-red-600">Propiedad no encontrada</h1>
        <p className="text-gray-600 mt-2">La propiedad que buscas no existe o no está disponible.</p>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
       <div className="mb-4 sm:mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/propiedades')}
              className="flex items-center gap-2 text-sm"
            >
              <FaArrowLeft className="w-3 h-3" />
              <span>Volver a Propiedades</span>
            </Button>
       </div>
      <Card className="overflow-hidden shadow-lg">
         <div id="galeria" className="relative group">
              {property.images && property.images.length > 0 ? (
            <>
                <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
                <img
                  src={property.images[currentImageIndex]}
                  alt={`${property.title} - Imagen ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                </div>
                {property.images.length > 1 && (
                <>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={previousImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Imagen anterior"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Siguiente imagen"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </>
                )}
                {/* Miniaturas debajo de la imagen principal */}
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2" style={{scrollBehavior: 'smooth'}}>
                {property.images.map((image, index) => (
                  <button
                    key={index}
                      onClick={() => {
                        setCurrentImageIndex(index);
                        // Hacer scroll automático a la miniatura seleccionada
                        setTimeout(() => {
                          const thumb = document.getElementById(`miniatura-${index}`);
                          thumb?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                        }, 50);
                      }}
                      id={`miniatura-${index}`}
                      className={`relative h-16 w-24 flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all duration-200 ${index === currentImageIndex ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'}`}
                      aria-label={`Miniatura ${index + 1}`}
                  >
                    <img
                      src={image}
                        alt={`Miniatura ${index + 1}`}
                        className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </>
            ) : (
                <div className="w-full h-[250px] sm:h-[350px] bg-gray-200 flex items-center justify-center rounded-t-lg">
                    <FaImages className="w-12 h-12 text-gray-400" />
                    <p className="ml-2 text-gray-500">No hay imágenes disponibles</p>
                </div>
            )}
          </div>
         <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            <div className="border-b pb-4 sm:pb-6">
                 <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-gray-800">{property.title}</h1>
                 <p className="text-base sm:text-lg text-gray-500 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-gray-400"/>
                    {property.location}
                 </p>
                 <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {property.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                 </p>
                 {/* Precio de la hipoteca (cuota mensual) */}
                 <p className="text-base sm:text-lg font-semibold text-blue-700 mt-1">
                    {calculateMonthlyPayment(property.price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span className="text-gray-500 font-normal">/mes*</span>
            </p>
          </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                    <div id="caracteristicas" className="bg-gray-50 rounded-lg p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700">Detalles Principales</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                            <div className="text-center p-3 bg-white rounded-lg border flex flex-col items-center justify-center">
                                {(() => {
                                  // Iconos para tipos de vivienda
                                  const typeIcons: { [key: string]: React.ReactNode } = {
                                    'Piso': <Building className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 mb-1" />,
                                    'Ático': <SquareArrowUp className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 mb-1" />,
                                    'Dúplex': <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 mb-1" />,
                                    'Casa independiente': <Home className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 mb-1" />,
                                    'Casa pareada': <Home className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 mb-1" />,
                                    'Casa adosada': <Home className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 mb-1" />,
                                    'Casa rústica': <TreePalm className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 mb-1" />,
                                  };
                                  return typeIcons[property.type || ''] || <Home className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 mb-1" />;
                                })()}
                                <p className="text-xs sm:text-sm text-gray-600">Tipo</p>
                                <p className="text-base sm:text-lg font-semibold capitalize">{property.type || 'N/A'}</p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg border flex flex-col items-center justify-center">
                                <Bed className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500 mb-1" />
                                <p className="text-xs sm:text-sm text-gray-600">Hab.</p>
                                <p className="text-base sm:text-lg font-semibold">{property.bedrooms}</p>
                        </div>
                            <div className="text-center p-3 bg-white rounded-lg border flex flex-col items-center justify-center">
                                <Bath className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500 mb-1" />
                                <p className="text-xs sm:text-sm text-gray-600">Baños</p>
                                <p className="text-base sm:text-lg font-semibold">{property.bathrooms}</p>
                      </div>
                            <div className="text-center p-3 bg-white rounded-lg border flex flex-col items-center justify-center">
                                <Square className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500 mb-1" />
                                <p className="text-xs sm:text-sm text-gray-600">Área</p>
                                <p className="text-base sm:text-lg font-semibold">{property.area} m²</p>
                  </div>
                </div>
              </div>
                    <div id="descripcion" className="bg-gray-50 rounded-lg p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-700">Descripción</h2>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{property.description || "No hay descripción disponible."}</p>
              </div>
              {property.features && property.features.length > 0 && (
                        <div id="features" className="bg-gray-50 rounded-lg p-4 sm:p-6">
                            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700">Características Destacadas</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {FEATURES.filter(f => property.features?.includes(f.key)).map(feature => (
                                <div key={feature.key} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                    {feature.icon}
                                    <span className="text-sm sm:text-base font-medium text-gray-700">{feature.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {property.nearby_services && property.nearby_services.length > 0 && (
                        <div id="servicios" className="bg-gray-50 rounded-lg p-4 sm:p-6">
                            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700">Servicios Cercanos</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {property.nearby_services.map((service) => (
                                <div key={service} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                    {SERVICE_ICONS[service] || SERVICE_ICONS.default}
                                    <span className="text-sm sm:text-base font-medium capitalize text-gray-700">{service.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
                    <div id="ubicacion" className="bg-gray-50 rounded-lg p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-700">Ubicación</h2>
                        <p className="text-sm sm:text-base text-gray-600 mb-4">{property.location}</p>
                        <div className="h-[300px] sm:h-[400px] w-full rounded-lg overflow-hidden border">
                            {mapsLoaded ? (
                                coordinates ? (
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={coordinates}
                                    zoom={15}
                      options={{
                        zoomControl: true,
                                        streetViewControl: false,
                                        mapTypeControl: false,
                        fullscreenControl: true,
                      }}
                    >
                                    <Marker position={coordinates} 
                                      icon={{
                                        url: '/custom-marker.svg',
                                        scaledSize: new window.google.maps.Size(40, 40),
                                      }}
                                    />
                    </GoogleMap>
                                ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                                    <p className="text-gray-500 text-sm">No se pudo obtener la ubicación exacta.</p>
                  </div>
                                )
                ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-100 animate-pulse">
                                    <p className="text-gray-500 text-sm">Cargando mapa...</p>
                  </div>
                )}
              </div>
            </div>
                </div>
                <div className="lg:col-span-1 space-y-6 sm:space-y-8">
                    <div id="copropiedades" className="bg-gray-50 rounded-lg p-4 sm:p-6 scroll-mt-20">
                        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700">Copropiedades Disponibles</h2>
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
                          {PROPERTY_PERIODS.map(period => {
                            const price = property[`${period.key}_price` as keyof Property] as number | null;
                            const status = property[`${period.key}_status` as keyof Property] as string | null;
                    const monthlyPayment = calculateMonthlyPayment(property.price);
                    return (
                              <div key={period.key} className={`p-3 border rounded-lg flex flex-col items-center text-center ${status === 'vendida' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                                <span className="text-xs sm:text-sm font-medium text-gray-700 mb-1 leading-tight">{period.label}</span>
                                {price !== null && price !== undefined ? (
                                  <span className="text-base sm:text-lg font-bold text-gray-800 mb-0.5">
                                    {price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                          </span>
                                ) : (
                                    <span className="text-base sm:text-lg font-bold text-gray-400 mb-0.5">-</span>
                                )}
                                {monthlyPayment > 0 && status !== 'vendida' && (
                                  <span className="text-xs sm:text-sm text-blue-600 font-semibold">
                                    {monthlyPayment.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 })}/mes*
                          </span>
                                )}
                                <span className={`text-xs sm:text-sm font-semibold mt-1.5 ${
                                  status === 'vendida' ? 'text-red-600' : 'text-green-600'
                        }`}>
                                  {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Disponible'}
                        </span>
                      </div>
                    );
                  })}
                </div>
                        <p className="text-xs text-gray-500 mt-3 text-center">* Cuota mensual estimada (hipoteca a 20 años, 30% entrada).</p>
              </div>
                    <div id="hipoteca" className="bg-gray-50 rounded-lg p-4 sm:p-6 scroll-mt-20">
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-700">Calculadora Hipoteca</h2>
                <MortgageCalculator propertyPrice={property.price} />
              </div>
                    <div id="agente" className="bg-gray-50 rounded-lg p-4 sm:p-6 scroll-mt-20">
                        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700">Contactar Agente</h2>
                        {property.agent ? (
                            <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
                                {property.agent.photo_url ? (
                        <img
                          src={property.agent.photo_url}
                          alt={`${property.agent.first_name} ${property.agent.last_name}`}
                                    className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0"
                        />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                        <FaUserTie className="w-10 h-10 text-gray-400"/>
                                    </div>
                      )}
                                <div className="text-center sm:text-left">
                                    <h3 className="font-semibold text-base sm:text-lg text-gray-800">
                          {property.agent.first_name} {property.agent.last_name}
                        </h3>
                                    <div className="text-xs sm:text-sm text-gray-600 mt-1 space-y-0.5">
                                        <a href={`mailto:${property.agent.email}`} className="flex items-center gap-1.5 hover:text-blue-600 justify-center sm:justify-start">
                                            <Mail className="w-3 h-3 sm:w-4 sm:h-4"/>
                            {property.agent.email}
                          </a>
                        {property.agent.phone && (
                                            <a href={`tel:${property.agent.phone}`} className="flex items-center gap-1.5 hover:text-blue-600 justify-center sm:justify-start">
                                                <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                              {property.agent.phone}
                            </a>
                        )}
                      </div>
                    </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 mb-4">No hay información del agente disponible.</p>
                    )}
                        {!showContactForm && property.agent?.id && (
                             <Button onClick={handleContactClick} className="w-full">
                                Enviar Mensaje
                             </Button>
                    )}
                        <div ref={contactFormRef} className={`border-t pt-6 mt-6 ${showContactForm ? 'block' : 'hidden'}`}>
                             <h3 className="text-base sm:text-lg font-medium mb-4 text-gray-700">Enviar mensaje al agente</h3>
                  <ContactForm 
                                agentId={property.agent?.id}
                                propertyId={property.id}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PropertyDetail; 