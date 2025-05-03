import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="block w-[150px] transition-colors">
              <img 
                src={isScrolled ? "/logo.svg" : "/logo-blanco.png"} 
                alt="Lovable" 
                className="w-full h-auto" 
              />
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/#menu" className={`${
              isScrolled ? 'text-gray-700' : 'text-white'
            } hover:text-primary transition-colors`}>
              Menú
            </Link>
            <Link to="/propiedades" className={`${
              isScrolled ? 'text-gray-700' : 'text-white'
            } hover:text-primary transition-colors`}>
              Buscar Propiedades
            </Link>
            <Link to="/#como-funciona" className={`${
              isScrolled ? 'text-gray-700' : 'text-white'
            } hover:text-primary transition-colors`}>
              Cómo Funciona
            </Link>
            <Link to="/#contacto" className={`${
              isScrolled ? 'text-gray-700' : 'text-white'
            } hover:text-primary transition-colors`}>
              Contacto
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant={isScrolled ? "outline" : "secondary"} 
                     className="hidden md:inline-flex">
                Iniciar Sesión
              </Button>
            </Link>
            <Button 
              onClick={toggleMobileMenu}
              className={`md:hidden transition-transform duration-200 active:scale-90 hover:scale-110 ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`} 
              variant="ghost" 
              size="icon"
            >
              {isMobileMenuOpen ? (
                <X className="w-10 h-10" />
              ) : (
                <Menu className="w-10 h-10" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${
        isMobileMenuOpen 
          ? 'max-h-96 opacity-100 visible' 
          : 'max-h-0 opacity-0 invisible'
      }`}>
        <div className={`px-4 pt-2 pb-4 space-y-3 ${
          isScrolled ? 'bg-white/80 backdrop-blur-md' : 'bg-black/80 backdrop-blur-md'
        }`}>
          <Link 
            to="/#menu" 
            className={`block py-2 text-base font-medium ${
              isScrolled ? 'text-gray-700' : 'text-white'
            } hover:text-primary transition-colors`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Menú
          </Link>
          <Link 
            to="/propiedades" 
            className={`block py-2 text-base font-medium ${
              isScrolled ? 'text-gray-700' : 'text-white'
            } hover:text-primary transition-colors`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Buscar Propiedades
          </Link>
          <Link 
            to="/#como-funciona" 
            className={`block py-2 text-base font-medium ${
              isScrolled ? 'text-gray-700' : 'text-white'
            } hover:text-primary transition-colors`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Cómo Funciona
          </Link>
          <Link 
            to="/#contacto" 
            className={`block py-2 text-base font-medium ${
              isScrolled ? 'text-gray-700' : 'text-white'
            } hover:text-primary transition-colors`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contacto
          </Link>
          <Link 
            to="/login" 
            className="block pt-4"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Button 
              variant={isScrolled ? "outline" : "secondary"}
              className="w-full"
            >
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 