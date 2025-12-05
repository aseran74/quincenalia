import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { 
  RefreshCw, Home, MapPin, Calendar, Search,
  Users, Shield, CheckCircle, ArrowRight,
  Star, MessageSquare, Clock, TrendingUp,
  Heart, Globe, Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const IntercambioPropiedades = () => {
  const { isAuthenticated } = useAuth();

  const steps = [
    {
      icon: Home,
      title: '1. Registra tu Propiedad',
      description: 'Añade tu propiedad al sistema de intercambio. Proporciona información detallada, fotos y disponibilidad.',
      details: [
        'Sube fotos de alta calidad de tu propiedad',
        'Describe características y servicios incluidos',
        'Define tus períodos de disponibilidad',
        'Establece tus preferencias de intercambio'
      ]
    },
    {
      icon: Search,
      title: '2. Explora Propiedades Disponibles',
      description: 'Navega por nuestro catálogo de propiedades disponibles para intercambio. Filtra por ubicación, fechas y características.',
      details: [
        'Busca por destino y fechas deseadas',
        'Filtra por tipo de propiedad y servicios',
        'Compara diferentes opciones',
        'Guarda tus favoritas para más tarde'
      ]
    },
    {
      icon: MessageSquare,
      title: '3. Contacta con el Propietario',
      description: 'Comunícate directamente con el propietario de la propiedad que te interesa. Discute detalles y confirma disponibilidad.',
      details: [
        'Mensajería integrada en la plataforma',
        'Negocia fechas y condiciones',
        'Resuelve dudas antes de confirmar',
        'Establece una relación de confianza'
      ]
    },
    {
      icon: RefreshCw,
      title: '4. Confirma el Intercambio',
      description: 'Una vez acordados los términos, confirma el intercambio. Ambas partes recibirán confirmación y detalles del acuerdo.',
      details: [
        'Confirmación mutua del intercambio',
        'Documentación automática del acuerdo',
        'Calendario actualizado para ambas propiedades',
        'Notificaciones de confirmación'
      ]
    },
    {
      icon: CheckCircle,
      title: '5. Disfruta tu Estancia',
      description: 'Disfruta de tu nueva propiedad mientras otra familia disfruta de la tuya. Todo gestionado de forma segura y transparente.',
      details: [
        'Acceso a información completa de la propiedad',
        'Soporte durante toda la estancia',
        'Sistema de valoraciones post-estancia',
        'Posibilidad de repetir el intercambio'
      ]
    }
  ];

  const benefits = [
    {
      icon: Globe,
      title: 'Viaja sin Coste',
      description: 'Intercambia tu propiedad y viaja sin pagar alojamiento'
    },
    {
      icon: Home,
      title: 'Experiencia Auténtica',
      description: 'Vive como un local en propiedades reales y acogedoras'
    },
    {
      icon: Shield,
      title: 'Intercambio Seguro',
      description: 'Sistema verificado y protegido para tu tranquilidad'
    },
    {
      icon: Heart,
      title: 'Comunidad de Confianza',
      description: 'Únete a una comunidad de propietarios responsables'
    },
    {
      icon: TrendingUp,
      title: 'Rentabiliza tu Propiedad',
      description: 'Aprovecha tu propiedad cuando no la uses'
    },
    {
      icon: Users,
      title: 'Conoce Nuevas Personas',
      description: 'Establece conexiones con propietarios de todo el mundo'
    }
  ];

  const howItWorks = [
    {
      icon: Lock,
      title: 'Sistema de Verificación',
      description: 'Todas las propiedades pasan por un proceso de verificación para garantizar la calidad y autenticidad.'
    },
    {
      icon: Calendar,
      title: 'Calendario Sincronizado',
      description: 'Gestiona la disponibilidad de tu propiedad y encuentra fechas compatibles fácilmente.'
    },
    {
      icon: Star,
      title: 'Sistema de Valoraciones',
      description: 'Valora y recibe valoraciones de otros usuarios para construir confianza en la comunidad.'
    },
    {
      icon: Shield,
      title: 'Protección y Seguridad',
      description: 'Contratos automáticos y sistema de seguro para proteger tanto a propietarios como a huéspedes.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <RefreshCw className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Intercambia tu Propiedad
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Viaja por el mundo intercambiando tu propiedad con otros usuarios
          </p>
          {!isAuthenticated && (
            <Link to="/login">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Comenzar Intercambio
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué Intercambiar?
            </h2>
            <p className="text-lg text-gray-600">
              Descubre las ventajas de nuestro sistema de intercambio de propiedades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Steps Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cómo Funciona el Intercambio
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Un proceso simple en 5 pasos para intercambiar tu propiedad
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="overflow-hidden border-2 hover:border-blue-500 transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{step.title}</CardTitle>
                        <p className="text-gray-700">{step.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {step.details.map((detail, idx) => (
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

      {/* How It Works Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Características del Sistema
            </h2>
            <p className="text-lg text-gray-600">
              Todo lo que necesitas para un intercambio exitoso
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {howItWorks.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
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
            ¿Listo para Intercambiar?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a nuestra comunidad y comienza a intercambiar tu propiedad hoy mismo
          </p>
          {isAuthenticated ? (
            <Link to="/dashboard/owner/explorar">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Explorar Intercambios
                <RefreshCw className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Registrarse Gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default IntercambioPropiedades;

