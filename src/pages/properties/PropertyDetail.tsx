import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Bed, Bath, Square } from 'lucide-react';
import { FaSwimmingPool, FaHotTub, FaChild, FaGamepad, FaUmbrellaBeach, FaParking, FaStore, FaHospital, 
  FaBus, FaSchool, FaUtensils, FaShoppingCart, FaMapMarkerAlt, FaHome, FaImages, FaInfoCircle, 
  FaUserTie, FaSearch, FaArrowLeft, FaGlassCheers, FaTree, FaWater, FaShip, FaPrescriptionBottleAlt, FaUsers, FaPhone } from 'react-icons/fa';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import type { Property } from '@/types/property';
import ContactForm from '@/components/ContactForm';

const FEATURES = [
  { key: 'piscina_privada', label: 'Piscina privada', icon: <FaSwimmingPool className="w-6 h-6 text-blue-500" /> },
  { key: 'jacuzzi', label: 'Jacuzzi', icon: <FaHotTub className="w-6 h-6 text-pink-500" /> },
  { key: 'juegos_ninos', label: 'Juegos para niños', icon: <FaChild className="w-6 h-6 text-yellow-500" /> },
  { key: 'videoconsolas', label: 'Videoconsolas', icon: <FaGamepad className="w-6 h-6 text-green-500" /> },
  { key: 'acceso_playa', label: 'Acceso playa', icon: <FaUmbrellaBeach className="w-6 h-6 text-cyan-500" /> },
  { key: 'parking_gratuito', label: 'Parking gratuito', icon: <FaParking className="w-6 h-6 text-gray-700" /> },
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

// Mover las constantes fuera del componente
const GOOGLE_MAPS_API_KEY = "AIzaSyBy4MuV_fOnPJF-WoxQbBlnKj8dMF6KuxM";
const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"];

const PROPERTY_PERIODS = [
  { label: '1ª quincena Julio + 10 sem', key: 'share1' },
  { label: '2ª quincena Julio + 10 sem', key: 'share2' },
  { label: '1ª quincena Agosto + 10 sem', key: 'share3' },
  { label: '2ª quincena Agosto + 10 sem', key: 'share4' }
];

// Mapeo de servicios cercanos a iconos
const SERVICE_ICONS = {
  playa_cercana: <FaUmbrellaBeach className="w-6 h-6 text-cyan-500" />,
  supermercados: <FaShoppingCart className="w-6 h-6 text-green-500" />,
  vida_nocturna: <FaGlassCheers className="w-6 h-6 text-purple-500" />,
  parques_naturales: <FaTree className="w-6 h-6 text-green-600" />,
  deportes_nauticos: <FaWater className="w-6 h-6 text-blue-500" />,
  puerto_deportivo: <FaShip className="w-6 h-6 text-blue-600" />,
  farmacias: <FaPrescriptionBottleAlt className="w-6 h-6 text-red-500" />,
};

function MortgageCalculator({ propertyPrice }: { propertyPrice: number }) {
  // Calculamos el precio de una copropiedad (25% del total)
  const sharePrice = propertyPrice * 0.25;
  
  const [mortgage, setMortgage] = useState<MortgageType>({
    value: sharePrice,
    downPayment: sharePrice * 0.3, // 30% entrada inicial por defecto
    interest: 2.1,
    years: 20,
    result: null
  });

  // Calcular automáticamente al montar el componente y cuando cambie el precio
  useEffect(() => {
    const newSharePrice = propertyPrice * 0.25;
    setMortgage(prev => ({
      ...prev,
      value: newSharePrice,
      downPayment: newSharePrice * 0.3
    }));
  }, [propertyPrice]);

  useEffect(() => {
    calculateMortgage();
  }, [mortgage.value, mortgage.downPayment]);

  const calculateMortgage = () => {
    const l = mortgage.value - mortgage.downPayment;
    const r = (mortgage.interest / 100) / 12;
    const n = mortgage.years * 12;
    const P = l * r / (1 - Math.pow(1 + r, -n));
    const total = P * n;
    const totalInterest = total - l;

    setMortgage(prev => ({
      ...prev,
      result: {
        monthly: P,
        total: total,
        totalInterest: totalInterest
      }
    }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Calculadora de Hipoteca</h3>
      <p className="text-sm text-gray-600 mb-4">
        Cálculo basado en el precio de una copropiedad ({(sharePrice).toLocaleString()}€)
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600">Precio de la copropiedad</label>
          <Input
            type="number"
            value={mortgage.value}
            onChange={(e) => {
              setMortgage(prev => ({ ...prev, value: Number(e.target.value), downPayment: Number(e.target.value) * 0.3 }));
            }}
            disabled
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Entrada inicial (30%)</label>
          <Input
            type="number"
            value={mortgage.downPayment}
            onChange={(e) => {
              setMortgage(prev => ({ ...prev, downPayment: Number(e.target.value) }));
            }}
            disabled
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Tasa de interés (%)</label>
          <Input
            type="number"
            value={mortgage.interest}
            onChange={(e) => {
              setMortgage(prev => ({ ...prev, interest: Number(e.target.value) }));
              calculateMortgage();
            }}
            step="0.1"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Plazo (años)</label>
          <Input
            type="number"
            value={mortgage.years}
            onChange={(e) => {
              setMortgage(prev => ({ ...prev, years: Number(e.target.value) }));
              calculateMortgage();
            }}
          />
        </div>
      </div>
      {mortgage.result && (
        <div className="mt-4 p-4 bg-white rounded-lg border">
          <p className="text-lg font-semibold text-blue-600">Cuota mensual: {mortgage.result.monthly.toLocaleString()}€</p>
          <p>Total a pagar: {mortgage.result.total.toLocaleString()}€</p>
          <p>Total intereses: {mortgage.result.totalInterest.toLocaleString()}€</p>
        </div>
      )}
    </div>
  );
}

// Type guard para validar un agente
function isValidAgent(agent: any): agent is Property['agent'] {
  return agent && typeof agent === 'object' && 'id' in agent && 'first_name' in agent && 'last_name' in agent && 'email' in agent;
}

// Hook personalizado para cargar Google Maps
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

// Función para calcular el pago mensual
const calculateMonthlyPayment = (totalPrice: number): number => {
  const sharePrice = totalPrice * 0.25; // Precio de la copropiedad
  const downPayment = sharePrice * 0.3; // 30% de entrada
  const loanAmount = sharePrice - downPayment;
  const interestRate = 2.1 / 100 / 12; // 2.1% anual a mensual
  const numberOfPayments = 20 * 12; // 20 años en meses
  
  const monthlyPayment = loanAmount * interestRate * Math.pow(1 + interestRate, numberOfPayments) / 
    (Math.pow(1 + interestRate, numberOfPayments) - 1);
    
  return Math.round(monthlyPayment);
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

  // Geocodificar la dirección cuando cambie
  useEffect(() => {
    if (mapsLoaded && property?.location && !coordinates) {
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
  }, [mapsLoaded, property?.location]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data: propertyData, error } = await supabase
          .from('properties')
          .select(`
            *,
            agent:real_estate_agents (
              id,
              first_name,
              last_name,
              email,
              phone,
              photo_url,
              bio,
              specialization,
              license_number
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        // Asegurarnos de que los datos tienen el formato correcto
        const formattedProperty: Property = {
          ...propertyData,
          agent: isValidAgent((propertyData as any).agent) ? (propertyData as any).agent : null,
          latitude: typeof (propertyData as any).latitude === 'number' ? (propertyData as any).latitude : null,
          longitude: typeof (propertyData as any).longitude === 'number' ? (propertyData as any).longitude : null,
          images: Array.isArray((propertyData as any).images) ? (propertyData as any).images : [],
          features: Array.isArray((propertyData as any).features) ? (propertyData as any).features : [],
          nearby_services: Array.isArray((propertyData as any).nearby_services) ? (propertyData as any).nearby_services : [],
          location: (propertyData as any).location || 'Ubicación no especificada'
        };

        console.log('Property data:', formattedProperty); // Para debug
        setProperty(formattedProperty);
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-4" />
          <div className="h-8 bg-gray-200 rounded mb-4" />
          <div className="h-4 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded mb-4" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-red-600">Propiedad no encontrada</h1>
      </div>
    );
  }

  const nextImage = () => {
    if (property.images) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images!.length);
    }
  };

  const previousImage = () => {
    if (property.images) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images!.length) % property.images!.length);
    }
  };

  const handleContactClick = () => {
    setShowContactForm(true);
    document.getElementById('contactForm')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navbar sticky */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm rounded-lg mb-6 p-4">
        <ul className="flex flex-wrap gap-6 justify-center items-center text-sm font-medium">
          <li>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2" 
              onClick={() => window.location.href = '/'}
            >
              <FaArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </Button>
          </li>
          <li>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={() => window.location.href = 'http://localhost:8080/properties/'}
            >
              <FaSearch className="w-4 h-4" />
              <span>Buscar</span>
            </Button>
          </li>
          <div className="h-6 w-px bg-gray-300 mx-2" />
          <li>
            <a href="#galeria" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
              <FaImages className="w-4 h-4" />
              <span>Galería</span>
            </a>
          </li>
          <li>
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => document.getElementById('copropiedades')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <FaUsers className="w-4 h-4" />
              <span>Copropiedades</span>
            </Button>
          </li>
          <li>
            <a href="#descripcion" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
              <FaInfoCircle className="w-4 h-4" />
              <span>Descripción</span>
            </a>
          </li>
          <li>
            <a href="#agente" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
              <FaUserTie className="w-4 h-4" />
              <span>Agente</span>
            </a>
          </li>
        </ul>
      </nav>

      <Card className="overflow-hidden">
        <div className="p-6 space-y-8">
          {/* Galería de fotos */}
          <div id="galeria" className="space-y-4 scroll-mt-24">
            {/* Foto principal */}
            <div className="relative h-[500px]">
              {property.images && property.images.length > 0 ? (
                <img
                  src={property.images[currentImageIndex]}
                  alt={`${property.title} - Imagen ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
                  <p className="text-gray-500">No hay imágenes disponibles</p>
                </div>
              )}
            </div>
            
            {/* Miniaturas */}
            {property.images && property.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative h-24 ${
                      index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${property.title} - Miniatura ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Título y precio */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
            <p className="text-2xl font-bold text-blue-600 mb-6">
              {property.price.toLocaleString()}€
            </p>
          </div>

          {/* Contenedor principal de dos columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna izquierda */}
            <div className="space-y-8">
              {/* Copropiedades */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-center">Copropiedades</h2>
                <div className="grid grid-cols-2 gap-4">
                  {PROPERTY_PERIODS.slice(0, 2).map(period => {
                    const monthlyPayment = calculateMonthlyPayment(property.price);
                    return (
                      <div key={period.key} className="p-4 border rounded-lg flex flex-col items-center bg-white">
                        <span className="font-medium text-sm mb-2 text-center">{period.label}</span>
                        <div className="flex flex-col items-center">
                          <span className="text-xl mb-1">
                            {property[`${period.key}_price` as keyof Property]?.toLocaleString() ?? '-'}€
                          </span>
                          <span className="text-sm text-blue-600 font-semibold">
                            {monthlyPayment.toLocaleString()}€/mes*
                          </span>
                        </div>
                        <span className={`text-sm font-medium mt-2 ${
                          property[`${period.key}_status` as keyof Property] === 'vendida' 
                            ? 'text-red-500' 
                            : 'text-green-600'
                        }`}>
                          {(property[`${period.key}_status` as keyof Property] as string) ?? '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Características básicas */}
              <div id="caracteristicas" className="bg-gray-50 rounded-lg p-6 scroll-mt-24">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg flex flex-col items-center">
                    <Bed className="w-8 h-8 text-blue-500 mb-2" />
                    <p className="text-gray-600">Habitaciones</p>
                    <p className="text-xl font-semibold">{property.bedrooms}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg flex flex-col items-center">
                    <Bath className="w-8 h-8 text-blue-500 mb-2" />
                    <p className="text-gray-600">Baños</p>
                    <p className="text-xl font-semibold">{property.bathrooms}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg flex flex-col items-center">
                    <Square className="w-8 h-8 text-blue-500 mb-2" />
                    <p className="text-gray-600">Área</p>
                    <p className="text-xl font-semibold">{property.area}m²</p>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div id="descripcion" className="bg-gray-50 rounded-lg p-6 scroll-mt-24">
                <h2 className="text-xl font-semibold mb-4">Descripción</h2>
                <p className="text-gray-600">{property.description}</p>
              </div>

              {/* Features destacados */}
              {property.features && property.features.length > 0 && (
                <div id="features" className="bg-gray-50 rounded-lg p-6 scroll-mt-24">
                  <h2 className="text-xl font-semibold mb-4">Características Destacadas</h2>
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

              {/* Servicios cercanos */}
              {property.nearby_services && property.nearby_services.length > 0 && (
                <div id="servicios" className="bg-gray-50 rounded-lg p-6 scroll-mt-24">
                  <h2 className="text-xl font-semibold mb-4">Servicios Cercanos</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {property.nearby_services.map((service) => (
                      <div key={service} className="flex items-center gap-3 p-4 bg-white rounded-lg">
                        {SERVICE_ICONS[service] || <FaMapMarkerAlt className="w-6 h-6 text-gray-400" />}
                        <span className="font-medium capitalize">{service.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ubicación y mapa */}
              <div id="ubicacion" className="bg-gray-50 rounded-lg p-6 scroll-mt-24">
                <h2 className="text-xl font-semibold mb-4">Ubicación</h2>
                <p className="text-gray-600 mb-4">{property?.location}</p>
                {mapsLoaded && coordinates ? (
                  <div className="h-[400px] w-full rounded-lg overflow-hidden border">
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={coordinates}
                      zoom={16}
                      options={{
                        zoomControl: true,
                        streetViewControl: true,
                        mapTypeControl: true,
                        fullscreenControl: true,
                        styles: [
                          {
                            featureType: "poi",
                            elementType: "labels",
                            stylers: [{ visibility: "on" }]
                          }
                        ],
                        mapTypeId: "roadmap"
                      }}
                    >
                      <Marker 
                        position={coordinates}
                        options={{
                          animation: window.google?.maps?.Animation?.DROP
                        }}
                      />
                    </GoogleMap>
                  </div>
                ) : (
                  <div className="h-[400px] w-full rounded-lg bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500">
                      {!mapsLoaded ? "Cargando mapa..." : "Ubicación no disponible"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-8">
              {/* Segunda sección de Copropiedades */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-center">Copropiedades</h2>
                <div className="grid grid-cols-2 gap-4">
                  {PROPERTY_PERIODS.slice(2).map(period => {
                    const monthlyPayment = calculateMonthlyPayment(property.price);
                    return (
                      <div key={period.key} className="p-4 border rounded-lg flex flex-col items-center bg-white">
                        <span className="font-medium text-sm mb-2 text-center">{period.label}</span>
                        <div className="flex flex-col items-center">
                          <span className="text-xl mb-1">
                            {property[`${period.key}_price` as keyof Property]?.toLocaleString() ?? '-'}€
                          </span>
                          <span className="text-sm text-blue-600 font-semibold">
                            {monthlyPayment.toLocaleString()}€/mes*
                          </span>
                        </div>
                        <span className={`text-sm font-medium mt-2 ${
                          property[`${period.key}_status` as keyof Property] === 'vendida' 
                            ? 'text-red-500' 
                            : 'text-green-600'
                        }`}>
                          {(property[`${period.key}_status` as keyof Property] as string) ?? '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">* Cuota mensual estimada con 30% de entrada y 20 años de hipoteca</p>
              </div>

              {/* Calculadora de hipoteca */}
              <div id="hipoteca" className="bg-gray-50 rounded-lg p-6 scroll-mt-24">
                <h2 className="text-xl font-semibold mb-4">Calculadora de Hipoteca para Copropiedad</h2>
                <MortgageCalculator propertyPrice={property.price} />
              </div>

              {/* Información del agente y contacto */}
              <div id="contactForm" className="bg-gray-50 rounded-lg p-6 scroll-mt-24">
                <h2 className="text-xl font-semibold mb-4">Contactar con el agente</h2>
                
                {/* Información del agente */}
                {property.agent && (
                  <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      {property.agent.photo_url && (
                        <img
                          src={property.agent.photo_url}
                          alt={`${property.agent.first_name} ${property.agent.last_name}`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {property.agent.first_name} {property.agent.last_name}
                        </h3>
                        <p className="text-gray-600">
                          <a href={`mailto:${property.agent.email}`} className="hover:text-blue-600">
                            {property.agent.email}
                          </a>
                        </p>
                        {property.agent.phone && (
                          <p className="text-gray-600">
                            <a href={`tel:${property.agent.phone}`} className="hover:text-blue-600 flex items-center gap-1">
                              <FaPhone className="w-4 h-4" />
                              {property.agent.phone}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                    {property.agent.bio && (
                      <p className="text-gray-600 mb-4">{property.agent.bio}</p>
                    )}
                    {property.agent.specialization && (
                      <p className="text-sm text-gray-500">
                        Especialización: {property.agent.specialization}
                      </p>
                    )}
                  </div>
                )}

                {/* Formulario de contacto */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Enviar mensaje al agente</h3>
                  <ContactForm 
                    agentId={property?.agent?.id} 
                    className="w-full"
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