import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft, ChevronRight, Bed, Bath, Square, MapPin, Phone, Mail, Building, SquareArrowUp,
  Building2, Home, TreePalm, X, Wind, Archive, // Elevator es ejemplo, puedes buscar uno mejor o usar FaRegBuilding
  // He quitado Elevator de aquí ya que no es estándar en lucide-react, usa Building u otro
} from 'lucide-react';
import {
  FaSwimmingPool, FaHotTub, FaChild, FaGamepad, FaUmbrellaBeach, FaParking, FaStore, FaHospital,
  FaBus, FaSchool, FaUtensils, FaShoppingCart, FaMapMarkerAlt, FaImages, FaInfoCircle,
  FaUserTie, FaSearch, FaArrowLeft, FaGlassCheers, FaTree, FaWater, FaShip, FaPrescriptionBottleAlt,
  FaUsers, FaSnowflake,
  // FaRegBuilding // Ejemplo para ascensor si prefieres Fa
} from 'react-icons/fa';
import { GoogleMap, Marker } from '@react-google-maps/api';
import type { Property } from '@/types/property'; // Asegúrate de que esta ruta sea correcta
import ContactForm from '@/components/ContactForm'; // Asegúrate de que esta ruta sea correcta

// --- CONSTANTE FEATURES ACTUALIZADA ---
const FEATURES = [
  // Basado en tu lista: ["Piscina", "Jardín", "Garaje", "Trastero", "Ascensor", "Aire acondicionado", "Balcón", "Terraza", "Vistas al mar", "Vivienda accesible", "Vivienda de lujo", "Exterior", "Armarios empotrados"]
  { key: 'Piscina', label: 'Piscina', icon: <FaSwimmingPool className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" /> },
  { key: 'Jardín', label: 'Jardín', icon: <FaTree className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" /> },
  { key: 'Garaje', label: 'Garaje', icon: <FaParking className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" /> },
  { key: 'Trastero', label: 'Trastero', icon: <Archive className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" /> },
  { key: 'Ascensor', label: 'Ascensor', icon: <Building className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" /> }, // Puedes usar un icono más específico si lo encuentras
  { key: 'Aire acondicionado', label: 'Aire acondicionado', icon: <FaSnowflake className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" /> },
  { key: 'Balcón', label: 'Balcón', icon: <Home className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" /> }, // Cambia 'Home' por un icono más adecuado si es necesario
  { key: 'Terraza', label: 'Terraza', icon: <FaUmbrellaBeach className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" /> }, // Quizás un icono de sol o similar
  { key: 'Vistas al mar', label: 'Vistas al mar', icon: <FaWater className="w-5 h-5 sm:w-6 sm:h-6 text-teal-500" /> },
  { key: 'Vivienda accesible', label: 'Vivienda accesible', icon: <FaUsers className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" /> }, // Ajusta el icono según veas
  { key: 'Vivienda de lujo', label: 'Vivienda de lujo', icon: <FaInfoCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" /> }, // Ajusta el icono
  { key: 'Exterior', label: 'Exterior', icon: <FaTree className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" /> }, // Podría ser similar a Jardín o diferente
  { key: 'Armarios empotrados', label: 'Armarios empotrados', icon: <Archive className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" /> }, // Ajusta si Archive es ambiguo

  // Características originales que tenías (si todavía las usas en Supabase con estos 'key'):
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
// const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"]; // No parece usarse explícitamente más allá del script de carga

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
      // Script ya existe o está en proceso de carga
      // Podrías añadir un listener para su 'load' si aún no ha cargado
      if (window.google && window.google.maps) setLoaded(true);
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

    // Cleanup: remover el script si el componente se desmonta antes de que cargue
    return () => {
        const existingScript = document.getElementById(scriptId);
        if (existingScript && !loaded) { // Solo remover si no llegó a cargar y el componente se desmonta
           // document.body.removeChild(existingScript); // Comentado porque puede dar problemas si otro componente lo usa
        }
    };
  }, [apiKey, loaded]);
  return loaded;
}

const calculateMonthlyPayment = (totalPrice: number): number => {
  if (totalPrice <= 0) return 0;
  const sharePrice = totalPrice * 0.25; // Esto es confuso si totalPrice ya es el precio de la parte.
                                        // Si totalPrice es el precio TOTAL de la propiedad, está bien.
                                        // Si totalPrice es el precio de UNA PARTE, entonces no se multiplica por 0.25.
                                        // Voy a asumir que totalPrice es el precio TOTAL de la propiedad aquí.
  const downPayment = sharePrice * 0.3;
  const loanAmount = sharePrice - downPayment;
  if (loanAmount <= 0) return 0;
  const interestRate = 2.1 / 100 / 12; // 2.1% annual interest
  const numberOfPayments = 20 * 12; // 20 years
  if (interestRate === 0) return loanAmount / numberOfPayments;
  const monthlyPayment = loanAmount * interestRate * Math.pow(1 + interestRate, numberOfPayments) /
    (Math.pow(1 + interestRate, numberOfPayments) - 1);
  return isFinite(monthlyPayment) ? Math.round(monthlyPayment) : 0;
};

// Helper para obtener el precio de copropiedad más bajo o el total/4 si no hay ninguno
function getMinSharePrice(property) {
  const shares = [property.share1_price, property.share2_price, property.share3_price, property.share4_price].filter(p => typeof p === 'number' && p > 0);
  if (shares.length > 0) return Math.min(...shares);
  if (property.price && typeof property.price === 'number' && property.price > 0) {
    return property.price / 4;
  }
  return null;
}

function getSharePrice(property, idx) {
  const price = property[`share${idx+1}_price`];
  if (typeof price === 'number' && price > 0) return price;
  if (property.price && typeof property.price === 'number' && property.price > 0) {
    return property.price / 4;
  }
  return null;
}

function getMonthlyPayment(price) {
  if (!price || price <= 0) return null;
  // Hipoteca a 25 años, 3% interés, 80% financiación
  const principal = price * 0.8;
  const years = 25;
  const interest = 0.03;
  const n = years * 12;
  const monthlyRate = interest / 12;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
}

export const PropertyDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const mapsLoaded = useGoogleMaps(GOOGLE_MAPS_API_KEY);
  const [showContactForm, setShowContactForm] = useState(false);
  const contactFormRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const miniaturasRef = useRef<HTMLDivElement>(null);
  let touchStartX = 0;
  let scrollStartX = 0;

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX = e.touches[0].clientX;
    if (miniaturasRef.current) {
      scrollStartX = miniaturasRef.current.scrollLeft;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (miniaturasRef.current) {
      const touchX = e.touches[0].clientX;
      miniaturasRef.current.scrollLeft = scrollStartX - (touchX - touchStartX);
    }
  };

  let modalTouchStartX = 0;
  let modalTouchEndX = 0;

  const handleModalTouchStart = (e: React.TouchEvent<HTMLImageElement>) => {
    modalTouchStartX = e.touches[0].clientX;
  };

  const handleModalTouchMove = (e: React.TouchEvent<HTMLImageElement>) => {
    modalTouchEndX = e.touches[0].clientX;
  };

  const handleModalTouchEnd = () => {
    if (property?.images && property.images.length > 1) { // Evitar error si no hay imágenes o solo una
        if (modalTouchStartX - modalTouchEndX > 50) { // Swipe left
          nextModalImage();
        } else if (modalTouchEndX - modalTouchStartX > 50) { // Swipe right
          prevModalImage();
        }
    }
    modalTouchStartX = 0;
    modalTouchEndX = 0;
  };

  useEffect(() => {
    if (mapsLoaded && property?.location && !coordinates) {
      if (window.google && window.google.maps && window.google.maps.Geocoder) {
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
      } else {
        console.warn("Google Maps Geocoder no está disponible aún.");
      }
    }
  }, [mapsLoaded, property?.location, coordinates, property]); // Añadido property para re-evaluar si property cambia

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
            if (error.code === 'PGRST116') { // Not found
                setProperty(null);
            } else {
                console.error('Error fetching property data:', error);
                throw error;
            }
        } else if (propertyData) {
          const formattedProperty: Property = {
            ...propertyData,
            id: propertyData.id, // Asegurarse de que el id esté
            title: propertyData.title || 'Propiedad sin título',
            price: propertyData.price || 0,
            bedrooms: propertyData.bedrooms || 0,
            bathrooms: propertyData.bathrooms || 0,
            area: propertyData.area || 0,
            type: propertyData.tipo_vivienda || propertyData.type || 'N/A',
            agent: isValidAgent(propertyData.agent) ? propertyData.agent : null,
            latitude: typeof propertyData.latitude === 'number' ? propertyData.latitude : null,
            longitude: typeof propertyData.longitude === 'number' ? propertyData.longitude : null,
            images: Array.isArray(propertyData.images) ? propertyData.images : [],
            features: Array.isArray(propertyData.features) ? propertyData.features : [],
            nearby_services: Array.isArray(propertyData.nearby_services) ? propertyData.nearby_services : [],
            location: propertyData.location || 'Ubicación no especificada',
            description: propertyData.description || '',
            share1_price: propertyData.share1_price ?? null,
            share1_status: propertyData.share1_status ?? null,
            share2_price: propertyData.share2_price ?? null,
            share2_status: propertyData.share2_status ?? null,
            share3_price: propertyData.share3_price ?? null,
            share3_status: propertyData.share3_status ?? null,
            share4_price: propertyData.share4_price ?? null,
            share4_status: propertyData.share4_status ?? null,
            // Añade cualquier otro campo que esperes en tu tipo Property
          };
          setProperty(formattedProperty);
        } else {
            setProperty(null); // No data found
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
        setProperty(null); // No ID provided
    }
  }, [id]);


  const handleContactClick = () => {
    setShowContactForm(true);
    setTimeout(() => {
        contactFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const openModal = (index: number) => {
    if (property?.images && index >= 0 && index < property.images.length) { // Chequeo de índice más robusto
        setModalImageIndex(index);
        setIsModalOpen(true);
    } else {
      console.warn("Intento de abrir modal con índice inválido o sin imágenes:", index, property?.images);
    }
  };
  const closeModal = () => setIsModalOpen(false);

  const nextModalImage = () => {
    if (!property?.images || property.images.length === 0) return;
    setModalImageIndex((prev) => (prev + 1) % property.images!.length);
  };
  const prevModalImage = () => {
    if (!property?.images || property.images.length === 0) return;
    setModalImageIndex((prev) => (prev - 1 + property.images!.length) % property.images!.length);
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

  const monthlyPaymentForTitle = calculateMonthlyPayment(property.price);

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
         {/* Sección Galería */}
         <div id="galeria" className="relative group mb-6 p-4">
              {property.images && property.images.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 lg:gap-4">
                  <div className="col-span-1 lg:col-span-2 row-span-2 cursor-pointer" onClick={() => openModal(0)}>
                    <img
                      src={property.images[0]}
                      alt={`${property.title} - Imagen principal`}
                      className="w-full h-[250px] sm:h-[350px] lg:h-[500px] object-cover rounded-lg shadow-md"
                    />
                  </div>
                  <div className="col-span-1 lg:col-span-3 grid grid-cols-2 gap-2 lg:gap-4">
                    <img
                      src={property.images[1] || property.images[0]}
                      alt={`${property.title} - Imagen secundaria 1`}
                      className="w-full h-[120px] sm:h-[170px] lg:h-[245px] object-cover rounded-lg shadow cursor-pointer"
                      onClick={() => openModal(1)}
                    />
                    <img
                      src={property.images[2] || property.images[0]}
                      alt={`${property.title} - Imagen secundaria 2`}
                      className="w-full h-[120px] sm:h-[170px] lg:h-[245px] object-cover rounded-lg shadow cursor-pointer"
                      onClick={() => openModal(2)}
                    />
                  </div>
                  <div className="col-span-1 lg:col-span-3 mt-1 lg:-mt-0">
                    <img
                      src={property.images[3] || property.images[0]}
                      alt={`${property.title} - Imagen secundaria 3`}
                      className="w-full h-[120px] sm:h-[170px] lg:h-[245px] object-cover rounded-lg shadow cursor-pointer"
                      onClick={() => openModal(3)}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full h-[250px] sm:h-[350px] bg-gray-200 flex items-center justify-center rounded-lg">
                    <FaImages className="w-12 h-12 text-gray-400" />
                    <p className="ml-2 text-gray-500">No hay imágenes disponibles</p>
                </div>
              )}
              {property.images && property.images.length > 4 && (
                <div
                  className="flex gap-2 mt-3 overflow-x-auto pb-2"
                  style={{scrollBehavior: 'smooth'}}
                  ref={miniaturasRef}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                >
                  {property.images.slice(4).map((image, index) => (
                    <button
                      key={`thumb-${index+4}`}
                      onClick={() => openModal(index+4)}
                      id={`miniatura-${index+4}`}
                      className="relative h-16 w-24 flex-shrink-0 border-2 border-white hover:border-blue-500 rounded-lg overflow-hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`Miniatura ${index+5}`}
                    >
                      <img
                        src={image}
                        alt={`Miniatura ${index+5}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
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
                 {monthlyPaymentForTitle > 0 && (
                    <p className="text-base sm:text-lg font-semibold text-blue-700 mt-1">
                        {monthlyPaymentForTitle.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span className="text-gray-500 font-normal">/mes*</span>
                    </p>
                 )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Columna Izquierda (Detalles, Descripción, Características, etc.) */}
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                    <div id="detallesPrincipales" className="bg-gray-50 rounded-lg p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700">Detalles Principales</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          <div className="text-center p-3 bg-white rounded-lg border flex flex-col items-center justify-center">
                            {(() => {
                              const typeIcons: { [key: string]: React.ReactNode } = {
                                'Piso': <Building className="w-6 h-6 sm:w-7 sm:h-7 text-primary mb-1" />,
                                'Ático': <SquareArrowUp className="w-6 h-6 sm:w-7 sm:h-7 text-primary mb-1" />,
                                'Dúplex': <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-primary mb-1" />,
                                'Casa independiente': <Home className="w-6 h-6 sm:w-7 sm:h-7 text-primary mb-1" />,
                                'Casa pareada': <Home className="w-6 h-6 sm:w-7 sm:h-7 text-primary mb-1" />,
                                'Casa adosada': <Home className="w-6 h-6 sm:w-7 sm:h-7 text-primary mb-1" />,
                                'Casa rústica': <TreePalm className="w-6 h-6 sm:w-7 sm:h-7 text-primary mb-1" />,
                              };
                              return typeIcons[property.type || ''] || <Home className="w-6 h-6 sm:w-7 sm:h-7 text-primary mb-1" />;
                            })()}
                            <p className="text-xs sm:text-sm text-gray-600">Tipo</p>
                            <p className="text-base sm:text-lg font-semibold capitalize">{property.type || 'N/A'}</p>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg border flex flex-col items-center justify-center">
                            <Bed className="w-6 h-6 sm:w-7 sm:h-7 text-primary mb-1" />
                            <p className="text-xs sm:text-sm text-gray-600">Hab.</p>
                            <p className="text-base sm:text-lg font-semibold">{property.bedrooms}</p>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg border flex flex-col items-center justify-center">
                            <Bath className="w-6 h-6 sm:w-7 sm:h-7 text-primary mb-1" />
                            <p className="text-xs sm:text-sm text-gray-600">Baños</p>
                            <p className="text-base sm:text-lg font-semibold">{property.bathrooms}</p>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg border flex flex-col items-center justify-center">
                            <Square className="w-6 h-6 sm:w-7 sm:h-7 text-primary mb-1" />
                            <p className="text-xs sm:text-sm text-gray-600">Área</p>
                            <p className="text-base sm:text-lg font-semibold">{property.area} m²</p>
                          </div>
                        </div>
                    </div>

                    <div id="descripcion" className="bg-gray-50 rounded-lg p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-700">Descripción</h2>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-wrap">{property.description || "No hay descripción disponible."}</p>
                    </div>

                    {/* --- SECCIÓN DE CARACTERÍSTICAS --- */}
                    {property.features && property.features.length > 0 && (
                        <div id="features" className="bg-gray-50 rounded-lg p-4 sm:p-6">
                            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700">Características Destacadas</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {FEATURES.filter(f => property.features!.includes(f.key)).map(feature => (
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
                                                url: '/custom-marker.svg', // Asegúrate que este SVG exista en tu carpeta public
                                                scaledSize: new window.google.maps.Size(40, 40),
                                            }}
                                        />
                                    </GoogleMap>
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gray-100">
                                        <p className="text-gray-500 text-sm">{(property.latitude && property.longitude) ? "Obteniendo ubicación exacta..." : "No se pudo obtener la ubicación exacta."}</p>
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

                {/* Columna Derecha (Copropiedades, Hipoteca, Agente) */}
                <div className="lg:col-span-1 space-y-6 sm:space-y-8">
                    <div id="copropiedades" className="bg-gray-50 rounded-lg p-4 sm:p-6 scroll-mt-20">
                        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700">Copropiedades Disponibles</h2>
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
                            {PROPERTY_PERIODS.map((period, idx) => {
                                const price = getSharePrice(property, idx);
                                const status = property[`${period.key}_status`] as string | null | undefined;

                                // Calcular cuota mensual para ESTA copropiedad si tiene precio
                                let monthlyPaymentForShare = 0;
                                if (typeof price === 'number' && price > 0) {
                                    monthlyPaymentForShare = getMonthlyPayment(price);
                                }

                                return (
                                    <div key={period.key} className={`p-3 border rounded-lg flex flex-col items-center text-center ${status === 'vendida' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                                        <span className="text-xs sm:text-sm font-medium text-gray-700 mb-1 leading-tight">{period.label}</span>
                                        {typeof price === 'number' && price > 0 ? (
                                            <span className="text-base sm:text-lg font-bold text-gray-800 mb-0.5">
                                                {price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                            </span>
                                        ) : (
                                            <span className="text-base sm:text-lg font-bold text-gray-400 mb-0.5">-</span>
                                        )}
                                        {monthlyPaymentForShare > 0 && status !== 'vendida' && typeof price === 'number' && price > 0 &&(
                                            <span className="text-xs sm:text-sm text-blue-600 font-semibold">
                                                {monthlyPaymentForShare.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 })}/mes*
                                            </span>
                                        )}
                                        <span className={`text-xs sm:text-sm font-semibold mt-1.5 ${status === 'vendida' ? 'text-red-600' : (status ? 'text-green-600' : 'text-yellow-600')}`}>
                                            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Consultar'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-xs text-gray-500 mt-3 text-center">* Cuota mensual estimada (hipoteca a 20 años, 30% entrada sobre el precio de la copropiedad). Se calcula sobre el precio de la copropiedad multiplicado por 4 para obtener el precio total de la vivienda.</p>
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

      {/* Modal/Carrusel de imágenes */}
      {isModalOpen && property.images && property.images.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <button onClick={closeModal} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white bg-black/60 rounded-full p-2 hover:bg-black/80 z-[51]">
            <X className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
          {property.images.length > 1 && ( // Solo mostrar botones si hay más de una imagen
            <>
            <button onClick={prevModalImage} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white bg-black/60 rounded-full p-2 hover:bg-black/80 z-[51]">
                <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>
            <button onClick={nextModalImage} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white bg-black/60 rounded-full p-2 hover:bg-black/80 z-[51]">
                <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>
            </>
          )}
          <div className="relative w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center">
            <img
              src={property.images[modalImageIndex]}
              alt={`Imagen ${modalImageIndex+1} de ${property.title}`}
              className="block max-h-full max-w-full rounded-xl shadow-2xl border-4 border-white object-contain"
              onTouchStart={handleModalTouchStart}
              onTouchMove={handleModalTouchMove}
              onTouchEnd={handleModalTouchEnd}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;