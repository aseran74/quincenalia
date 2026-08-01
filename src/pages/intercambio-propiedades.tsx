import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import {
  RefreshCw, Home, Calendar, Search,
  Users, Shield, CheckCircle, ArrowRight,
  Star, MessageSquare, TrendingUp,
  Heart, Globe, Lock, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const IntercambioPropiedades = () => {
  const { isAuthenticated } = useAuth();

  const steps = [
    {
      icon: Home,
      title: 'Registra tu propiedad',
      description: 'Añade tu vivienda al sistema: fotos, descripción, disponibilidad y preferencias de intercambio.',
      details: [
        'Sube fotos de alta calidad',
        'Describe características y servicios',
        'Define períodos disponibles',
        'Establece preferencias de intercambio',
      ],
      image: '/interior.jpg',
      accent: 'from-sky-500/20 to-cyan-400/10',
    },
    {
      icon: Search,
      title: 'Explora opciones',
      description: 'Navega el catálogo y filtra por ubicación, fechas y características.',
      details: [
        'Busca por destino y fechas',
        'Filtra por tipo y servicios',
        'Compara varias opciones',
        'Guarda favoritas',
      ],
      image: '/hero.jpg',
      accent: 'from-blue-500/20 to-indigo-400/10',
    },
    {
      icon: MessageSquare,
      title: 'Contacta al propietario',
      description: 'Habla directamente, aclara dudas y confirma disponibilidad.',
      details: [
        'Mensajería integrada',
        'Negocia fechas y condiciones',
        'Resuelve dudas antes de confirmar',
        'Construye confianza',
      ],
      image: '/baleares.webp',
      accent: 'from-teal-500/20 to-emerald-400/10',
    },
    {
      icon: RefreshCw,
      title: 'Confirma el intercambio',
      description: 'Cuando todo esté claro, confirmáis el acuerdo y recibís la documentación.',
      details: [
        'Confirmación mutua',
        'Documentación automática',
        'Calendarios actualizados',
        'Notificaciones al instante',
      ],
      image: '/Canarias.webp',
      accent: 'from-amber-500/20 to-orange-400/10',
    },
    {
      icon: CheckCircle,
      title: 'Disfruta tu estancia',
      description: 'Vive en su casa mientras ellos disfrutan de la tuya, con soporte y valoraciones.',
      details: [
        'Info completa de la propiedad',
        'Soporte durante la estancia',
        'Valoraciones post-viaje',
        'Posibilidad de repetir',
      ],
      image: '/andalucia.jpg',
      accent: 'from-rose-500/20 to-pink-400/10',
    },
  ];

  const benefits = [
    {
      icon: Globe,
      title: 'Viaja sin coste de alojamiento',
      description: 'Intercambia y viaja sin pagar hotel ni alquiler vacacional',
    },
    {
      icon: Home,
      title: 'Experiencia auténtica',
      description: 'Vive como un local en casas reales y acogedoras',
    },
    {
      icon: Shield,
      title: 'Intercambio seguro',
      description: 'Sistema verificado y protegido para tu tranquilidad',
    },
    {
      icon: Heart,
      title: 'Comunidad de confianza',
      description: 'Propietarios responsables y valorados',
    },
    {
      icon: TrendingUp,
      title: 'Rentabiliza tu propiedad',
      description: 'Aprovecha tu casa cuando no la usas',
    },
    {
      icon: Users,
      title: 'Conoce nuevas personas',
      description: 'Conecta con propietarios de otros destinos',
    },
  ];

  const howItWorks = [
    {
      icon: Lock,
      title: 'Sistema de verificación',
      description: 'Todas las propiedades pasan un proceso de verificación de calidad y autenticidad.',
    },
    {
      icon: Calendar,
      title: 'Calendario sincronizado',
      description: 'Gestiona disponibilidad y encuentra fechas compatibles con facilidad.',
    },
    {
      icon: Star,
      title: 'Sistema de valoraciones',
      description: 'Valora y recibe valoraciones para reforzar la confianza de la comunidad.',
    },
    {
      icon: Shield,
      title: 'Protección y seguridad',
      description: 'Acuerdos claros y medidas de protección para ambas partes.',
    },
  ];

  const primaryCta = isAuthenticated
    ? { to: '/dashboard/owner/explorar', label: 'Explorar intercambios', icon: RefreshCw }
    : { to: '/login', label: 'Comenzar intercambio', icon: ArrowRight };

  return (
    <div className="min-h-screen bg-[#F2F3F4]">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[72vh] flex items-center justify-center overflow-hidden pt-20">
        <img
          src="/hero5.jpg"
          alt="Intercambio de propiedades vacacionales"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#064D82]/75 via-[#064D82]/55 to-[#0a1628]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_transparent_0%,_rgba(0,0,0,0.35)_100%)]" />

        <motion.div
          className="relative z-10 max-w-3xl mx-auto text-center px-5 py-16 text-white"
          initial="hidden"
          animate="show"
          variants={stagger}
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 px-4 py-1.5 mb-6"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span className="text-sm font-medium text-white/95">Intercambio entre propietarios</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight"
            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.35)' }}
          >
            Intercambia tu{' '}
            <span className="relative inline-block">
              propiedad
              <svg viewBox="0 0 200 12" className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-[160px] sm:w-[200px]" aria-hidden="true">
                <path d="M 0 6 Q 50 0, 100 6 T 200 6" fill="none" stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg sm:text-xl text-white/85 mb-8 max-w-2xl mx-auto leading-relaxed">
            Viaja por el mundo intercambiando tu casa con otros propietarios. Seguro, flexible y sin coste de alojamiento.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="rounded-full px-8 bg-white text-[#064D82] hover:bg-white/90 font-semibold shadow-lg">
              <Link to={primaryCta.to}>
                {primaryCta.label}
                {isAuthenticated ? <RefreshCw className="ml-2 w-5 h-5" /> : <ArrowRight className="ml-2 w-5 h-5" />}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-8 border-white/70 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
            >
              <a href="#pasos">
                <RefreshCw className="mr-2 w-5 h-5" />
                Cómo funciona
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-10 sm:mb-12"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-wider text-[#064D82] mb-2">
              Ventajas
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              ¿Por qué intercambiar?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-600 text-lg max-w-2xl mx-auto">
              Descubre lo que ganas al unirte al sistema de intercambio de Quincenalia
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
          >
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <motion.div key={benefit.title} variants={fadeUp}>
                  <Card className="h-full border-0 rounded-2xl shadow-sm ring-1 ring-black/5 bg-[#F7F8FA] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <CardContent className="pt-7 pb-6 px-5 text-center">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#064D82]/10 text-[#064D82] mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                        <Icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1.5">{benefit.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section id="pasos" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-wider text-[#064D82] mb-2">
              Proceso
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Cómo funciona el intercambio
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Un proceso claro en 5 pasos para intercambiar tu propiedad
            </motion.p>
          </motion.div>

          <div className="space-y-10 sm:space-y-14">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const reverse = index % 2 === 1;
              return (
                <motion.article
                  key={step.title}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.25 }}
                  variants={stagger}
                >
                  <motion.div variants={fadeUp} className="relative group">
                    <div className={`absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br ${step.accent} blur-xl opacity-70 group-hover:opacity-100 transition-opacity`} />
                    <div className="relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 aspect-[16/11]">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/hero.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur px-3 py-1.5 shadow-sm">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#064D82] text-white text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">Paso {index + 1}</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#064D82] text-white shadow-md mb-4 transition-transform duration-300 hover:scale-110 hover:-rotate-6">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">{step.title}</h3>
                    <p className="text-slate-600 leading-relaxed mb-5">{step.description}</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {step.details.map((detail) => (
                        <li
                          key={detail}
                          className="flex items-start gap-2 rounded-xl bg-white/80 ring-1 ring-black/5 px-3 py-2.5 text-sm text-slate-700"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-10 sm:mb-12"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Características del sistema
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-600 text-lg">
              Todo lo necesario para un intercambio exitoso
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            {howItWorks.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={fadeUp}>
                  <Card className="h-full border-0 rounded-2xl shadow-sm ring-1 ring-black/5 hover:shadow-lg transition-all duration-300 group">
                    <CardContent className="pt-6 pb-6 px-5">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#064D82] text-white flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-1.5">{feature.title}</h3>
                          <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 sm:py-20 px-4 overflow-hidden">
        <img src="/repdominicana.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden="true" />
        <div className="absolute inset-0 bg-[#064D82]/85" />
        <motion.div
          className="relative z-10 max-w-3xl mx-auto text-center text-white"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4">
            ¿Listo para intercambiar?
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-white/85 mb-8">
            Únete a la comunidad y empieza a intercambiar tu propiedad hoy
          </motion.p>
          <motion.div variants={fadeUp}>
            <Button asChild size="lg" className="rounded-full px-8 bg-white text-[#064D82] hover:bg-white/90 font-semibold shadow-xl">
              <Link to={primaryCta.to}>
                {isAuthenticated ? 'Explorar intercambios' : 'Registrarse gratis'}
                {isAuthenticated ? <RefreshCw className="ml-2 w-5 h-5" /> : <ArrowRight className="ml-2 w-5 h-5" />}
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default IntercambioPropiedades;
