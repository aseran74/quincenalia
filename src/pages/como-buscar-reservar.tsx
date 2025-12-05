import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { 
  Search, Calendar, CreditCard, CheckCircle, 
  ArrowRight, Shield, Clock, Star, 
  MapPin, Filter, Heart, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ComoBuscarReservar = () => {
  const steps = [
    {
      icon: Search,
      title: '1. Busca tu propiedad ideal',
      description: 'Utiliza nuestros filtros avanzados para encontrar la propiedad perfecta según tus necesidades: ubicación, fechas, tipo de alojamiento y presupuesto.',
      details: [
        'Filtra por destino, fechas disponibles y tipo de propiedad',
        'Explora fotos de alta calidad y descripciones detalladas',
        'Consulta la disponibilidad en tiempo real',
        'Guarda tus favoritos para comparar opciones'
      ]
    },
    {
      icon: Eye,
      title: '2. Explora y compara',
      description: 'Revisa todas las características, servicios incluidos, ubicación y opiniones de otros usuarios antes de decidir.',
      details: [
        'Visualiza la propiedad en 360° con nuestras galerías',
        'Lee reseñas y valoraciones de otros huéspedes',
        'Consulta el mapa y puntos de interés cercanos',
        'Compara precios y servicios incluidos'
      ]
    },
    {
      icon: Calendar,
      title: '3. Selecciona tus fechas',
      description: 'Elige las fechas de tu estancia. Nuestro calendario te muestra la disponibilidad en tiempo real y te permite seleccionar el período exacto que necesitas.',
      details: [
        'Calendario interactivo con disponibilidad actualizada',
        'Selección flexible de fechas de entrada y salida',
        'Visualización de precios por período',
        'Confirmación instantánea de disponibilidad'
      ]
    },
    {
      icon: CreditCard,
      title: '4. Reserva sin coste alguno',
      description: 'Realiza tu reserva completamente gratis. No cobramos comisiones de reserva, ni cargos ocultos. El proceso es 100% transparente y sin sorpresas.',
      details: [
        'Sin comisiones de reserva',
        'Sin cargos ocultos ni gastos adicionales',
        'Proceso de pago seguro y transparente',
        'Confirmación inmediata por email'
      ]
    },
    {
      icon: CheckCircle,
      title: '5. Confirma y disfruta',
      description: 'Recibe la confirmación de tu reserva y toda la información necesaria para tu estancia. ¡Solo queda disfrutar de tu experiencia!',
      details: [
        'Confirmación instantánea por email',
        'Acceso a información completa de la propiedad',
        'Datos de contacto del propietario',
        'Guía de la zona y recomendaciones locales'
      ]
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Reserva segura',
      description: 'Todas las reservas están protegidas y verificadas'
    },
    {
      icon: Clock,
      title: 'Confirmación inmediata',
      description: 'Recibe la confirmación al instante, sin esperas'
    },
    {
      icon: Star,
      title: 'Propiedades verificadas',
      description: 'Todas las propiedades pasan por un proceso de verificación'
    },
    {
      icon: Heart,
      title: 'Sin compromiso',
      description: 'Puedes cancelar según nuestras políticas flexibles'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <Search className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Cómo Buscar y Reservar
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Encuentra tu propiedad ideal y reserva <strong className="text-white">sin coste alguno</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/properties">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Explorar Propiedades
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Proceso Simple en 5 Pasos
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Desde la búsqueda hasta la confirmación, todo el proceso es rápido, fácil y completamente gratuito
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

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ventajas de Reservar con Nosotros
            </h2>
            <p className="text-lg text-gray-600">
              Tu tranquilidad es nuestra prioridad
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
            ¿Listo para encontrar tu propiedad ideal?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Comienza tu búsqueda ahora, es completamente gratis
          </p>
          <Link to="/properties">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Buscar Propiedades
              <Search className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ComoBuscarReservar;

