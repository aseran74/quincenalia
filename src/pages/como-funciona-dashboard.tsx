import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { 
  LayoutDashboard, Calendar, AlertTriangle, 
  MessageSquare, FileText, Settings, 
  ArrowRight, Shield, Users, BarChart3,
  CheckCircle, Clock, Bell, CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ComoFuncionaDashboard = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: LayoutDashboard,
      title: 'Panel de Control',
      description: 'Accede a un dashboard intuitivo donde puedes gestionar todas tus propiedades, reservas y actividades en un solo lugar.',
      details: [
        'Vista general de todas tus propiedades',
        'Resumen de reservas activas y próximas',
        'Estadísticas de ocupación y ingresos',
        'Acceso rápido a funciones principales'
      ]
    },
    {
      icon: Calendar,
      title: 'Gestión de Reservas',
      description: 'Crea, modifica y gestiona todas tus reservas de forma sencilla. Visualiza tu calendario completo y controla la disponibilidad.',
      details: [
        'Crear nuevas reservas en segundos',
        'Calendario interactivo con todas las fechas',
        'Gestionar disponibilidad de propiedades',
        'Confirmaciones automáticas por email'
      ]
    },
    {
      icon: AlertTriangle,
      title: 'Sistema de Incidencias',
      description: 'Reporta y gestiona incidencias de tus propiedades de manera eficiente. Mantén un registro completo de mantenimientos y reparaciones.',
      details: [
        'Crear y reportar incidencias fácilmente',
        'Seguimiento del estado de cada incidencia',
        'Comunicación directa con el equipo técnico',
        'Historial completo de mantenimientos'
      ]
    },
    {
      icon: MessageSquare,
      title: 'Mensajería',
      description: 'Comunícate directamente con huéspedes, propietarios y el equipo de soporte a través de nuestro sistema de mensajería integrado.',
      details: [
        'Chat en tiempo real con todos los usuarios',
        'Notificaciones de nuevos mensajes',
        'Historial de conversaciones',
        'Soporte técnico integrado'
      ]
    },
    {
      icon: FileText,
      title: 'Documentación y Facturas',
      description: 'Gestiona todos tus documentos, facturas y contratos desde un solo lugar. Todo organizado y accesible cuando lo necesites.',
      details: [
        'Acceso a todas tus facturas',
        'Descarga de documentos y contratos',
        'Registro de pagos y comisiones',
        'Exportación de informes'
      ]
    },
    {
      icon: BarChart3,
      title: 'Estadísticas y Reportes',
      description: 'Analiza el rendimiento de tus propiedades con reportes detallados y estadísticas en tiempo real.',
      details: [
        'Gráficos de ocupación y rentabilidad',
        'Análisis de tendencias',
        'Reportes personalizables',
        'Exportación de datos'
      ]
    }
  ];

  const accessSteps = [
    {
      step: '1',
      title: 'Regístrate o Inicia Sesión',
      description: 'Crea tu cuenta de forma gratuita o inicia sesión si ya tienes una cuenta.'
    },
    {
      step: '2',
      title: 'Verifica tu Cuenta',
      description: 'Confirma tu email para activar tu cuenta y acceder a todas las funcionalidades.'
    },
    {
      step: '3',
      title: 'Accede al Dashboard',
      description: 'Una vez verificado, podrás acceder a tu panel personalizado según tu rol (propietario, admin, agente).'
    },
    {
      step: '4',
      title: 'Comienza a Gestionar',
      description: 'Explora todas las herramientas disponibles y comienza a gestionar tus propiedades y reservas.'
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Seguro y Confiable',
      description: 'Tus datos están protegidos con encriptación de nivel empresarial'
    },
    {
      icon: Clock,
      title: 'Acceso 24/7',
      description: 'Gestiona todo desde cualquier lugar y en cualquier momento'
    },
    {
      icon: Users,
      title: 'Soporte Dedicado',
      description: 'Equipo de soporte disponible para ayudarte cuando lo necesites'
    },
    {
      icon: CheckCircle,
      title: 'Fácil de Usar',
      description: 'Interfaz intuitiva diseñada para que cualquier persona pueda usarla'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <LayoutDashboard className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Cómo Funciona el Dashboard
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Gestiona tus propiedades, reservas e incidencias desde un panel centralizado
          </p>
          {!isAuthenticated && (
            <Link to="/login">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Acceder al Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Access Steps */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cómo Acceder al Dashboard
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              El proceso es simple y rápido. En pocos minutos estarás gestionando tus propiedades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {accessSteps.map((item, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades del Dashboard
            </h2>
            <p className="text-lg text-gray-600">
              Todo lo que necesitas para gestionar tus propiedades en un solo lugar
            </p>
          </div>

          <div className="space-y-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="overflow-hidden border-2 hover:border-blue-500 transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{feature.title}</CardTitle>
                        <p className="text-gray-700">{feature.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ventajas del Dashboard
            </h2>
            <p className="text-lg text-gray-600">
              Por qué elegir nuestro sistema de gestión
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Accede a tu dashboard y comienza a gestionar tus propiedades hoy mismo
          </p>
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Ir al Dashboard
                <LayoutDashboard className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Iniciar Sesión
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default ComoFuncionaDashboard;

