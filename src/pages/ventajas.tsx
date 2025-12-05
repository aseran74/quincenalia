import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { 
  TrendingUp, Shield, Users, DollarSign,
  Clock, Globe, Award, CheckCircle, ArrowRight,
  Star, Zap, Heart, BarChart3,
  Target, Lock, MessageSquare, Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Ventajas = () => {
  const { isAuthenticated } = useAuth();

  const mainBenefits = [
    {
      icon: DollarSign,
      title: 'Mayor Rentabilidad',
      description: 'Maximiza los ingresos de tus propiedades con nuestro sistema de gestión optimizado y tarifas competitivas.',
      details: [
        'Gestión profesional de reservas',
        'Optimización de precios dinámicos',
        'Reducción de períodos vacíos',
        'Aumento del 30% en ingresos promedio'
      ]
    },
    {
      icon: Shield,
      title: 'Seguridad y Protección',
      description: 'Tus propiedades están protegidas con seguros completos y sistemas de verificación de huéspedes.',
      details: [
        'Seguro de daños incluido',
        'Verificación de identidad de huéspedes',
        'Contratos legales automáticos',
        'Soporte 24/7 durante estancias'
      ]
    },
    {
      icon: Users,
      title: 'Base de Clientes Amplia',
      description: 'Accede a miles de usuarios activos buscando propiedades en diferentes destinos y épocas del año.',
      details: [
        'Más de 10,000 usuarios registrados',
        'Búsquedas activas diarias',
        'Clientes verificados y confiables',
        'Alcance global de mercado'
      ]
    },
    {
      icon: BarChart3,
      title: 'Herramientas Avanzadas',
      description: 'Utiliza nuestro dashboard completo con analytics, gestión de calendarios y reportes detallados.',
      details: [
        'Dashboard intuitivo y completo',
        'Analytics en tiempo real',
        'Gestión de calendarios integrada',
        'Reportes personalizables'
      ]
    }
  ];

  const additionalBenefits = [
    {
      icon: Clock,
      title: 'Ahorro de Tiempo',
      description: 'Deja que nosotros gestionemos las reservas, pagos y comunicación mientras tú te enfocas en lo importante.'
    },
    {
      icon: Globe,
      title: 'Alcance Global',
      description: 'Llega a clientes de todo el mundo sin necesidad de marketing adicional.'
    },
    {
      icon: Award,
      title: 'Reconocimiento',
      description: 'Sistema de valoraciones que construye tu reputación y atrae más reservas.'
    },
    {
      icon: Zap,
      title: 'Automatización',
      description: 'Procesos automatizados que reducen trabajo manual y errores.'
    },
    {
      icon: Heart,
      title: 'Soporte Dedicado',
      description: 'Equipo de soporte disponible para ayudarte en cualquier momento.'
    },
    {
      icon: Target,
      title: 'Orientación a Resultados',
      description: 'Enfoque en maximizar tus ingresos y satisfacción de huéspedes.'
    },
    {
      icon: Lock,
      title: 'Pagos Seguros',
      description: 'Sistema de pagos seguro y transparente con transferencias automáticas.'
    },
    {
      icon: MessageSquare,
      title: 'Comunicación Integrada',
      description: 'Mensajería integrada para comunicarte fácilmente con huéspedes.'
    }
  ];

  const statistics = [
    {
      number: '30%',
      label: 'Aumento promedio de ingresos',
      icon: TrendingUp
    },
    {
      number: '95%',
      label: 'Tasa de satisfacción',
      icon: Star
    },
    {
      number: '24/7',
      label: 'Soporte disponible',
      icon: Clock
    },
    {
      number: '10K+',
      label: 'Usuarios activos',
      icon: Users
    }
  ];

  const comparison = [
    {
      feature: 'Gestión de Reservas',
      traditional: 'Manual y tiempo consumido',
      quincenalia: 'Automatizada y eficiente'
    },
    {
      feature: 'Marketing',
      traditional: 'Costos altos de publicidad',
      quincenalia: 'Incluido en la plataforma'
    },
    {
      feature: 'Pagos',
      traditional: 'Procesos lentos y manuales',
      quincenalia: 'Automáticos y seguros'
    },
    {
      feature: 'Soporte',
      traditional: 'Limitado o inexistente',
      quincenalia: '24/7 disponible'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <TrendingUp className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Ventajas de Trabajar con Nosotros
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Descubre por qué somos la mejor opción para gestionar tus propiedades
          </p>
          {!isAuthenticated && (
            <Link to="/login">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Comenzar Ahora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statistics.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center border-2 hover:border-blue-500 transition-all">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                    <p className="text-gray-600">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Principales Ventajas
            </h2>
            <p className="text-lg text-gray-600">
              Beneficios que marcan la diferencia
            </p>
          </div>

          <div className="space-y-8">
            {mainBenefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="overflow-hidden border-2 hover:border-blue-500 transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{benefit.title}</CardTitle>
                        <p className="text-gray-700">{benefit.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {benefit.details.map((detail, idx) => (
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

      {/* Additional Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Más Beneficios
            </h2>
            <p className="text-lg text-gray-600">
              Todas las ventajas que obtienes al trabajar con nosotros
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalBenefits.map((benefit, index) => {
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

      {/* Comparison Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nosotros vs. Gestión Tradicional
            </h2>
            <p className="text-lg text-gray-600">
              Compara y descubre la diferencia
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">Característica</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-500">Gestión Tradicional</th>
                      <th className="text-center py-4 px-4 font-semibold text-blue-600">Quincenalia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium">{item.feature}</td>
                        <td className="py-4 px-4 text-center text-gray-500">{item.traditional}</td>
                        <td className="py-4 px-4 text-center text-blue-600 font-semibold">
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            {item.quincenalia}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para Experimentar las Ventajas?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a nuestra plataforma y comienza a maximizar el potencial de tus propiedades
          </p>
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Ir al Dashboard
                <Building2 className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Comenzar Ahora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Ventajas;

