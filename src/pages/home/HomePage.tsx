import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { FeaturedProperties } from '@/components/FeaturedProperties';
import { useEffect } from 'react';
import './HomePage.css';

const HomePage = () => {
  useEffect(() => {
    // Iniciar la animación cuando el componente se monte
    const heroImage = document.querySelector('.hero-image');
    if (heroImage) {
      heroImage.classList.add('zoom-animation');
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero.jpg"
            alt="Luxury beach house"
            className="hero-image w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Tu hogar frente al mar
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Descubre propiedades exclusivas con las mejores vistas al océano
          </p>
          <Button size="lg" className="bg-primary/90 hover:bg-primary backdrop-blur-sm">
            Comenzar búsqueda
          </Button>
        </div>
      </section>

      {/* Cómo Funciona Section */}
      <section id="como-funciona" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Cómo Funciona
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Busca',
                description: 'Explora nuestra amplia selección de propiedades con filtros avanzados',
                icon: '🔍'
              },
              {
                title: 'Compara',
                description: 'Analiza diferentes opciones y encuentra la que mejor se ajuste a tus necesidades',
                icon: '📊'
              },
              {
                title: 'Contacta',
                description: 'Conecta directamente con propietarios o agentes verificados',
                icon: '📱'
              }
            ].map((step, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Propiedades Destacadas */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Propiedades Destacadas
          </h2>
          <FeaturedProperties />
        </div>
      </section>

      {/* Contacto Section */}
      <section id="contacto" className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">
            ¿Necesitas ayuda?
          </h2>
          <p className="text-xl mb-8">
            Nuestro equipo está disponible para ayudarte a encontrar tu hogar ideal
          </p>
          <Button variant="secondary" size="lg">
            Contactar ahora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Lovable</h3>
              <p className="text-gray-400">
                Tu plataforma de confianza para encontrar el hogar perfecto.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces rápidos</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Buscar propiedades</li>
                <li>Cómo funciona</li>
                <li>Contacto</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Términos y condiciones</li>
                <li>Política de privacidad</li>
                <li>Cookies</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Síguenos</h4>
              <div className="flex space-x-4">
                {/* Aquí irían los iconos de redes sociales */}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 