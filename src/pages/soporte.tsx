import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { 
  MessageSquare, Phone, Mail, Clock,
  HelpCircle, CheckCircle, ArrowRight,
  Headphones, FileText, Video, ChatBubble,
  AlertCircle, Info, Shield, Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Soporte = () => {
  const { isAuthenticated } = useAuth();

  const supportChannels = [
    {
      icon: MessageSquare,
      title: 'Chat en Vivo',
      description: 'Habla con nuestro equipo en tiempo real',
      availability: 'Disponible 24/7',
      responseTime: 'Respuesta inmediata',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Phone,
      title: 'Llamada Telefónica',
      description: 'Llámanos para asistencia personalizada',
      availability: 'Lun-Vie: 9:00 - 20:00',
      responseTime: 'Atención inmediata',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Mail,
      title: 'Email',
      description: 'Escríbenos y te responderemos pronto',
      availability: 'Disponible 24/7',
      responseTime: 'Respuesta en 24 horas',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Video,
      title: 'Videollamada',
      description: 'Sesión personalizada con nuestro equipo',
      availability: 'Con cita previa',
      responseTime: 'Agenda tu sesión',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const helpCategories = [
    {
      icon: HelpCircle,
      title: 'Preguntas Frecuentes',
      description: 'Encuentra respuestas rápidas a las preguntas más comunes',
      link: '/faq',
      count: '50+ preguntas'
    },
    {
      icon: FileText,
      title: 'Guías y Tutoriales',
      description: 'Aprende a usar todas las funcionalidades de la plataforma',
      link: '/guias',
      count: '20+ guías'
    },
    {
      icon: AlertCircle,
      title: 'Reportar un Problema',
      description: 'Notifica cualquier incidencia o problema técnico',
      link: '/reportar',
      count: 'Soporte técnico'
    },
    {
      icon: Info,
      title: 'Centro de Ayuda',
      description: 'Accede a toda nuestra documentación y recursos',
      link: '/ayuda',
      count: 'Recursos completos'
    }
  ];

  const commonIssues = [
    {
      category: 'Reservas',
      issues: [
        'No puedo completar mi reserva',
        'Cómo modificar o cancelar una reserva',
        'Problemas con el pago',
        'No recibo la confirmación'
      ]
    },
    {
      category: 'Cuenta',
      issues: [
        'Olvidé mi contraseña',
        'Cómo actualizar mi perfil',
        'Problemas al iniciar sesión',
        'Verificar mi cuenta'
      ]
    },
    {
      category: 'Propiedades',
      issues: [
        'Cómo publicar una propiedad',
        'Editar información de mi propiedad',
        'Gestionar disponibilidad',
        'Subir fotos'
      ]
    },
    {
      category: 'Pagos',
      issues: [
        'Métodos de pago aceptados',
        'Problemas con el reembolso',
        'Consultar facturas',
        'Historial de pagos'
      ]
    }
  ];

  const supportFeatures = [
    {
      icon: Clock,
      title: 'Respuesta Rápida',
      description: 'Nuestro equipo responde en menos de 24 horas'
    },
    {
      icon: Shield,
      title: 'Soporte Seguro',
      description: 'Tus datos están protegidos en todo momento'
    },
    {
      icon: Users,
      title: 'Equipo Experto',
      description: 'Profesionales capacitados para ayudarte'
    },
    {
      icon: CheckCircle,
      title: 'Solución Garantizada',
      description: 'Nos aseguramos de resolver tu problema'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <Headphones className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Centro de Soporte
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Estamos aquí para ayudarte. Encuentra respuestas o contacta con nuestro equipo
          </p>
        </div>
      </section>

      {/* Support Channels Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Canales de Contacto
            </h2>
            <p className="text-lg text-gray-600">
              Elige la forma más conveniente para contactarnos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportChannels.map((channel, index) => {
              const Icon = channel.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-500">
                  <CardContent className="pt-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${channel.color} text-white mb-4`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{channel.title}</h3>
                    <p className="text-gray-600 mb-4">{channel.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{channel.availability}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <CheckCircle className="w-4 h-4" />
                        <span>{channel.responseTime}</span>
                      </div>
                    </div>
                    <Button className="mt-4 w-full" variant="outline">
                      Contactar
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Help Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Recursos de Ayuda
            </h2>
            <p className="text-lg text-gray-600">
              Encuentra la información que necesitas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                    <p className="text-gray-600 mb-3">{category.description}</p>
                    <div className="text-sm text-blue-600 font-medium">{category.count}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Common Issues Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Problemas Comunes
            </h2>
            <p className="text-lg text-gray-600">
              Soluciones rápidas a los problemas más frecuentes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {commonIssues.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {category.issues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <HelpCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 hover:text-blue-600 cursor-pointer">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Support Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por qué Elegir Nuestro Soporte
            </h2>
            <p className="text-lg text-gray-600">
              Comprometidos con tu satisfacción
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿No Encontraste lo que Buscabas?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Nuestro equipo está listo para ayudarte personalmente
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              <MessageSquare className="mr-2 w-5 h-5" />
              Iniciar Chat
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-white border-white hover:bg-white/10">
              <Phone className="mr-2 w-5 h-5" />
              Llamar Ahora
            </Button>
          </div>
          <p className="text-blue-200 mt-6 text-sm">
            Disponible 24/7 • Respuesta garantizada en menos de 24 horas
          </p>
        </div>
      </section>
    </div>
  );
};

export default Soporte;

