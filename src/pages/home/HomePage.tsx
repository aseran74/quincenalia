// Modificación mínima para forzar commit y push
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { FeaturedProperties } from '@/components/FeaturedProperties';
import { useEffect, useState, useRef } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
    PiggyBank, Briefcase, Lock, Sparkles, ScrollText, Ban, MessageCircle, Receipt, ShieldCheck, Unlock, Home, Calendar, Timer, Banknote, Globe, ChevronRight, ArrowRight, Phone, Mail, MapPin, ChevronLeft, HelpCircle, FileText, Cookie, Star, Users // Asegúrate de que CheckCircle y ShieldAlert estén aquí si los usas
} from 'lucide-react'; // Iconos usados y potencialmente nuevos
import { Link, useNavigate } from 'react-router-dom';
import ContactForm from '@/components/ContactForm';
import './HomePage.css'; // Asegúrate de que este archivo exista y no cause conflictos
import { supabase } from '@/lib/supabase';

const FAQS = [
  {
    id: 'faq-gastos',
    icon: PiggyBank,
    question: '¿Cuáles son los gastos mensuales?',
    answer: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>Se estiman anualmente e incluyen luz, agua, IBI, basuras, seguro, comunidad, internet y 4 limpiezas al mes por quincena disfrutada. Se añade un margen del 20% para imprevistos.</p>
        <p><strong>Ejemplo (aprox. para inmueble 200k€ en Castellón):</strong></p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>IBI: ~100€</li>
          <li>Agua: ~20€</li>
          <li>Luz: ~40€</li>
          <li>Basuras: ~15€</li>
          <li>Comunidad: ~60€</li>
          <li>Limpiezas: ~30€ (prorr.)</li>
          <li>Internet: ~20€</li>
          <li>Seguro Hogar: ~15€ (prorr.)</li>
        </ul>
        <p>Total estimado: ~300€/mes. Dividido entre 4 copropietarios resulta en aprox. <strong>75€/mes por copropietario</strong>.</p>
        <p>Acceso online a facturas y presupuesto anual detallado. Colaboramos con partners para obtener precios competitivos.</p>
      </div>
    ),
  },
  {
    id: 'faq-tarifas',
    icon: Briefcase,
    question: '¿Cuáles son las tarifas y comisiones?',
    answer: <p className="text-sm text-muted-foreground">Cobramos una comisión del 5% sobre el valor total de las reservas de alquiler gestionadas y una tarifa fija de 15€/mes por copropietario por la gestión integral de la propiedad.</p>,
  },
  {
    id: 'faq-objetos',
    icon: Lock,
    question: '¿Puedo guardar objetos personales?',
    answer: <p className="text-sm text-muted-foreground">Sí, cada copropietario dispone de espacios de almacenamiento privados con cerradura. Fomentamos una comunidad de confianza seleccionando cuidadosamente a los miembros.</p>,
  },
   {
    id: 'faq-limpieza',
    icon: Sparkles,
    question: '¿Limpieza y mantenimiento?',
    answer: <p className="text-sm text-muted-foreground">Nuestra gestión incluye 4 limpiezas mensuales asociadas a las quincenas principales. Las limpiezas por reservas adicionales tienen un coste extra. Esperamos que la propiedad se mantenga en buen estado.</p>,
  },
  {
    id: 'faq-regulacion',
    icon: ScrollText,
    question: '¿Regulaciones o requisitos legales?',
    answer: <p className="text-sm text-muted-foreground">Es necesario registrar la entidad propietaria (SL, CB, etc.) como alquiler turístico en la C. Autónoma correspondiente para operar legalmente en plataformas de alquiler.</p>,
  },
  {
    id: 'faq-cancelacion',
    icon: Ban,
    question: '¿Política de cancelación de reservas?',
    answer: <p className="text-sm text-muted-foreground">Las condiciones específicas de cancelación se detallan en el contrato de servicio. Buscamos siempre soluciones justas ante cualquier eventualidad.</p>,
  },
   {
    id: 'faq-comunicacion',
    icon: MessageCircle,
    question: '¿Comunicación con los huéspedes?',
    answer: <p className="text-sm text-muted-foreground">Actuamos como intermediarios, gestionando todas las comunicaciones, consultas y solicitudes de los huéspedes de forma profesional y eficiente.</p>,
  },
  {
    id: 'faq-impuestos',
    icon: Receipt,
    question: '¿Impuestos y obligaciones fiscales?',
    answer: <p className="text-sm text-muted-foreground">Cada copropietario es responsable de sus propias obligaciones fiscales. Facilitamos anualmente la información necesaria (ej. Modelo 180), pero no asumimos responsabilidad fiscal individual.</p>,
  },
  {
    id: 'faq-seguro',
    icon: ShieldCheck,
    question: '¿Qué tipo de seguro incluye la gestión?',
    answer: <p className="text-sm text-muted-foreground">Incluimos un seguro básico que cubre hasta 3000€ en daños por vandalismo. Ofrecemos acceso a seguros más completos con condiciones ventajosas a través de nuestros partners.</p>,
  },
  {
    id: 'faq-terminar-acuerdo',
    icon: Unlock,
    question: '¿Puedo terminar el acuerdo?',
    answer: <p className="text-sm text-muted-foreground">Sí, el acuerdo puede terminarse por cualquiera de las partes notificándolo con la antelación estipulada en el contrato, cuyas cláusulas protegen los intereses de todos los involucrados.</p>,
  },
    {
    id: 'faq-porcentaje-compra',
    icon: Home,
    question: '¿% de compra y formato jurídico?',
    answer: <p className="text-sm text-muted-foreground">Puedes adquirir desde un 25% (1 participación) hasta un 50% (2 participaciones). Recomendamos estructuras como Comunidad de Bienes (CB) o Sociedad Limitada (SL). Cada 25% otorga 15 días fijos (Jul/Ago) y 10 semanas flexibles al año, intercambiables entre socios.</p>,
  },
  {
    id: 'faq-reserva-inmueble',
    icon: Calendar,
    question: '¿Cómo reservo mi participación?',
    answer: <p className="text-sm text-muted-foreground">Eliges la propiedad y el periodo fijo deseado, realizas una reserva inicial. La compraventa se formaliza una vez que los 4 copropietarios están confirmados.</p>,
  },
  {
    id: 'faq-plazo-compraventa',
    icon: Timer,
    question: '¿Plazo para formalizar la compra?',
    answer: <p className="text-sm text-muted-foreground">Una vez reunidos los 4 copropietarios, establecemos un plazo objetivo de 4 meses para completar la compraventa, sujeto a condiciones de financiación y trámites.</p>,
  },
  {
    id: 'faq-financiacion',
    icon: Banknote,
    question: '¿Ayudáis con la financiación?',
    answer: <p className="text-sm text-muted-foreground">Sí, colaboramos con entidades bancarias para facilitar el acceso a financiación. Es importante destacar que cada copropietario es responsable únicamente de su parte del préstamo.</p>,
  },
  {
    id: 'faq-reparto-semanas',
    icon: Globe,
    question: '¿Reparto de semanas flexibles?',
    answer: <p className="text-sm text-muted-foreground">Tras las quincenas fijas, las 10 semanas restantes por participación se distribuyen equitativamente, rotando festivos y periodos de alta demanda año tras año. Existe flexibilidad para intercambiar semanas entre los copropietarios.</p>,
  },
];

function FAQAccordion() {
  const halfIndex = Math.ceil(FAQS.length / 2);
  const leftFAQs = FAQS.slice(0, halfIndex);
  const rightFAQs = FAQS.slice(halfIndex);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <Accordion type="single" collapsible className="w-full space-y-3">
        {leftFAQs.map((faq) => (
          <AccordionItem value={faq.id} key={faq.id} className="border border-border rounded-lg bg-background shadow-sm transition-shadow hover:shadow-lg">
            <AccordionTrigger className="group px-4 py-3 text-sm sm:text-base font-medium text-left hover:no-underline [&[data-state=open]>svg]:rotate-90">
              <div className="flex items-center gap-3">
                <faq.icon className="w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ease-in-out group-hover:scale-125 group-hover:-rotate-12" />
                <span>{faq.question}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-0">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Accordion type="single" collapsible className="w-full space-y-3">
        {rightFAQs.map((faq) => (
          <AccordionItem value={faq.id} key={faq.id} className="border border-border rounded-lg bg-background shadow-sm transition-shadow hover:shadow-lg">
            <AccordionTrigger className="group px-4 py-3 text-sm sm:text-base font-medium text-left hover:no-underline [&[data-state=open]>svg]:rotate-90">
               <div className="flex items-center gap-3">
                <faq.icon className="w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ease-in-out group-hover:scale-125 group-hover:-rotate-12" />
                <span>{faq.question}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-0">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function ComoFunciona() {
  const [expandido, setExpandido] = useState(false);

  const steps = [
    { icon: Home, title: "Compra Inteligente", text: "Adquieres legalmente el 25% (o 50%) de una propiedad vacacional premium." },
    { icon: Calendar, title: "Uso Garantizado", text: "Disfrutas de 15 días fijos en temporada alta (Jul/Ago) + 10 semanas flexibles al año, ¡para siempre!" },
    { icon: PiggyBank, title: "Gastos Compartidos", text: "Divide los costes fijos (IBI, comunidad, seguros...) entre 4. ¡Mucho más económico!" },
    { icon: Briefcase, title: "Gestión Integral", text: "Nos encargamos de TODO: limpieza, mantenimiento, facturas, impuestos... Tú solo disfruta." },
    { icon: Banknote, title: "Rentabilidad Extra", text: "Alquilamos tu propiedad en las semanas que no usas a través de las mejores plataformas (Airbnb, Booking...). ¡Ingresos pasivos!" },
    { icon: Globe, title: "Viaja por el Mundo", text: "Intercambia tus semanas flexibles por estancias en otras propiedades exclusivas globalmente con nuestro sistema de puntos." }
  ];

  const beneficiosClave = [
    { icon: ShieldCheck, text: "Propiedad legal y segura (25% o 50% proindiviso)." },
    { icon: FileText, text: "Contrato claro: fechas fijas garantizadas + semanas flexibles." },
    { icon: Users, text: "Gestión profesional: olvídate de preocupaciones." },
    { icon: PiggyBank, text: "Potencial de ingresos por alquiler pasivo." },
    { icon: Globe, text: "Acceso a red global de intercambio de viviendas." },
  ];

  return (
    <section id="reinventada" className="py-16 sm:py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-gray-800">
          Tu Segunda Residencia,{' '}
          <span className="relative inline-block">
            <span className="text-gray-800 font-bold">Reinventada</span>
            <svg
              viewBox="0 0 180 12"
              width="180"
              height="12"
              className="absolute left-1/2 -translate-x-1/2 top-full mt-0.5 w-[180px]"
              aria-hidden="true"
            >
              <linearGradient id="linea-reinventada" x1="0" y1="0" x2="180" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22d3ee" />
                <stop offset="0.5" stopColor="#0ea5e9" />
                <stop offset="1" stopColor="#2563eb" />
              </linearGradient>
              <path
                d="M 0 10 Q 90 0, 180 10"
                fill="none"
                stroke="url(#linea-reinventada)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-primary text-4xl align-middle ml-1">.</span>
          </span>
        </h2>
        <p className="text-lg text-center text-gray-600 mb-10 sm:mb-12 max-w-3xl mx-auto">Descubre cómo Quincenalia combina propiedad, disfrute y rentabilidad de forma única.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {steps.map((step, index) => (
            <Card 
              key={index} 
              className="group bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out"
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="bg-primary/10 p-2.5 rounded-full group-hover:bg-primary/20 transition-all duration-300">
                      <step.icon className="w-7 h-7 text-primary transition-transform duration-300 ease-in-out group-hover:scale-125 group-hover:-rotate-12" />
                  </div>
                  <CardTitle className="text-lg font-semibold">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-sm text-gray-600">{step.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className={`transition-all duration-700 ease-in-out overflow-hidden ${expandido ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
           <div className="bg-slate-100/70 p-6 sm:p-8 rounded-xl shadow-inner border border-slate-200 max-w-3xl mx-auto space-y-6">
                 <h3 className="text-xl font-semibold text-center text-gray-700 mb-2">
                    ¿Por qué conformarte con alquilar cuando puedes <span className="text-primary">ser propietario</span>?
                 </h3>
                 <p className="text-center text-gray-600 text-sm sm:text-base leading-relaxed">
                    Inspirados en soluciones inteligentes, hemos creado un modelo que te ofrece lo mejor de todos los mundos, sin las complicaciones de la propiedad tradicional.
                 </p>
                 
                 <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center sm:text-left">Beneficios Clave de Nuestro Modelo:</h4>
                    <ul className="space-y-3">
                        {beneficiosClave.map((beneficio, idx) => (
                            <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-primary/30 transition-colors">
                                <beneficio.icon className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-700">{beneficio.text}</span>
                            </li>
                        ))}
                    </ul>
                 </div>

                 <p className="text-center font-semibold text-primary mt-8 text-lg">
                    <Star className="inline-block w-5 h-5 mb-1 mr-1.5 text-amber-500" />
                    Propietario + Viajero + Inversor: Todo en uno.
                    <Star className="inline-block w-5 h-5 mb-1 ml-1.5 text-amber-500" />
                 </p>
            </div>
        </div>
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => setExpandido(!expandido)}
            className="group transition-all duration-300"
          >
            {expandido ? 'Mostrar Menos Detalles' : 'Descubrir Más Detalles'}
            <ChevronRight className={`ml-2 h-4 w-4 transition-transform duration-300 ${expandido ? 'rotate-90' : ''} group-hover:translate-x-1`} />
          </Button>
        </div>
      </div>
    </section>
  );
}

const HeroParallax = () => {
  return (
    <img
      src="/hero.jpg"
      alt="Villa vacacional de lujo con piscina y vistas al mar"
      className="w-full h-full object-cover hero-image" // Asegúrate que .hero-image tiene los estilos CSS para el efecto
    />
  );
};

const IMAGENES_ZONA: Record<string, string> = {
  'Costa de levante.': '/Levante.webp',
  'Canarias.': '/Canarias.webp',
  'Baleares.': '/baleares.webp',
  'Costa Catalana': 'Costacatalana.webp',
  'Andalucia': '/andalucia.jpg',
  'Euskadi.': '/Euskadi.webp',
  'Asturias.': '/Asturias.webp',
  'Galicia': '/Galicia.webp', // Imagen diferente para Galicia
  'Murcia': '/murcia.jpg',   // Imagen diferente para Murcia
  'Zonas de interior.': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80',
};

// Función para obtener la ruta de la imagen de la zona
function getZonaImage(zona: string) {
  return IMAGENES_ZONA[zona] || '/placeholder.svg';
}

// Función para normalizar nombres de zona (quita tildes, puntos, espacios y pasa a minúsculas)
function normalizaZona(z: string) {
  return (z || '')
    .normalize('NFD').replace(/\[\u0300-\u036f\]/g, '')
    .replace(/\./g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

const HomePage = () => {
  const [viviendasPorZona, setViviendasPorZona] = useState<{ [key: string]: number }>({});
  const [zonasUnicas, setZonasUnicas] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [faqExpandido, setFaqExpandido] = useState(false);
  const [showLegalPopup, setShowLegalPopup] = useState(false);
  const [aceptaCondiciones, setAceptaCondiciones] = useState(false);
  const navigate = useNavigate();
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setFaqExpandido(true);
      } else {
        setFaqExpandido(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchViviendasPorZona = async () => {
      const { data, error } = await supabase.rpc('viviendas_por_zona');
      if (error) {
        console.error("Error fetching viviendas_por_zona:", error);
        return;
      }
      const counts: { [key: string]: number } = {};
      (data || []).forEach((row: any) => {
        if (row.zona) {
          counts[row.zona] = Number(row.total); 
        }
      });
      setViviendasPorZona(counts);
    };
    fetchViviendasPorZona();
    
    const fetchZonasUnicas = async () => {
      const { data, error } = await supabase.from('properties').select('zona');
      if (error) {
        console.error("Error fetching zonas unicas:", error);
        return;
      }
      const zonas = Array.from(new Set((data || []).map((p: any) => (p.zona || '').trim()))).filter(z => z).sort();
      setZonasUnicas(zonas);
    };
    fetchZonasUnicas();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('cookies_accepted')) {
      setShowCookieBanner(true);
    }
  }, []);

  const aceptarCookies = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cookies_accepted', 'true');
    }
    setShowCookieBanner(false);
  };

  const scrollZonaCarrusel = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300; 
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Debug: mostrar el contenido real de viviendasPorZona antes de renderizar las cards de zona
  console.log('viviendasPorZona:', viviendasPorZona);

  return (
    <div className="min-h-screen bg-background font-poppins">
      <Navbar />
      <section className="relative h-[85vh] sm:h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <HeroParallax />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        </div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 sm:mb-6 !leading-tight"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            Ha llegado otra manera de{' '}
            <span className="relative inline-block">
              <span className="text-white font-semibold">
                veranear
              </span>
              <svg
                viewBox="0 0 180 12"
                width="180"
                height="12"
                className="absolute left-1/2 -translate-x-1/2 top-full mt-0.5 w-[180px]"
                aria-hidden="true"
              >
                <linearGradient id="linea-grad" x1="0" y1="0" x2="180" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#22d3ee" />
                  <stop offset="0.5" stopColor="#0ea5e9" />
                  <stop offset="1" stopColor="#2563eb" />
                </linearGradient>
                <path
                  d="M 0 6 Q 45 0, 90 6 T 180 6"
                  fill="none"
                  stroke="url(#linea-grad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span><span className="text-primary">.</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 font-light max-w-2xl mx-auto"
             style={{ textShadow: '0 1px 5px rgba(0,0,0,0.4)' }}>
            Accede a propiedades exclusivas por una fracción del coste. Disfruta, rentabiliza e intercambia.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3 text-base font-semibold shadow-lg transform transition hover:scale-105" asChild>
            <Link to="/propiedades">
              Explorar Propiedades
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
      <section id="zonas-destacadas" className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3 text-gray-800">
            Explora por{' '}
            <span className="relative inline-block">
              <span className="text-gray-800 font-bold">zonas</span>
              <svg
                viewBox="0 0 180 12"
                width="180"
                height="12"
                className="absolute left-1/2 -translate-x-1/2 top-full mt-0.5 w-[180px]"
                aria-hidden="true"
              >
                <linearGradient id="linea-zonas" x1="0" y1="0" x2="180" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#22d3ee" />
                  <stop offset="0.5" stopColor="#0ea5e9" />
                  <stop offset="1" stopColor="#2563eb" />
                </linearGradient>
                <path
                  d="M 0 10 Q 90 0, 180 10"
                  fill="none"
                  stroke="url(#linea-zonas)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-primary text-4xl align-middle ml-1">.</span>
            </span>
          </h2>
          <p className="text-lg text-center text-gray-600 mb-10 sm:mb-12 max-w-2xl mx-auto">
            Encuentra tu refugio perfecto en las regiones más deseadas.
          </p>
          <div className="text-center mb-8">
            <Button asChild variant="default" size="lg" className="group">
              <Link to="/properties">
                Ver Todas las Propiedades
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-6 z-10 rounded-full bg-white/80 hover:bg-white shadow-md backdrop-blur-sm block md:hidden"
              onClick={() => scrollZonaCarrusel('left')}
              aria-label="Scroll Left"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="px-2 py-6">
              <div
                ref={scrollContainerRef}
                className="flex lg:hidden space-x-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
              >
                {zonasUnicas.map((zona, index) => {
                  // Buscar el contador usando la zona normalizada
                  const zonaKey = Object.keys(viviendasPorZona).find(
                    key => normalizaZona(key) === normalizaZona(zona)
                  );
                  const countZona = zonaKey ? viviendasPorZona[zonaKey] : 0;
                  return (
                    <Link
                      to={`/properties?zona=${encodeURIComponent(zona)}`}
                      key={index}
                      className="flex-shrink-0 w-[80vw] max-w-xs h-48 sm:h-56 group/card-link flex items-center justify-center snap-center px-2"
                    >
                      <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl transform hover:-translate-y-1 rounded-full group/card w-full h-48 sm:h-56 flex flex-col items-center justify-center p-0 border-4 border-primary/30 bg-white relative">
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img
                            src={getZonaImage(zona)}
                            alt={`Propiedades en ${zona}`}
                            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover/card:scale-110 rounded-full"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-property.jpg'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80 group-hover/card:opacity-100 transition-opacity duration-300 rounded-full"></div>
                          <div className="absolute bottom-3 left-0 right-0 px-2 text-center">
                            <h3 className="text-lg font-bold text-white truncate" title={zona}>
                              {zona}
                            </h3>
                            <p className="text-xs text-gray-100 mt-0.5">
                              {countZona} {countZona === 1 ? 'vivienda' : 'viviendas'}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
              <div className="hidden lg:flex flex-col items-center gap-10">
                <div className="flex flex-row flex-wrap justify-center gap-8 mb-8">
                  {zonasUnicas.slice(0, 5).map((zona, index) => {
                    const zonaKey = Object.keys(viviendasPorZona).find(
                      key => normalizaZona(key) === normalizaZona(zona)
                    );
                    const countZonaTop = zonaKey ? viviendasPorZona[zonaKey] : 0;
                    return (
                      <Link to={`/properties?zona=${encodeURIComponent(zona)}`} key={index} className="w-56 h-56 group/card-link flex items-center justify-center">
                        <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl transform hover:-translate-y-1 rounded-full group/card w-56 h-56 flex flex-col items-center justify-center p-0 border-4 border-primary/30 bg-white relative">
                          <div className="relative w-full h-full flex items-center justify-center">
                            <img
                              src={getZonaImage(zona)}
                              alt={`Propiedades en ${zona}`}
                              className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover/card:scale-110 rounded-full"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-property.jpg'; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80 group-hover/card:opacity-100 transition-opacity duration-300 rounded-full"></div>
                            <div className="absolute bottom-6 left-0 right-0 px-4 text-center">
                              <h3 className="text-xl font-bold text-white truncate" title={zona}>
                                {zona}
                              </h3>
                              <p className="text-sm text-gray-100 mt-1">
                                {countZonaTop} {countZonaTop === 1 ? 'vivienda' : 'viviendas'}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
                <div className="flex flex-row flex-wrap justify-center gap-8">
                  {zonasUnicas.slice(5, 10).map((zona, index) => {
                    const zonaKey = Object.keys(viviendasPorZona).find(
                      key => normalizaZona(key) === normalizaZona(zona)
                    );
                    const countZonaRest = zonaKey ? viviendasPorZona[zonaKey] : 0;
                    return (
                      <Link to={`/properties?zona=${encodeURIComponent(zona)}`} key={index+5} className="w-56 h-56 group/card-link flex items-center justify-center">
                        <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl transform hover:-translate-y-1 rounded-full group/card w-56 h-56 flex flex-col items-center justify-center p-0 border-4 border-primary/30 bg-white relative">
                          <div className="relative w-full h-full flex items-center justify-center">
                            <img
                              src={getZonaImage(zona)}
                              alt={`Propiedades en ${zona}`}
                              className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover/card:scale-110 rounded-full"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-property.jpg'; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80 group-hover/card:opacity-100 transition-opacity duration-300 rounded-full"></div>
                            <div className="absolute bottom-6 left-0 right-0 px-4 text-center">
                              <h3 className="text-xl font-bold text-white truncate" title={zona}>
                                {zona}
                              </h3>
                              <p className="text-sm text-gray-100 mt-1">
                                {countZonaRest} {countZonaRest === 1 ? 'vivienda' : 'viviendas'}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-6 z-10 rounded-full bg-white/80 hover:bg-white shadow-md backdrop-blur-sm block md:hidden"
              onClick={() => scrollZonaCarrusel('right')}
              aria-label="Scroll Right"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-12 text-gray-800">
            Oportunidades{' '}
            <span className="relative inline-block">
              <span className="text-gray-800 font-bold">exclusivas</span>
              <svg
                viewBox="0 0 180 12"
                width="180"
                height="12"
                className="absolute left-1/2 -translate-x-1/2 top-full mt-0.5 w-[180px]"
                aria-hidden="true"
              >
                <linearGradient id="linea-exclusivas" x1="0" y1="0" x2="180" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#22d3ee" />
                  <stop offset="0.5" stopColor="#0ea5e9" />
                  <stop offset="1" stopColor="#2563eb" />
                </linearGradient>
                <path
                  d="M 0 10 Q 90 0, 180 10"
                  fill="none"
                  stroke="url(#linea-exclusivas)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-primary text-4xl align-middle ml-1">.</span>
            </span>
          </h2>
          <FeaturedProperties />
        </div>
      </section>
      <ComoFunciona />
      <section id="contacto" className="py-16 sm:py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                <span className="text-black text-4xl align-middle mr-1">¿</span>
                Listo para <span className="relative inline-block"><span className="text-gray-800 font-bold">Empezar</span>
                  <svg
                    viewBox="0 0 180 12"
                    width="180"
                    height="12"
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-0.5 w-[180px]"
                    aria-hidden="true"
                  >
                    <linearGradient id="linea-empezar" x1="0" y1="0" x2="180" y2="0" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#22d3ee" />
                      <stop offset="0.5" stopColor="#0ea5e9" />
                      <stop offset="1" stopColor="#2563eb" />
                    </linearGradient>
                    <path
                      d="M 0 10 Q 90 0, 180 10"
                      fill="none"
                      stroke="url(#linea-empezar)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-black text-4xl align-middle ml-1">?</span>
                </span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Contacta con nosotros para descubrir cómo Quincenalia puede transformar tu forma de disfrutar y rentabilizar
                tus vacaciones. Nuestro equipo está listo para asesorarte.
              </p>
              <div className="space-y-6">
                <a 
                  href="tel:+34666777888" 
                  className="group flex items-center p-4 rounded-xl hover:bg-primary/5 transition-all duration-300 ease-in-out transform hover:shadow-lg border border-transparent hover:border-primary/20"
                >
                  <div className="bg-primary/10 p-3 rounded-full mr-4 group-hover:bg-primary/20 transition-all duration-300">
                    <Phone className="w-6 h-6 text-primary transition-transform duration-300 ease-in-out group-hover:scale-125 group-hover:-rotate-12" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Llámanos</p>
                    <p className="text-gray-700 group-hover:text-primary text-base transition-colors">+34 666 777 888</p>
                  </div>
                </a>
                <a 
                  href="mailto:info@quincenalia.com" 
                  className="group flex items-center p-4 rounded-xl hover:bg-primary/5 transition-all duration-300 ease-in-out transform hover:shadow-lg border border-transparent hover:border-primary/20"
                >
                  <div className="bg-primary/10 p-3 rounded-full mr-4 group-hover:bg-primary/20 transition-all duration-300">
                    <Mail className="w-6 h-6 text-primary transition-transform duration-300 ease-in-out group-hover:scale-125 group-hover:-rotate-12" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Escríbenos</p>
                    <p className="text-gray-700 group-hover:text-primary text-base transition-colors">info@quincenalia.com</p>
                  </div>
                </a>
                <div className="group flex items-start p-4 rounded-xl hover:bg-primary/5 transition-all duration-300 ease-in-out transform hover:shadow-lg border border-transparent hover:border-primary/20">
                  <div className="bg-primary/10 p-3 rounded-full mr-4 group-hover:bg-primary/20 transition-all duration-300 mt-1">
                    <MapPin className="w-6 h-6 text-primary flex-shrink-0 transition-transform duration-300 ease-in-out group-hover:scale-125 group-hover:-rotate-12" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Visítanos (con cita)</p>
                    <p className="text-gray-700 text-base">Oficinas en Madrid, Barcelona y Málaga.</p>
                    <p className="text-xs text-gray-500">(Visitas con cita previa)</p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="bg-white shadow-xl p-6 sm:p-8 rounded-2xl border border-slate-100">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl font-semibold text-gray-800">Envíanos un Mensaje</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Te responderemos lo antes posible.</p>
              </CardHeader>
              <CardContent className="p-0">
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section id="faq" className="py-16 sm:py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-12 text-gray-800 relative inline-block">
            <span className="relative inline-block">
              Resolvemos tus Dudas
              <svg
                viewBox="0 0 220 12"
                width="220"
                height="12"
                className="absolute left-[60%] -translate-x-1/2 top-full mt-0.5 w-[220px]"
                aria-hidden="true"
              >
                <linearGradient id="linea-dudas" x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#22d3ee" />
                  <stop offset="0.5" stopColor="#0ea5e9" />
                  <stop offset="1" stopColor="#2563eb" />
                </linearGradient>
                <path
                  d="M 0 10 Q 110 0, 220 10"
                  fill="none"
                  stroke="url(#linea-dudas)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-primary text-4xl align-middle ml-1">.</span>
            </span>
          </h2>
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${faqExpandido ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="max-w-4xl mx-auto">
              <FAQAccordion />
              <div className="text-center mt-6">
                <Button variant="outline" onClick={() => setFaqExpandido(false)} className="group transition-all duration-300">
                  Ocultar FAQ
                </Button>
              </div>
            </div>
          </div>
          {!faqExpandido && (
            <div className="text-center mt-6">
              <Button variant="outline" onClick={() => setFaqExpandido(true)} className="group transition-all duration-300">
                Mostrar FAQ
              </Button>
            </div>
          )}
        </div>
      </section>

      <footer className="bg-slate-900 text-gray-300 py-12 sm:py-16 text-sm font-normal"> {/* Ajustado text-sm */}
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2 lg:col-span-1">
              <h3 className="text-2xl font-bold mb-3 text-white">Quincenalia</h3>
              <p className="text-gray-400 leading-relaxed">
                La forma inteligente de poseer, disfrutar y rentabilizar tu segunda residencia.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-100 uppercase tracking-wide text-xs">Navegación</h4>
              <ul className="space-y-2.5">
                  <li><Link to="/propiedades" className="hover:text-primary transition-colors">Propiedades</Link></li>
                  <li><a href="#zonas-destacadas" className="hover:text-primary transition-colors">Zonas Destacadas</a></li>
                  <li><a href="#reinventada" className="hover:text-primary transition-colors">Cómo Funciona</a></li>
                  <li><a href="#contacto" className="hover:text-primary transition-colors">Contacto</a></li>
                  <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-100 uppercase tracking-wide text-xs">Legal</h4>
              <ul className="space-y-2.5">
                <li><Link to="/terminos-servicio" className="hover:text-primary transition-colors flex items-center gap-1.5"><FileText className="w-4 h-4 text-gray-500" /> Términos de Servicio</Link></li>
                <li><Link to="/politica-privacidad" className="hover:text-primary transition-colors flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-gray-500" /> Política de Privacidad</Link></li>
                <li><Link to="/politica-cookies" className="hover:text-primary transition-colors flex items-center gap-1.5"><Cookie className="w-4 h-4 text-gray-500" /> Política de Cookies</Link></li>
              </ul>
            </div>
             <div className="md:col-span-2 lg:col-span-1">
              <h4 className="font-semibold mb-4 text-gray-100 uppercase tracking-wide text-xs">Síguenos</h4>
                <div className="flex space-x-4">
                    <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-primary transition-colors"><svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg></a>
                    <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-primary transition-colors"><svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.272.058 2.166.296 2.913.588.764.302 1.33.696 1.902 1.27.574.572.97 1.138 1.27 1.903.293.747.53 1.64.588 2.912.058 1.267.07 1.647.07 4.85s-.012 3.583-.07 4.85c-.058 1.272-.295 2.166-.588 2.913-.302.764-.696 1.33-1.27 1.902-.572.574-1.138.97-1.903 1.27-.747.293-1.64.53-2.912.588-1.267.058-1.647.07-4.85.07s-3.583-.012-4.85-.07c-1.272-.058-2.187-.295-2.966-.613-2.966-.302 0-.602.308-1.218.613-1.818.308-.78.555-1.687.613-2.967.058-1.279.072-1.687-.072-4.946-.072zm0-2.163c-3.259 0-3.667.014-4.947.072-1.28.058-2.187.305-2.966.613-.793.308-1.41.72-2.01 1.32-.602.602-1.012 1.218-1.32 2.01-.308.78-.555 1.687-.613 2.967-.058 1.279-.072 1.687-.072 4.946s.014 3.667.072 4.947c.058 1.28.305 2.187.613 2.966.308.793.72 1.41 1.32 2.01.602.602 1.218 1.012 2.01 1.32.78.308 1.687.555 2.967.613 1.279.058 1.687.072 4.946.072s3.667-.014 4.947-.072c1.28-.058 2.187-.305 2.966-.613.793-.308 1.41-.72 2.01-1.32.602.602 1.012-1.218 1.32-2.01.308-.78.555-1.687.613-2.967.058-1.279.072-1.687-.072-4.946s-.014-3.667-.072-4.947c-.058-1.28-.305-2.187-.613-2.966-.308-.793-.72-1.41-1.32-2.01-.602-.602-1.218-1.012-2.01-1.32-.78-.308-1.687-.555-2.967-.613-1.279-.058-1.687-.072-4.946-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.441 1.441 1.441 1.441-.645 1.441-1.441-.645-1.44-1.441-1.44z"/></svg></a>
                    <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-primary transition-colors"><svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>
                </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Quincenalia. Todos los derechos reservados.
          </div>
        </div>
      </footer>
      <div>
        <button
          className="fixed bottom-6 right-6 z-50 bg-primary text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/60"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
          onClick={() => setShowLegalPopup(v => !v)}
          aria-label="Ayuda y legal"
        >
          <HelpCircle className="w-7 h-7" />
        </button>
        {showLegalPopup && (
          <div className="fixed bottom-24 right-6 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-72 animate-fade-in">
            <h4 className="font-semibold text-lg mb-2 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-primary" />Ayuda y Legal</h4>
            <ul className="space-y-2 mb-3">
              <li>
                <button className="flex items-center gap-2 text-primary hover:underline" onClick={() => { setFaqExpandido(true); setShowLegalPopup(false); setTimeout(() => { const faq = document.getElementById('faq'); if (faq) faq.scrollIntoView({ behavior: 'smooth' }); }, 100); }}>
                  <HelpCircle className="w-4 h-4" /> FAQ
                </button>
              </li>
              <li>
                <button className="flex items-center gap-2 text-primary hover:underline disabled:text-gray-400" disabled={!aceptaCondiciones} onClick={() => { setShowLegalPopup(false); navigate('/proteccion-datos'); }}>
                  <ShieldCheck className="w-4 h-4" /> Protección de datos
                </button>
              </li>
              <li>
                <button className="flex items-center gap-2 text-primary hover:underline disabled:text-gray-400" disabled={!aceptaCondiciones} onClick={() => { setShowLegalPopup(false); navigate('/politica-privacidad'); }}>
                  <FileText className="w-4 h-4" /> Política de privacidad
                </button>
              </li>
            </ul>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="acepta-condiciones" checked={aceptaCondiciones} onChange={e => setAceptaCondiciones(e.target.checked)} className="accent-primary" />
              <label htmlFor="acepta-condiciones" className="text-xs text-gray-700">He leído y acepto las condiciones legales</label>
            </div>
          </div>
        )}
      </div>
      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 w-full z-50 bg-slate-900 text-white px-4 py-4 flex flex-col sm:flex-row items-center justify-center gap-3 shadow-lg animate-fade-in">
          <span className="text-sm">Usamos cookies para mejorar tu experiencia. Consulta nuestra <Link to="/politica-privacidad" className="underline text-primary">Política de Privacidad</Link>.</span>
          <button onClick={aceptarCookies} className="ml-0 sm:ml-4 mt-2 sm:mt-0 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition">Aceptar</button>
        </div>
      )}
    </div>
  );
};

export default HomePage;