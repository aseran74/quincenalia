// Modificación mínima para forzar commit y push
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import AppleScrollHero from '@/components/landing/AppleScrollHero';
import TrustStrip from '@/components/landing/TrustStrip';
import { FeaturedProperties } from '@/components/FeaturedProperties';
import { useEffect, useState, useRef } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
    PiggyBank, Briefcase, Lock, Sparkles, ScrollText, Ban, MessageCircle, Receipt, ShieldCheck, Unlock, Home, Calendar, Timer, Banknote, Globe, ChevronRight, ArrowRight, Phone, Mail, MapPin, ChevronLeft, HelpCircle, Cookie, Star, Users, FileText, Presentation, Clock, Send, Compass, Info, Scale, WandSparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ContactForm from '@/components/ContactForm';
import './HomePage.css'; // Asegúrate de que este archivo exista y no cause conflictos
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { fadeUp, fadeIn, stagger, staggerFast, scaleIn, viewportOnce } from '@/components/landing/motion';

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
  const reduceMotion = useReducedMotion();
  const halfIndex = Math.ceil(FAQS.length / 2); 
  const columns = [FAQS.slice(0, halfIndex), FAQS.slice(halfIndex)];

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
      initial={reduceMotion ? false : 'hidden'}
      whileInView={reduceMotion ? undefined : 'show'}
      viewport={viewportOnce}
      variants={staggerFast}
    >
      {columns.map((col, colIdx) => (
        <Accordion key={colIdx} type="single" collapsible className="w-full space-y-3">
          {col.map((faq) => (
            <motion.div
              key={faq.id}
              variants={fadeUp}
              transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
            >
              <AccordionItem
                value={faq.id}
                className="group/item relative border border-slate-200/80 rounded-2xl bg-white shadow-sm transition-[border-color,box-shadow] duration-200 data-[state=open]:border-[#783046]/35 data-[state=open]:shadow-md hover:border-[#783046]/20 hover:shadow-md before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:origin-top before:scale-y-0 before:rounded-l-2xl before:bg-[#783046] before:transition-transform before:duration-200 before:ease-[cubic-bezier(0.23,1,0.32,1)] data-[state=open]:before:scale-y-100"
              >
                <AccordionTrigger className="group px-4 py-3.5 text-sm sm:text-base font-medium text-left hover:no-underline [&[data-state=open]>svg]:rotate-180">
                  <div className="flex items-center gap-3 pr-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#783046]/10 text-[#783046] transition-[background-color,color,transform] duration-200 group-data-[state=open]:bg-[#783046] group-data-[state=open]:text-white">
                      <faq.icon className="w-4 h-4" />
                    </span>
                    <span className="leading-snug">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-0 pl-[3.75rem] text-slate-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      ))}
    </motion.div>
  );
}

function ComoFunciona() {
  const [expandido, setExpandido] = useState(false);
  const reduceMotion = useReducedMotion();

  const steps = [
    {
      icon: Home,
      title: 'Compra Inteligente',
      text: 'Adquieres legalmente un proindiviso del 25% (o 50%) de una propiedad vacacional.',
      bg: '#CFB8FC',
      dark: false,
    },
    {
      icon: Calendar,
      title: 'Uso Garantizado',
      text: 'Mediante un contrato de uso y disfrute, tienes tus 15 días fijos en temporada alta (Jul/Ago) + 10 semanas flexibles al año, tu verano asegurado ¡para siempre!',
      bg: '#E8DAD9',
      dark: false,
    },
    {
      icon: PiggyBank,
      title: 'Gastos Compartidos',
      text: 'Divide los costes fijos (IBI, comunidad, seguros...) entre 4. ¡Mucho más económico!',
      bg: '#5C0FF5',
      dark: true,
    },
    {
      icon: Briefcase,
      title: 'Gestión Integral',
      text: 'Nos encargamos de TODO: limpieza, mantenimiento, facturas, impuestos... Tú solo disfruta.',
      bg: '#FFFFFF',
      dark: false,
    },
    {
      icon: Banknote,
      title: 'Rentabilidad Extra',
      text: 'Alquilamos tu propiedad en las semanas que no usas a través de las mejores plataformas (Airbnb, Booking...). ¡Ingresos pasivos!',
      bg: '#CFB8FC',
      dark: false,
    },
    {
      icon: Globe,
      title: 'Viaja por el Mundo',
      text: 'Intercambia tus semanas flexibles por estancias en otras propiedades exclusivas globalmente con nuestro sistema de puntos.',
      bg: '#E8DAD9',
      dark: false,
    },
  ];

  const beneficiosClave = [
    { icon: ShieldCheck, text: "Propiedad legal y segura (25% o 50% proindiviso)." },
    { icon: FileText, text: "Contrato claro: fechas fijas garantizadas + semanas flexibles." },
    { icon: Users, text: "Gestión profesional: olvídate de preocupaciones." },
    { icon: PiggyBank, text: "Potencial de ingresos por alquiler pasivo." },
    { icon: Globe, text: "Acceso a red global de intercambio de viviendas." },
  ];

  return (
    <section id="reinventada" className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={viewportOnce}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="text-2xl sm:text-4xl font-bold text-center mb-3 sm:mb-4 text-gray-800">
            Tu Segunda Residencia,{' '}
            <span className="relative inline-block">
              <span className="text-gray-800 font-bold">Reinventada</span>
              <svg
                viewBox="0 0 180 12"
                width="180"
                height="12"
                className="absolute left-1/2 -translate-x-1/2 top-full mt-0.5 w-[120px] sm:w-[180px]"
                aria-hidden="true"
              >
                <linearGradient id="linea-reinventada" x1="0" y1="0" x2="180" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#CDB6FC" />
                  <stop offset="0.5" stopColor="#CDB6FC" />
                  <stop offset="1" stopColor="#CDB6FC" />
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
          </motion.h2>
          <motion.p variants={fadeUp} className="text-base sm:text-lg text-center text-gray-600 max-w-3xl mx-auto px-1">
            Descubre cómo Quincenalia combina propiedad, disfrute y rentabilidad de forma única.
          </motion.p>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10"
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={viewportOnce}
          variants={stagger}
        >
          {steps.map((step, index) => (
            <motion.div key={index} variants={scaleIn}>
            <Card
              className={`group h-full border-0 shadow-sm hover:shadow-xl transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-2xl hover-lift pressable ${step.bg === '#FFFFFF' ? 'ring-1 ring-slate-200/80' : ''}`}
              style={{ backgroundColor: step.bg }}
            >
              <CardHeader className="flex flex-row items-center gap-3 sm:gap-4 pb-2">
                  <div className={`p-2.5 rounded-full transition-[background-color] duration-200 shrink-0 ${step.dark ? 'bg-white/20 group-hover:bg-white/30' : 'bg-white/70 group-hover:bg-white'}`}>
                      <step.icon className={`w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${step.dark ? 'text-white' : 'text-[#5C0FF5]'}`} />
                  </div>
                  <CardTitle className={`text-base sm:text-lg font-semibold ${step.dark ? 'text-white' : 'text-slate-900'}`}>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className={`text-sm leading-relaxed ${step.dark ? 'text-white/85' : 'text-slate-700'}`}>{step.text}</p>
              </CardContent>
            </Card>
            </motion.div>
          ))}
        </motion.div>
        
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
        <div className="text-center mt-6">
          <Link
            to="/contrato-uso"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full shadow-lg hover:bg-primary/90 transition-colors group"
            style={{ fontSize: '1.1rem' }}
          >
            <span>Ver Contrato de Uso y Disfrute</span>
            <FileText className="w-6 h-6 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110" />
          </Link>
        </div>
      </div>
    </section>
  );
}

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
  'Marruecos': '/marruecos.jpeg',
  'República Dominicana': '/repdominicana.jpg',
};

// Función para obtener la ruta de la imagen de la zona
function getZonaImage(zona: string) {
  return IMAGENES_ZONA[zona] || '/placeholder.svg';
}

// Función para normalizar nombres de zona (quita tildes, puntos, espacios y pasa a minúsculas)
function normalizaZona(z: string) {
  return (z || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\./g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function getZonaCount(zona: string, viviendasPorZona: Record<string, number>) {
  const zonaKey = Object.keys(viviendasPorZona).find(
    (key) => normalizaZona(key) === normalizaZona(zona)
  );
  if (!zonaKey) return null;
  const total = viviendasPorZona[zonaKey];
  return Number.isFinite(total) ? total : null;
}

const HomePage = () => {
  const [viviendasPorZona, setViviendasPorZona] = useState<{ [key: string]: number }>({});
  const [zonasUnicas, setZonasUnicas] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [faqExpandido, setFaqExpandido] = useState(false);
  const [showLegalPopup, setShowLegalPopup] = useState(false);
  const navigate = useNavigate();
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const reduceMotion = useReducedMotion();

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
      (data || []).forEach((row: { zona?: string; total?: number }) => {
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
      const zonas = Array.from(new Set((data || []).map((p: { zona?: string }) => (p.zona || '').trim()))).filter(z => z).sort();
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

  return (
    <div className="landing-page min-h-screen bg-white font-walsheim">
      <a
        href="#zonas-destacadas"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900 focus:shadow-lg"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <AppleScrollHero />
      <section id="zonas-destacadas" className="relative z-10 py-8 sm:py-12 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-6 sm:mb-12"
            initial={reduceMotion ? false : 'hidden'}
            whileInView={reduceMotion ? undefined : 'show'}
            viewport={viewportOnce}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-4xl font-bold text-center mb-2 sm:mb-3 text-gray-800">
            Explora por{' '}
            <span className="relative inline-block">
              <span className="text-gray-800 font-bold">zonas</span>
              <svg
                viewBox="0 0 180 12"
                width="180"
                height="12"
                className="absolute left-1/2 -translate-x-1/2 top-full mt-0.5 w-[120px] sm:w-[180px]"
                aria-hidden="true"
              >
                <linearGradient id="linea-zonas" x1="0" y1="0" x2="180" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#CDB6FC" />
                  <stop offset="0.5" stopColor="#CDB6FC" />
                  <stop offset="1" stopColor="#CDB6FC" />
                </linearGradient>
                <path
                  d="M 0 10 Q 90 0, 180 10"
                  fill="none"
                  stroke="url(#linea-zonas)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-primary text-3xl sm:text-4xl align-middle ml-1">.</span>
            </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base sm:text-lg text-center text-gray-600 max-w-2xl mx-auto px-2">
            Encuentra tu refugio perfecto en las regiones más deseadas.
            </motion.p>
            <motion.div variants={fadeUp} className="text-center mt-6 sm:mt-8">
            <Button asChild variant="default" size="lg" className="group rounded-full px-6">
              <Link to="/properties">
                Ver Todas las Propiedades
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-1" />
              </Link>
            </Button>
            </motion.div>
          </motion.div>
          <div className="relative block md:hidden">
            <button
              type="button"
              aria-label="Zona anterior"
              onClick={() => scrollZonaCarrusel('left')}
              className="absolute left-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/80 text-slate-800 shadow-md backdrop-blur-md cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Zona siguiente"
              onClick={() => scrollZonaCarrusel('right')}
              className="absolute right-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/80 text-slate-800 shadow-md backdrop-blur-md cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="py-2 px-8">
              <div
                ref={scrollContainerRef}
                role="region"
                aria-label="Zonas destacadas"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    scrollZonaCarrusel('left');
                  }
                  if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    scrollZonaCarrusel('right');
                  }
                }}
                className="flex space-x-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory"
              >
                {zonasUnicas.map((zona, index) => {
                  const countZona = getZonaCount(zona, viviendasPorZona);
                  return (
                    <Link
                      to={`/properties?zona=${encodeURIComponent(zona)}`}
                      key={zona}
                      className="flex-shrink-0 w-[72vw] max-w-[280px] snap-center cursor-pointer"
                    >
                      <Card className="overflow-hidden rounded-2xl group/card w-full aspect-[16/10] border border-primary/20 bg-white relative shadow-sm transition-[box-shadow] duration-200 hover:shadow-md">
                        <div className="relative w-full h-full">
                          <img
                            src={getZonaImage(zona)}
                            alt={`Propiedades en ${zona}`}
                            width={280}
                            height={175}
                            loading={index < 2 ? 'eager' : 'lazy'}
                            decoding="async"
                            className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] group-hover/card:scale-[1.04]"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-property.jpg'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"></div>
                          <div className="absolute bottom-3 left-0 right-0 px-3 text-center">
                            <h3 className="text-base font-semibold text-white truncate" title={zona}>
                              {zona}
                            </h3>
                            <p className="text-xs text-white/90 mt-0.5">
                              {countZona == null
                                ? 'Ver propiedades'
                                : `${countZona} ${countZona === 1 ? 'vivienda' : 'viviendas'}`}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
            <p className="text-center text-xs text-slate-500 mt-1">Desliza o usa las flechas para ver más zonas</p>
          </div>

          <div className="hidden md:block">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-6xl mx-auto">
              {zonasUnicas.map((zona, index) => {
                const countZona = getZonaCount(zona, viviendasPorZona);
                return (
                  <Link
                    key={zona}
                    to={`/properties?zona=${encodeURIComponent(zona)}`}
                    className="block cursor-pointer"
                  >
                    <Card className="overflow-hidden rounded-2xl group/card bg-white relative aspect-[16/10] border border-primary/20 transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-xl hover:border-primary/40 hover:-translate-y-1">
                      <div className="relative w-full h-full">
                        <img
                          src={getZonaImage(zona)}
                          alt={`Propiedades en ${zona}`}
                          width={400}
                          height={250}
                          loading={index < 4 ? 'eager' : 'lazy'}
                          decoding="async"
                          className="w-full h-full object-cover rounded-2xl transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] group-hover/card:scale-[1.04]"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-property.jpg'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-2xl"></div>
                        <div className="absolute bottom-3 left-0 right-0 px-3 text-center">
                          <h3 className="text-sm font-semibold text-white truncate" title={zona}>
                            {zona}
                          </h3>
                          <p className="text-xs text-white/90 mt-0.5">
                            {countZona == null
                              ? 'Ver propiedades'
                              : `${countZona} ${countZona === 1 ? 'vivienda' : 'viviendas'}`}
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
      </section>
      <TrustStrip />
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={reduceMotion ? false : 'hidden'}
            whileInView={reduceMotion ? undefined : 'show'}
            viewport={viewportOnce}
            variants={stagger}
          >
          <motion.h2 variants={fadeUp} className="text-2xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-800">
            Oportunidades{' '}
            <span className="relative inline-block">
              <span className="text-gray-800 font-bold">exclusivas</span>
              <svg
                viewBox="0 0 180 12"
                width="180"
                height="12"
                className="absolute left-1/2 -translate-x-1/2 top-full mt-0.5 w-[120px] sm:w-[180px]"
                aria-hidden="true"
              >
                <linearGradient id="linea-exclusivas" x1="0" y1="0" x2="180" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#CDB6FC" />
                  <stop offset="0.5" stopColor="#CDB6FC" />
                  <stop offset="1" stopColor="#CDB6FC" />
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
          </motion.h2>
          <motion.div variants={fadeIn}>
          <FeaturedProperties />
          <p className="mt-4 text-center text-xs text-slate-500">
            * La cuota mensual estimada incluye un 7% extra en gastos de compra (notaría, registro, gestoría e impuestos).
          </p>
          </motion.div>
          </motion.div>
        </div>
      </section>
      <ComoFunciona />
      <section id="contacto" className="py-16 sm:py-24 bg-[#E8DAD9]">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Cabecera a ancho completo */}
          <motion.div
            className="text-center max-w-3xl mx-auto mb-10 sm:mb-14"
            initial={reduceMotion ? false : 'hidden'}
            whileInView={reduceMotion ? undefined : 'show'}
            viewport={viewportOnce}
            variants={stagger}
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full bg-white/70 text-[#6F4C48] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Contacto
            </motion.span>

            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-slate-900 leading-tight mb-4">
              ¿Listo para tener tu{' '}
              <span className="relative inline-block text-[#6F4C48]">
                segunda vacacional
                <svg
                  viewBox="0 0 180 12"
                  width="180"
                  height="12"
                  className="absolute left-0 top-full mt-1 w-full max-w-[220px]"
                  aria-hidden="true"
                >
                  <linearGradient id="linea-empezar" x1="0" y1="0" x2="180" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6F4C48" />
                    <stop offset="0.5" stopColor="#6F4C48" />
                    <stop offset="1" stopColor="#6F4C48" />
                  </linearGradient>
                  <path
                    d="M 0 10 Q 90 0, 180 10"
                    fill="none"
                    stroke="url(#linea-empezar)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              ?
            </motion.h2>

            <motion.p variants={fadeUp} className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Cuéntanos qué buscas y te ayudamos a dar el primer paso hacia tu segunda residencia inteligente.
            </motion.p>
          </motion.div>

          {/* Dos columnas: contacto | formulario — misma altura y tipografía */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
            <motion.div
              className="h-full"
              initial={reduceMotion ? false : 'hidden'}
              whileInView={reduceMotion ? undefined : 'show'}
              viewport={viewportOnce}
              variants={fadeUp}
            >
              <div className="h-full rounded-3xl border border-white/80 bg-white/90 shadow-xl shadow-[#6F4C48]/10 p-6 sm:p-8 lg:p-10 flex flex-col">
                <div className="flex items-start gap-4 mb-6 sm:mb-8">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8DAD9]">
                    <Phone className="w-5 h-5 text-[#6F4C48]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Contacta con nosotros</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      Llámanos, escríbenos o visita nuestras oficinas con cita previa.
                    </p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-3 min-h-0">
                  <div className="flex items-center gap-4 rounded-2xl border border-[#E8DAD9] bg-[#E8DAD9]/50 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8DAD9]">
                      <Clock className="w-5 h-5 text-[#6F4C48]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Respuesta en menos de 24 h</p>
                      <p className="text-sm text-slate-500">Lunes a viernes, horario laboral</p>
                    </div>
                  </div>

                  {[
                    {
                      href: 'tel:+34616462861',
                      icon: Phone,
                      label: 'Llámanos',
                      value: '+34 616 462 861',
                      external: true,
                    },
                    {
                      href: 'mailto:info@quincenalia.com',
                      icon: Mail,
                      label: 'Escríbenos',
                      value: 'info@quincenalia.com',
                      external: true,
                    },
                    {
                      href: undefined,
                      icon: MapPin,
                      label: 'Visítanos (con cita)',
                      value: 'Av. de Burgos 52, Madrid',
                      detail: 'Próximamente Barcelona y Málaga · cita previa',
                      external: false,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    const inner = (
                      <>
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8DAD9] text-[#6F4C48] transition-colors group-hover:bg-[#6F4C48] group-hover:text-white">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-700">{item.label}</p>
                          <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-[#6F4C48] transition-colors mt-0.5">
                            {item.value}
                          </p>
                          {item.detail && (
                            <p className="text-sm text-slate-500 mt-1 leading-snug">{item.detail}</p>
                          )}
                        </div>
                        {item.external && (
                          <ChevronRight className="w-5 h-5 text-slate-300 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-[#6F4C48]" />
                        )}
                      </>
                    );

                    const cardClass =
                      'group flex flex-1 items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-[border-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-[#E8DAD9] hover:shadow-md pressable min-h-[4.5rem]';

                    return item.href ? (
                      <a key={item.label} href={item.href} className={cardClass}>
                        {inner}
                      </a>
                    ) : (
                      <div key={item.label} className={cardClass}>
                        {inner}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            <motion.div
              className="h-full"
              initial={reduceMotion ? false : 'hidden'}
              whileInView={reduceMotion ? undefined : 'show'}
              viewport={viewportOnce}
              variants={fadeUp}
            >
              <div className="h-full rounded-3xl border border-white/80 bg-white/90 shadow-xl shadow-[#6F4C48]/10 p-6 sm:p-8 lg:p-10 flex flex-col">
                <div className="flex items-start gap-4 mb-6 sm:mb-8">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8DAD9]">
                    <Send className="w-5 h-5 text-[#6F4C48]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Envíanos un mensaje</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      Rellena el formulario y un asesor se pondrá en contacto contigo.
                    </p>
                  </div>
                </div>
                <div className="flex-1 flex flex-col min-h-0">
                  <ContactForm variant="landing" className="flex-1 flex flex-col" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <section id="faq" className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            className="text-center mb-8 sm:mb-10"
            initial={reduceMotion ? false : 'hidden'}
            whileInView={reduceMotion ? undefined : 'show'}
            viewport={viewportOnce}
            variants={stagger}
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full bg-[#783046]/10 border border-[#783046]/20 text-[#783046] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-4"
            >
              <motion.span
                animate={reduceMotion ? undefined : { rotate: [0, -10, 8, 0] }}
                transition={{ duration: 0.55, delay: 0.25, ease: [0.23, 1, 0.32, 1] }}
                className="inline-flex"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </motion.span>
              FAQ
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-4xl font-bold text-slate-900 mb-3">
              <span className="relative inline-block">
                Resolvemos tus dudas
                <svg
                  viewBox="0 0 220 12"
                  width="220"
                  height="12"
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-0.5 w-[160px] sm:w-[220px]"
                  aria-hidden="true"
                >
                  <motion.path
                    d="M 0 10 Q 110 0, 220 10"
                    fill="none"
                    stroke="#783046"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
                <span className="text-[#783046] align-middle ml-0.5">.</span>
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
              Gastos, tarifas, alquiler, intercambio… las respuestas a lo más habitual.
            </motion.p>
          </motion.div>
          <AnimatePresence initial={false}>
            {faqExpandido && (
              <motion.div
                key="faq-list"
                initial={reduceMotion ? false : { opacity: 0, transform: 'translateY(12px)' }}
                animate={{ opacity: 1, transform: 'translateY(0px)' }}
                exit={reduceMotion ? undefined : { opacity: 0, transform: 'translateY(-6px)' }}
                transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                className="max-w-4xl mx-auto"
              >
                <FAQAccordion />
                <div className="text-center mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setFaqExpandido(false)}
                    className="rounded-full px-6 border-slate-200 hover:bg-white"
                  >
                    Ocultar preguntas
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!faqExpandido && (
            <motion.div
              className="text-center"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                variant="default"
                onClick={() => setFaqExpandido(true)}
                className="rounded-full px-8 h-12 font-semibold shadow-md"
              >
                Ver preguntas frecuentes
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      <footer className="px-3 pb-3 sm:px-4 sm:pb-4 md:px-6 md:pb-6 lg:px-8">
        <div className="bg-[#8D57F8] text-white rounded-[2rem] overflow-hidden py-8 sm:py-12 md:py-14 px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 text-sm font-normal">
            {/* Móvil: corto */}
            <div className="md:hidden flex flex-col items-center text-center gap-4">
              <a
                href="mailto:info@quincenalia.com"
                className="inline-flex items-center gap-1.5 text-sm text-white/90 hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                info@quincenalia.com
              </a>
              <a
                href="tel:+34616462861"
                className="inline-flex items-center gap-1.5 text-sm text-white/90 hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                +34 616 462 861
              </a>
              <p className="inline-flex items-center gap-1.5 text-sm text-white/90">
                <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                Av. de Burgos 52, Madrid
              </p>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-white/90">
                <Link to="/terminos-servicio" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                  <FileText className="w-3.5 h-3.5" aria-hidden="true" /> Términos
                </Link>
                <Link to="/politica-privacidad" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> Privacidad
                </Link>
                <Link to="/politica-cookies" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                  <Cookie className="w-3.5 h-3.5" aria-hidden="true" /> Cookies
                </Link>
              </div>
              <div className="max-w-xs text-left space-y-2">
                <h4 className="font-semibold h-5 text-white uppercase tracking-wide text-xs flex items-center justify-center gap-1.5 w-full">
                  <WandSparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  Otra manera de veranear
                </h4>
                <p className="text-sm text-white/90 leading-relaxed text-center">
                  La forma inteligente de poseer, disfrutar y rentabilizar tu segunda residencia.
                </p>
              </div>
              <div className="w-full border-t border-white/25 pt-4 flex flex-col items-center gap-3 text-xs text-white/80">
                <p>© {new Date().getFullYear()} Quincenalia. Todos los derechos reservados.</p>
                <Link to="/" aria-label="Quincenalia" className="inline-flex">
                  <img src="/logo-blanco.png" alt="Quincenalia" className="h-[4.5rem] w-auto mix-blend-screen" />
                </Link>
              </div>
            </div>

            {/* Desktop: contacto | navegación | legal | Quincenalia */}
            <div className="hidden md:block">
              <div className="mx-auto grid max-w-5xl grid-cols-4 gap-x-6 lg:gap-x-8 items-start">
                <div className="min-w-0">
                  <h4 className="font-semibold mb-4 h-5 text-white uppercase tracking-wide text-xs flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> Contacto
                  </h4>
                  <ul className="space-y-2.5 text-white/90">
                    <li>
                      <a
                        href="mailto:info@quincenalia.com"
                        className="hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Send className="w-4 h-4 text-white/80 shrink-0" aria-hidden="true" />
                        info@quincenalia.com
                      </a>
                    </li>
                    <li>
                      <a
                        href="tel:+34616462861"
                        className="hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Phone className="w-4 h-4 text-white/80 shrink-0" aria-hidden="true" />
                        +34 616 462 861
                      </a>
                    </li>
                    <li>
                      <span className="inline-flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-white/80 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>
                          Av. de Burgos 52, Madrid
                          <span className="block text-white/70 text-xs mt-0.5">
                            Próximamente Barcelona y Málaga · cita previa
                          </span>
                        </span>
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="min-w-0">
                  <h4 className="font-semibold mb-4 h-5 text-white uppercase tracking-wide text-xs inline-flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> Navegación
                  </h4>
                  <ul className="space-y-2.5 text-white/90">
                    <li>
                      <Link to="/propiedades" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                        <Home className="w-4 h-4 text-white/80 shrink-0" aria-hidden="true" /> Propiedades
                      </Link>
                    </li>
                    <li>
                      <a href="#zonas-destacadas" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                        <MapPin className="w-4 h-4 text-white/80 shrink-0" aria-hidden="true" /> Zonas Destacadas
                      </a>
                    </li>
                    <li>
                      <a href="#reinventada" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                        <Info className="w-4 h-4 text-white/80 shrink-0" aria-hidden="true" /> Cómo Funciona
                      </a>
                    </li>
                    <li>
                      <a href="#faq" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                        <HelpCircle className="w-4 h-4 text-white/80 shrink-0" aria-hidden="true" /> FAQ
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="min-w-0">
                  <h4 className="font-semibold mb-4 h-5 text-white uppercase tracking-wide text-xs inline-flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> Legal
                  </h4>
                  <ul className="space-y-2.5 text-white/90">
                    <li>
                      <Link to="/terminos-servicio" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                        <FileText className="w-4 h-4 text-white/80 shrink-0" aria-hidden="true" /> Términos de Servicio
                      </Link>
                    </li>
                    <li>
                      <Link to="/politica-privacidad" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                        <ShieldCheck className="w-4 h-4 text-white/80 shrink-0" aria-hidden="true" /> Política de Privacidad
                      </Link>
                    </li>
                    <li>
                      <Link to="/politica-cookies" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                        <Cookie className="w-4 h-4 text-white/80 shrink-0" aria-hidden="true" /> Política de Cookies
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className="min-w-0 text-left">
                  <h4 className="font-semibold mb-4 h-5 text-white uppercase tracking-wide text-xs flex items-center gap-1.5">
                    <WandSparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    Otra manera de veranear
                  </h4>
                  <p className="text-white/90 leading-relaxed text-sm">
                    La forma inteligente de poseer, disfrutar y rentabilizar tu segunda residencia.
                  </p>
                </div>
              </div>
              <div className="mt-10 border-t border-white/25 pt-6 flex flex-col items-center gap-4 text-center text-xs text-white/80">
                <p>© {new Date().getFullYear()} Quincenalia. Todos los derechos reservados.</p>
                <Link to="/" aria-label="Quincenalia" className="inline-flex">
                  <img
                    src="/logo-blanco.png"
                    alt="Quincenalia"
                    className="h-12 w-auto mix-blend-screen"
                  />
                </Link>
              </div>
            </div>
          </div>
      </footer>
      <div>
        <button
          className={`fixed right-6 z-50 bg-primary text-primary-foreground rounded-full shadow-lg w-14 h-14 flex items-center justify-center hover:bg-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 cursor-pointer ${showCookieBanner ? 'bottom-28' : 'bottom-6'}`}
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
          onClick={() => setShowLegalPopup(v => !v)}
          aria-expanded={showLegalPopup}
          aria-label="Ayuda y legal"
        >
          <HelpCircle className="w-7 h-7" />
        </button>
        {showLegalPopup && (
          <div className={`fixed right-6 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-72 ${showCookieBanner ? 'bottom-[11.5rem]' : 'bottom-24'}`}>
            <h4 className="font-semibold text-lg mb-2 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-primary" />Ayuda y Legal</h4>
            <ul className="space-y-2 mb-3">
              <li>
                <button className="flex items-center gap-2 text-primary hover:underline" onClick={() => { setFaqExpandido(true); setShowLegalPopup(false); setTimeout(() => { const faq = document.getElementById('faq'); if (faq) faq.scrollIntoView({ behavior: 'smooth' }); }, 100); }}>
                  <HelpCircle className="w-4 h-4" /> FAQ
                </button>
              </li>
              <li>
                <button className="flex min-h-11 items-center gap-2 text-primary hover:underline cursor-pointer" onClick={() => { setShowLegalPopup(false); navigate('/proteccion-datos'); }}>
                  <ShieldCheck className="w-4 h-4" /> Protección de datos
                </button>
              </li>
              <li>
                <button className="flex min-h-11 items-center gap-2 text-primary hover:underline cursor-pointer" onClick={() => { setShowLegalPopup(false); navigate('/politica-privacidad'); }}>
                  <FileText className="w-4 h-4" /> Política de privacidad
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 w-full z-50 bg-slate-900 text-white px-4 py-4 flex flex-col sm:flex-row items-center justify-center gap-3 shadow-lg animate-fade-in">
          <span className="text-sm">Usamos cookies para mejorar tu experiencia. Consulta nuestra <Link to="/politica-privacidad" className="underline text-primary">Política de Privacidad</Link>.</span>
          <button onClick={aceptarCookies} className="ml-0 sm:ml-4 mt-2 sm:mt-0 min-h-11 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition cursor-pointer">Aceptar</button>
        </div>
      )}
      {/* Icono del Pitch Deck */}
      <a
        href="https://holydeo.my.canva.site/quincenalia"
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed left-6 z-50 bg-primary text-primary-foreground rounded-full shadow-lg w-14 h-14 flex items-center justify-center hover:bg-primary/90 transition-all duration-300 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 group cursor-pointer ${showCookieBanner ? 'bottom-28' : 'bottom-6'}`}
        aria-label="Ver Pitch Deck"
        title="Ver Pitch Deck"
      >
        <Presentation className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </a>
    </div>
  );
};

export default HomePage;