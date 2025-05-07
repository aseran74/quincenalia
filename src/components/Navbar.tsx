import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  // Scroll suave a un id de sección
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handler para enlaces de ancla
  const handleAnchorClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (location.pathname === '/' || location.pathname === '/home') {
      setTimeout(() => scrollToSection(id), 50);
    } else {
      navigate('/');
      setTimeout(() => scrollToSection(id), 350); // Espera a que cargue la home
    }
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
            <Link to="/propiedades" className={`px-3 py-1 rounded font-semibold transition-colors duration-200 shadow-sm ${
              isScrolled ? 'text-gray-800' : 'text-white drop-shadow-lg'
            } hover:bg-white/20 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary`} style={{textShadow: isScrolled ? '0 1px 6px rgba(255,255,255,0.2)' : '0 2px 10px rgba(0,0,0,0.5)'}}>
              Buscar Propiedades
            </Link>
            <a href="#reinventada" onClick={handleAnchorClick('reinventada')} className={`px-3 py-1 rounded font-semibold transition-colors duration-200 shadow-sm ${isScrolled ? 'text-gray-800' : 'text-white drop-shadow-lg'} hover:bg-white/20 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary`} style={{textShadow: isScrolled ? '0 1px 6px rgba(255,255,255,0.2)' : '0 2px 10px rgba(0,0,0,0.5)'}}>
              Cómo funciona
            </a>
            <a href="#faq" onClick={handleAnchorClick('faq')} className={`px-3 py-1 rounded font-semibold transition-colors duration-200 shadow-sm ${isScrolled ? 'text-gray-800' : 'text-white drop-shadow-lg'} hover:bg-white/20 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary`} style={{textShadow: isScrolled ? '0 1px 6px rgba(255,255,255,0.2)' : '0 2px 10px rgba(0,0,0,0.5)'}}>
              FAQ
            </a>
            <a href="#contacto" onClick={handleAnchorClick('contacto')} className={`px-3 py-1 rounded font-semibold transition-colors duration-200 shadow-sm ${isScrolled ? 'text-gray-800' : 'text-white drop-shadow-lg'} hover:bg-white/20 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary`} style={{textShadow: isScrolled ? '0 1px 6px rgba(255,255,255,0.2)' : '0 2px 10px rgba(0,0,0,0.5)'}}>
              Contacto
            </a>
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
            to="/propiedades" 
            className={`block py-2 text-base font-medium ${
              isScrolled ? 'text-gray-700' : 'text-white'
            } hover:text-primary transition-colors`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Buscar Propiedades
          </Link>
          <a 
            href="#reinventada" 
            className={`block py-2 text-base font-medium ${isScrolled ? 'text-gray-700' : 'text-white'} hover:text-primary transition-colors`}
            onClick={handleAnchorClick('reinventada')}
          >
            Cómo funciona
          </a>
          <a 
            href="#faq" 
            className={`block py-2 text-base font-medium ${isScrolled ? 'text-gray-700' : 'text-white'} hover:text-primary transition-colors`}
            onClick={handleAnchorClick('faq')}
          >
            FAQ
          </a>
          <a 
            href="#contacto" 
            className={`block py-2 text-base font-medium ${isScrolled ? 'text-gray-700' : 'text-white'} hover:text-primary transition-colors`}
            onClick={handleAnchorClick('contacto')}
          >
            Contacto
          </a>
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