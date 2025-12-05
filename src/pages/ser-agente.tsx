import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/Navbar';
import { 
  UserPlus, Briefcase, TrendingUp, DollarSign,
  Shield, Users, Clock, CheckCircle, ArrowRight,
  Star, Award, MessageSquare, BarChart3,
  Heart, Globe, Target, Zap,
  ChevronRight, Sparkles, Building2, Users2,
  Calendar, FileText, Smartphone, Headphones
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const SerAgente = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('steps');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const steps = [
    {
      icon: UserPlus,
      title: '1. Regístrate como Agente',
      description: 'Completa el formulario de registro con tu información profesional.',
      time: '5 minutos',
      details: [
        'Formulario de registro online',
        'Información profesional y de contacto',
        'Documentación requerida',
        'Verificación de identidad'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Briefcase,
      title: '2. Completa tu Perfil',
      description: 'Crea un perfil profesional atractivo que muestre tu experiencia.',
      time: '10 minutos',
      details: [
        'Foto profesional y biografía',
        'Especialidades y áreas de conocimiento',
        'Experiencia y certificaciones',
        'Portfolio de propiedades'
      ],
      color: 'from-cyan-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: '3. Verificación y Aprobación',
      description: 'Nuestro equipo revisa tu solicitud y verifica tus credenciales.',
      time: '24-48 horas',
      details: [
        'Revisión de documentación',
        'Verificación de licencias',
        'Validación de experiencia',
        'Aprobación final del equipo'
      ],
      color: 'from-emerald-500 to-green-500'
    },
    {
      icon: Target,
      title: '4. Accede a tu Panel',
      description: 'Recibirás acceso a tu panel de agente con todas las herramientas.',
      time: 'Inmediato',
      details: [
        'Dashboard personalizado',
        'Gestión de clientes y propiedades',
        'Sistema de comisiones',
        'Herramientas de marketing'
      ],
      color: 'from-green-500 to-lime-500'
    },
    {
      icon: TrendingUp,
      title: '5. Comienza a Trabajar',
      description: 'Empieza a gestionar propiedades y generar ingresos.',
      time: 'Desde el primer día',
      details: [
        'Base de datos de propiedades',
        'Solicitudes de contacto',
        'Seguimiento de leads',
        'Soporte continuo'
      ],
      color: 'from-lime-500 to-yellow-500'
    }
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: 'Comisiones Competitivas',
      description: 'Hasta 80% de comisión por reserva. Sin límites de ingresos.',
      highlight: 'Hasta 80%'
    },
    {
      icon: Users2,
      title: 'Base de Clientes',
      description: 'Acceso a +10,000 clientes activos mensuales.',
      highlight: '+10,000 clientes'
    },
    {
      icon: BarChart3,
      title: 'Herramientas Premium',
      description: 'CRM avanzado, analytics en tiempo real y automatizaciones.',
      highlight: 'CRM Avanzado'
    },
    {
      icon: Headphones,
      title: 'Soporte 24/7',
      description: 'Soporte dedicado por chat, teléfono y email.',
      highlight: '24/7'
    },
    {
      icon: Zap,
      title: 'Flexibilidad Total',
      description: 'Trabaja desde cualquier lugar, establece tu propio horario.',
      highlight: '100% Remoto'
    },
    {
      icon: Award,
      title: 'Programa de Incentivos',
      description: 'Bonos por desempeño y reconocimiento mensual.',
      highlight: 'Bonos Extras'
    }
  ];

  const requirements = [
    {
      icon: Briefcase,
      title: 'Experiencia en Inmobiliaria',
      description: 'Mínimo 2 años en sector inmobiliario o turístico',
      essential: true
    },
    {
      icon: Award,
      title: 'Licencias Válidas',
      description: 'Licencias profesionales según normativa regional',
      essential: true
    },
    {
      icon: Users,
      title: 'Comunicación Efectiva',
      description: 'Excelentes habilidades interpersonales y de ventas',
      essential: false
    },
    {
      icon: Target,
      title: 'Orientación a Resultados',
      description: 'Mentalidad proactiva y capacidad de autogestión',
      essential: false
    }
  ];

  const features = [
    {
      icon: MessageSquare,
      title: 'Sistema de Contactos',
      description: 'CRM integrado con seguimiento automático',
      comingSoon: false
    },
    {
      icon: BarChart3,
      title: 'Analytics Avanzado',
      description: 'Reportes detallados y métricas en tiempo real',
      comingSoon: false
    },
    {
      icon: Star,
      title: 'Sistema de Reputación',
      description: 'Valoraciones que aumentan tu visibilidad',
      comingSoon: false
    },
    {
      icon: Smartphone,
      title: 'App Móvil',
      description: 'Gestiona todo desde tu dispositivo móvil',
      comingSoon: true
    }
  ];

  const stats = [
    { value: '500+', label: 'Agentes Activos', icon: Users },
    { value: '95%', label: 'Satisfacción', icon: Star },
    { value: '24h', label: 'Tiempo Prom. Aprobación', icon: Clock },
    { value: '$5K+', label: 'Ingreso Prom. Mensual', icon: DollarSign }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50/50">
      <Navbar />
      
      {/* Hero Section Mejorada */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-cyan-500/5" />
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 text-sm font-semibold">
              <Sparkles className="w-4 h-4 mr-2" />
              Oportunidad Única
            </Badge>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Convierte tu{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                pasión
              </span>{' '}
              <br />
              en tu{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                profesión
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto"
            >
              Únete a nuestra red de agentes inmobiliarios y transforma la manera en que conectas personas con sus propiedades ideales
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button size="lg" className="text-lg px-8 py-6 h-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto">
                      Comenzar Ahora
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/demo" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto border-2 w-full sm:w-auto">
                      <Play className="w-5 h-5 mr-2" />
                      Ver Demo
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to="/dashboard/agents">
                  <Button size="lg" className="text-lg px-8 py-6 h-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    Ir al Panel de Agente
                    <Briefcase className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="flex items-center justify-center text-gray-600">
                    <Icon className="w-4 h-4 mr-2" />
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Navegación por Tabs */}
      <section className="sticky top-20 z-10 bg-white/80 backdrop-blur-sm border-b py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 lg:w-auto mx-auto">
              <TabsTrigger value="steps" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500">
                Proceso
              </TabsTrigger>
              <TabsTrigger value="benefits" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500">
                Beneficios
              </TabsTrigger>
              <TabsTrigger value="requirements" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500">
                Requisitos
              </TabsTrigger>
              <TabsTrigger value="tools" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500">
                Herramientas
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Steps Section */}
      <TabsContent value="steps" className="m-0">
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Tu camino hacia el éxito en{' '}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  5 pasos
                </span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Sigue nuestro proceso estructurado para comenzar tu carrera como agente profesional
              </p>
            </div>

            <div className="relative">
              {/* Línea de progreso */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-cyan-500 hidden md:block" />
              
              <div className="space-y-8 md:space-y-12">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isVisible ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="relative"
                    >
                      <Card className="overflow-hidden border-2 border-transparent hover:border-blue-200 transition-all duration-300 shadow-lg hover:shadow-xl group ml-0 md:ml-16">
                        <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <CardHeader className="bg-gradient-to-r from-white to-gray-50 p-8">
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            {/* Número del paso */}
                            <div className="relative">
                              <div className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl bg-gradient-to-r",
                                step.color
                              )}>
                                {index + 1}
                              </div>
                              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white border-4 border-gray-50 flex items-center justify-center">
                                <Icon className="w-4 h-4 text-blue-600" />
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                                <CardTitle className="text-2xl md:text-3xl">{step.title}</CardTitle>
                                <Badge variant="outline" className="w-fit">
                                  <Clock className="w-3 h-3 mr-2" />
                                  {step.time}
                                </Badge>
                              </div>
                              <p className="text-lg text-gray-700 mb-6">{step.description}</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {step.details.map((detail, idx) => (
                                  <div key={idx} className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg group/item hover:bg-blue-50 transition-colors">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                      <CheckCircle className="w-4 h-4" />
                                    </div>
                                    <span className="text-gray-700">{detail}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </TabsContent>

      {/* Benefits Section */}
      <TabsContent value="benefits" className="m-0">
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Beneficios que marcan la{' '}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  diferencia
                </span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Descubre todo lo que obtienes al unirte a nuestra red de agentes profesionales
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full border-2 border-transparent hover:border-blue-200 transition-all duration-300 shadow-lg hover:shadow-xl group overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <CardContent className="relative p-8">
                        <div className="flex flex-col items-center text-center mb-6">
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Icon className="w-10 h-10" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                          <p className="text-gray-600 mb-4">{benefit.description}</p>
                          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                            {benefit.highlight}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </TabsContent>

      {/* Requirements Section */}
      <TabsContent value="requirements" className="m-0">
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                ¿Tienes lo que se necesita?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Estos son los requisitos para unirte a nuestro equipo de élite
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {requirements.map((req, index) => {
                const Icon = req.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="border-2 hover:border-blue-200 transition-all duration-300 shadow-lg hover:shadow-xl">
                      <CardContent className="p-8">
                        <div className="flex items-start gap-6">
                          <div className={cn(
                            "flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center",
                            req.essential 
                              ? "bg-gradient-to-br from-red-500 to-pink-500" 
                              : "bg-gradient-to-br from-blue-500 to-cyan-500"
                          )}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-2xl font-bold text-gray-900">{req.title}</h3>
                              {req.essential && (
                                <Badge variant="destructive" className="animate-pulse">
                                  Esencial
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 text-lg">{req.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-16 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 text-center"
            >
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  ¿No cumples con todos los requisitos?
                </h3>
                <p className="text-gray-600 mb-6">
                  Aún puedes aplicar. Consideramos candidatos excepcionales con gran potencial de aprendizaje.
                </p>
                <Link to="/contact">
                  <Button variant="outline" size="lg">
                    Contactar para Evaluación
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </TabsContent>

      {/* Tools Section */}
      <TabsContent value="tools" className="m-0">
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Tu caja de herramientas{' '}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  completa
                </span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Todo lo que necesitas para destacar como agente profesional
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="border-2 hover:border-blue-200 transition-all duration-300 shadow-lg hover:shadow-xl">
                      <CardContent className="p-8">
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex items-start gap-6">
                            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center">
                              <Icon className="w-7 h-7" />
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                                {feature.comingSoon && (
                                  <Badge variant="secondary" className="animate-pulse">
                                    Próximamente
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-600">{feature.description}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </TabsContent>

      {/* CTA Final */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500" />
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent" />
        
        <div className="relative max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge className="mb-6 px-4 py-2 bg-white/20 backdrop-blur-sm text-white border-0">
              <Sparkles className="w-4 h-4 mr-2" />
              Oferta Limitada
            </Badge>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Tu futuro como agente comienza{' '}
              <span className="text-yellow-300">hoy</span>
            </h2>
            
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Únete a más de 500 agentes que ya están transformando su carrera y generando ingresos extraordinarios
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isAuthenticated ? (
                <Link to="/dashboard/agents">
                  <Button size="lg" className="text-lg px-8 py-6 h-auto bg-white text-blue-600 hover:bg-gray-100 shadow-2xl">
                    Ir al Panel de Agente
                    <Briefcase className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button size="lg" className="text-lg px-8 py-6 h-auto bg-white text-blue-600 hover:bg-gray-100 shadow-2xl">
                      Comenzar Ahora Gratis
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/pricing">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto bg-transparent text-white border-white hover:bg-white/10">
                      Ver Planes
                    </Button>
                  </Link>
                </>
              )}
            </div>
            
            <p className="text-blue-200 mt-8 text-sm">
              Primer mes sin comisiones • Sin costo de inscripción • Soporte 24/7
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Componente Play para el botón de demo
const Play = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

export default SerAgente;