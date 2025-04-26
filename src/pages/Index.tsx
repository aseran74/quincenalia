import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-blue-800 text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Casa Comunitaria Digital</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            La plataforma integral para la gestión de propiedades en comunidad
          </p>
          <div className="space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard/agencies">
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                    Gestionar Agencias
                  </Button>
                </Link>
                <Link to="/dashboard/agents">
                  <Button size="lg" className="bg-blue-500 hover:bg-blue-600">
                    Gestionar Agentes
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/login">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                  Iniciar Sesión
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Funcionalidades Principales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">Gestión de Propiedades</h3>
                <p className="text-center text-gray-600">
                  Administra todas tus propiedades en un solo lugar de manera eficiente.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">Citas y Visitas</h3>
                <p className="text-center text-gray-600">
                  Programa y gestiona visitas a propiedades de forma sencilla.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">Comunicación</h3>
                <p className="text-center text-gray-600">
                  Mantén contacto directo entre todos los participantes.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">Facturación</h3>
                <p className="text-center text-gray-600">
                  Genera y gestiona facturas para propietarios de manera automática.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">Incidencias</h3>
                <p className="text-center text-gray-600">
                  Reporta y sigue el estado de incidencias en las propiedades.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">Roles de Usuario</h3>
                <p className="text-center text-gray-600">
                  Diferentes niveles de acceso según el rol de cada usuario.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Role Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Para Cada Tipo de Usuario</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4 text-blue-600">👑</div>
              <h3 className="text-xl font-semibold mb-2">Administradores</h3>
              <p className="text-gray-600">
                Control total sobre propiedades, usuarios y comunicaciones.
              </p>
            </div>
            
            <Link to={isAuthenticated ? "/dashboard/agencies" : "/login"} className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4 text-blue-600">🏢</div>
              <h3 className="text-xl font-semibold mb-2">Agencias Inmobiliarias</h3>
              <p className="text-gray-600">
                Gestiona tu equipo de agentes y cartera de propiedades.
              </p>
            </Link>
            
            <Link to={isAuthenticated ? "/dashboard/agents" : "/login"} className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4 text-blue-600">👨‍💼</div>
              <h3 className="text-xl font-semibold mb-2">Agentes Inmobiliarios</h3>
              <p className="text-gray-600">
                Coordina visitas y mantén contacto con clientes interesados.
              </p>
            </Link>
            
            <div className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4 text-blue-600">🏠</div>
              <h3 className="text-xl font-semibold mb-2">Propietarios</h3>
              <p className="text-gray-600">
                Gestiona tus propiedades, facturas e incidencias fácilmente.
              </p>
            </div>
            
            <div className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4 text-blue-600">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Interesados</h3>
              <p className="text-gray-600">
                Encuentra y agenda visitas a propiedades que te interesan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-800 text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para empezar?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Únete a nuestra plataforma y mejora la gestión de tus propiedades
          </p>
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                Ir al Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                Iniciar Sesión
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="container mx-auto">
          <div className="text-center">
            <p>&copy; {new Date().getFullYear()} Casa Comunitaria Digital. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
