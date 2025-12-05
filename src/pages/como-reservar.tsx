import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { 
  Calendar, Search, CreditCard, CheckCircle, 
  ArrowRight, Shield, Clock, Star, 
  MapPin, Filter, Heart, Eye, 
  FileText, MessageSquare, Phone, Mail,
  AlertCircle, HelpCircle, Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ComoReservar = () => {
  const { isAuthenticated } = useAuth();

  const steps = [
    {
      icon: Search,
      title: '1. Busca tu Propiedad Ideal',
      description: 'Utiliza nuestros filtros avanzados para encontrar la propiedad perfecta según tus necesidades.',
      details: [
        'Filtra por destino, fechas y tipo de propiedad',
        'Explora fotos de alta calidad y descripciones detalladas',
        'Consulta la disponibilidad en tiempo real',
        'Guarda tus favoritos para comparar'
      ]
    },
    {
      icon: Eye,
      title: '2. Revisa los Detalles',
      description: 'Lee toda la información sobre la propiedad, servicios incluidos y políticas de cancelación.',
      details: [
        'Características y servicios de la propiedad',
        'Ubicación y puntos de interés cercanos',
        'Políticas de cancelación y reembolso',
        'Reseñas y valoraciones de otros huéspedes'
      ]
    },
    {
      icon: Calendar,
      title: '3. Selecciona tus Fechas',
      description: 'Elige las fechas de entrada y salida. El calendario muestra la disponibilidad actualizada.',
      details: [
        'Calendario interactivo con disponibilidad',
        'Selección flexible de fechas',
        'Visualización de precios por período',
        'Confirmación instantánea de disponibilidad'
      ]
    },
    {
      icon: CreditCard,
      title: '4. Completa tu Reserva',
      description: 'Proporciona tus datos y método de pago. El proceso es seguro y rápido.',
      details: [
        'Formulario de reserva simple',
        'Múltiples métodos de pago aceptados',
        'Pago seguro con encriptación SSL',
        'Confirmación inmediata'
      ]
    },
    {
      icon: CheckCircle,
      title: '5. Confirma y Disfruta',
      description: 'Recibe la confirmación por email con todos los detalles y prepara tu viaje.',
      details: [
        'Email de confirmación con detalles',
        'Información de contacto del propietario',
        'Instrucciones de acceso a la propiedad',
        'Guía de la zona y recomendaciones'
      ]
    }
  ];

  const paymentMethods = [
    {
      icon: CreditCard,
      title: 'Tarjeta de Crédito/Débito',
      description: 'Visa, Mastercard, American Express'
    },
    {
      icon: FileText,
      title: 'Transferencia Bancaria',
      description: 'Transferencia directa a nuestra cuenta'
    },
    {
      icon: Shield,
      title: 'Pago Seguro',
      description: 'Todos los pagos están protegidos'
    }
  ];

  const cancellationPolicies = [
    {
      type: 'Flexible',
      description: 'Cancelación gratuita hasta 24 horas antes del check-in',
      icon: Heart
    },
    {
      type: 'Moderada',
      description: 'Cancelación gratuita hasta 5 días antes del check-in',
      icon: Calendar
    },
    {
      type: 'Estricta',
      description: 'Cancelación con reembolso del 50% hasta 7 días antes',
      icon: AlertCircle
    }
  ];

  const faqs = [
    {
      question: '¿Cuánto tiempo tarda en confirmarse una reserva?',
      answer: 'Las reservas se confirman de forma instantánea. Recibirás un email de confirmación inmediatamente después de completar el pago.'
    },
    {
      question: '¿Puedo modificar mi reserva después de confirmarla?',
      answer: 'Sí, puedes modificar las fechas o cancelar tu reserva según las políticas de cancelación de la propiedad. Contacta con nosotros para más información.'
    },
    {
      question: '¿Qué pasa si la propiedad no está disponible?',
      answer: 'Si por alguna razón la propiedad no está disponible, te ofreceremos alternativas similares o un reembolso completo.'
    },
    {
      question: '¿Hay algún cargo adicional?',
      answer: 'No cobramos comisiones de reserva. El precio mostrado es el precio final, sin cargos ocultos.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <Calendar className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Cómo Hacer una Reserva
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Guía paso a paso para reservar tu propiedad ideal de forma rápida y segura
          </p>
          {!isAuthenticated && (
            <Link to="/properties">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Explorar Propiedades
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Proceso de Reserva en 5 Pasos
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Desde la búsqueda hasta la confirmación, te guiamos en cada paso
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

      {/* Payment Methods Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Métodos de Pago Aceptados
            </h2>
            <p className="text-lg text-gray-600">
              Pagos seguros y flexibles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {paymentMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{method.title}</h3>
                    <p className="text-gray-600">{method.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cancellation Policies Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Políticas de Cancelación
            </h2>
            <p className="text-lg text-gray-600">
              Entendemos que los planes pueden cambiar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cancellationPolicies.map((policy, index) => {
              const Icon = policy.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{policy.type}</h3>
                        <p className="text-gray-600">{policy.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Preguntas Frecuentes
            </h2>
            <p className="text-lg text-gray-600">
              Respuestas a las dudas más comunes sobre reservas
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <HelpCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para Hacer tu Reserva?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Encuentra tu propiedad ideal y reserva en minutos
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

export default ComoReservar;

