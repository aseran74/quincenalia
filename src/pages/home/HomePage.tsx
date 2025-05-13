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
    PiggyBank, Briefcase, Lock, Sparkles, ScrollText, Ban, MessageCircle, Receipt, ShieldCheck, Unlock, Home, Calendar, Timer, Banknote, Globe, ChevronRight, ArrowRight, Phone, Mail, MapPin, ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ContactForm from '@/components/ContactForm';
import './HomePage.css';
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
          <AccordionItem value={faq.id} key={faq.id} className="border border-border rounded-lg bg-background shadow-sm transition-shadow hover:shadow-md">
            <AccordionTrigger className="px-4 py-3 text-sm sm:text-base font-medium text-left hover:no-underline [&[data-state=open]>svg]:rotate-90">
              <div className="flex items-center gap-3">
                <faq.icon className="w-5 h-5 text-primary flex-shrink-0" />
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
          <AccordionItem value={faq.id} key={faq.id} className="border border-border rounded-lg bg-background shadow-sm transition-shadow hover:shadow-md">
            <AccordionTrigger className="px-4 py-3 text-sm sm:text-base font-medium text-left hover:no-underline [&[data-state=open]>svg]:rotate-90">
               <div className="flex items-center gap-3">
                <faq.icon className="w-5 h-5 text-primary flex-shrink-0" />
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

  return (
    <section id="reinventada" className="py-16 sm:py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-gray-800">Tu Segunda Residencia, Reinventada</h2>
        <p className="text-lg text-center text-gray-600 mb-10 sm:mb-12 max-w-3xl mx-auto">Descubre cómo Quincenalia combina propiedad, disfrute y rentabilidad de forma única.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {steps.map((step, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                      <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-semibold">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-sm text-gray-600">{step.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expandido ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
           <div className="text-center text-sm sm:text-base text-gray-700 max-w-3xl mx-auto space-y-4">
                 <p><strong>¿Por qué conformarte con alquilar cuando puedes ser propietario?</strong> Inspirados en soluciones inteligentes, hemos creado un modelo que te da lo mejor de todos los mundos.</p>
                 <div className="text-left inline-block bg-white p-4 rounded-lg border shadow-sm">
                    <p className="font-semibold text-primary mb-2">Beneficios Clave:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Propiedad legal y segura (25% o 50% proindiviso).</li>
                        <li>Contrato claro: fechas fijas garantizadas + semanas flexibles.</li>
                        <li>Gestión profesional: olvídate de preocupaciones.</li>
                        <li>Potencial de ingresos por alquiler pasivo.</li>
                        <li>Acceso a red global de intercambio de viviendas.</li>
                    </ul>
                 </div>
                 <p className="font-semibold text-primary mt-4">🌟 Propietario + Viajero + Inversor: Todo en uno. 🌟</p>
            </div>
        </div>
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => setExpandido(!expandido)}
            className="group transition-all duration-300"
          >
            {expandido ? 'Mostrar Menos' : 'Descubrir Más Detalles'}
            <ChevronRight className={`ml-2 h-4 w-4 transition-transform duration-300 ${expandido ? 'rotate-90' : ''} group-hover:translate-x-1`} />
          </Button>
        </div>
      </div>
    </section>
  );
}

// Hero con efecto zoom animado (sin parallax)
const HeroParallax = () => {
  return (
    <img
      src="/hero.jpg"
      alt="Villa vacacional de lujo con piscina y vistas al mar"
      className="w-full h-full object-cover hero-image"
    />
  );
};

const ZONAS_DESTACADAS = [
  {
    zona: 'Costa de levante.',
    image: '/LEvante.webp',
    link: '/properties?zona=Costa%20de%20levante.',
  },
  {
    zona: 'Canarias.',
    image: '/Canarias.webp',
    link: '/properties?zona=Canarias.',
  },
  {
    zona: 'Baleares.',
    image: '/Imagenes.webp',
    link: '/properties?zona=Baleares.',
  },
  {
    zona: 'Costa Catalana',
    image: '/Costa catalana.webp',
    link: '/properties?zona=Costa%20Catalana',
  },
  {
    zona: 'Andalucia',
    image: '/andalucia.jpg',
    link: '/properties?zona=Andalucia',
  },
  {
    zona: 'Euskadi.',
    image: '/Euskadi.webp',
    link: '/properties?zona=Euskadi.',
  },
  {
    zona: 'Asturias.',
    image: '/Asturias.webp',
    link: '/properties?zona=Asturias.',
  },
  {
    zona: 'Galicia',
    image: '/Galicia.webp',
    link: '/properties?zona=Galicia',
  },
  {
    zona: 'Murcia',
    image: '/placeholder.svg',
    link: '/properties?zona=Murcia',
  },
  {
    zona: 'Zonas de interior.',
    image: '/placeholder.svg',
    link: '/properties?zona=Zonas%20de%20interior.',
  },
];

// Función para normalizar zonas (sin tildes y en minúsculas)
function normalizaZona(z: string) {
  return z.normalize('NFD').replace(/[ -]/g, '').toLowerCase();
}

const HomePage = () => {
  const [viviendasPorZona, setViviendasPorZona] = useState<{ [key: string]: number }>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchViviendasPorZona = async () => {
      const { data, error } = await supabase.rpc('viviendas_por_zona');
      if (error) return;
      const counts: { [key: string]: number } = {};
      (data || []).forEach((row: any) => {
        if (row.zona) {
          counts[row.zona] = Number(row.total);
        }
      });
      setViviendasPorZona(counts);
    };
    fetchViviendasPorZona();
  }, []);

  // Renombrar la función scroll
  const scrollZonaCarrusel = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -500 : 500;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3 text-gray-800">Explora por Zonas</h2>
          <p className="text-lg text-center text-gray-600 mb-10 sm:mb-12 max-w-2xl mx-auto">
            Encuentra tu refugio perfecto en las regiones más deseadas.
          </p>
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-6 z-10 rounded-full bg-white/80 hover:bg-white shadow-md backdrop-blur-sm"
              onClick={() => scrollZonaCarrusel('left')}
              aria-label="Scroll Left"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="px-2 py-6">
              <div ref={scrollContainerRef} className="flex space-x-4 md:space-x-6 overflow-x-auto pb-4 scrollbar-hide">
                {ZONAS_DESTACADAS.map((zonaObj, index) => {
                  const normalizedCurrentZona = normalizaZona(zonaObj.zona);
                  const count = viviendasPorZona[normalizedCurrentZona] || 0;
                  return (
                    <Link to={zonaObj.link} key={index} className="flex-shrink-0 w-64 sm:w-72 group/card-link">
                      <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl transform hover:-translate-y-1 rounded-2xl group/card">
                        <div className="relative h-48">
                          <img
                            src={zonaObj.image}
                            alt={`Propiedades en ${zonaObj.zona}`}
                            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover/card:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-90 group-hover/card:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-xl font-bold text-white truncate" title={zonaObj.zona}>
                              {zonaObj.zona}
                            </h3>
                            <p className="text-sm text-gray-100 mt-1">
                              {count} {count === 1 ? 'vivienda' : 'viviendas'}
                            </p>
                          </div>
                        </div>
                        <div className="h-1 bg-primary/0 group-hover/card:bg-primary transition-all duration-300"></div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-6 z-10 rounded-full bg-white/80 hover:bg-white shadow-md backdrop-blur-sm"
              onClick={() => scrollZonaCarrusel('right')}
              aria-label="Scroll Right"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <div className="text-center mt-10">
            <Button asChild variant="default" size="lg" className="group">
              <Link to="/properties">
                Ver Todas las Propiedades
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-12 text-gray-800">
            Oportunidades Exclusivas
          </h2>
          <FeaturedProperties />
        </div>
      </section>
      <ComoFunciona />
      <section id="contacto" className="py-16 sm:py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">¿Listo para Empezar?</h2>
              <p className="text-lg text-gray-600 mb-6">
                Contacta con nosotros para descubrir cómo Quincenalia puede transformar tu forma de disfrutar y rentabilizar
                tus vacaciones. Nuestro equipo está listo para asesorarte.
              </p>
              <div className="space-y-4">
                <a href="tel:+34666777888" className="flex items-center text-gray-700 hover:text-primary transition-colors">
                  <Phone className="w-5 h-5 mr-3 text-primary" />
                  <span>+34 666 777 888</span>
                </a>
                <a href="mailto:info@quincenalia.com" className="flex items-center text-gray-700 hover:text-primary transition-colors">
                  <Mail className="w-5 h-5 mr-3 text-primary" />
                  <span>info@quincenalia.com</span>
                </a>
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-5 h-5 mr-3 text-primary flex-shrink-0" />
                  <span>Oficinas en Madrid, Barcelona y Málaga (Visitas con cita previa)</span>
                </div>
              </div>
            </div>
            <Card className="bg-white shadow-xl p-6 sm:p-8 rounded-2xl">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-2xl font-semibold text-gray-800">Envíanos un Mensaje</CardTitle>
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
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-12 text-gray-800">Resolvemos tus Dudas</h2>
          <div className="max-w-4xl mx-auto">
            <FAQAccordion />
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-gray-300 py-12 sm:py-16 text-[16px] font-normal">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <h3 className="text-2xl font-bold mb-3 text-white">Quincenalia</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                La forma inteligente de poseer, disfrutar y rentabilizar tu segunda residencia.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-100 uppercase tracking-wide">Explorar</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Propiedades</a></li>
                <li><a href="#como-funciona" className="hover:text-primary transition-colors">Cómo Funciona</a></li>
                <li><a href="#faq" className="hover:text-primary transition-colors">Preguntas Frecuentes</a></li>
                <li><a href="#contacto" className="hover:text-primary transition-colors">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-100 uppercase tracking-wide">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Términos de Servicio</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Política de Privacidad</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Política de Cookies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-100 uppercase tracking-wide">Contacto</h4>
              <ul className="space-y-2 text-sm">
                 <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary"/>
                    <a href="mailto:info@quincenalia.com" className="hover:text-primary transition-colors">info@quincenalia.com</a>
                 </li>
                 <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary"/>
                    <a href="tel:+914156882" className="hover:text-primary transition-colors">+34 914156882 </a></li>
                 <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary mt-1"/>
                    <span>Avenida de Burgos 155<br/>Madrid, 28036, España</span>
                 </li>
              </ul>
              <div className="flex space-x-3 mt-4">
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Quincenalia. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 