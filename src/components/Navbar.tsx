import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils'; // Asumo que usas ShadCN y tienes esta utilidad para classnames
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// --- Constantes ---
const SCROLL_THRESHOLD = 20;
const LOGO_DEFAULT = "/logo-blanco.png";
const LOGO_SCROLLED = "/logo.svg";
const NAV_TRANSITION_DURATION = "duration-300";
const SMOOTH_SCROLL_DELAY_SAME_PAGE = 50;
const SMOOTH_SCROLL_DELAY_DIFFERENT_PAGE = 350;

const NAV_ITEMS = [
  { label: 'Buscar Propiedades', to: '/propiedades' },
  { label: 'Cómo funciona', href: '#reinventada', sectionId: 'reinventada' },
  { label: 'FAQ', href: '#faq', sectionId: 'faq' },
  { label: 'Contacto', href: '#contacto', sectionId: 'contacto' },
];

// --- Componente de Navegación Individual (para DRY) ---
// Este componente encapsula la lógica de estilo repetitiva para los enlaces.
interface NavLinkItemProps {
  to?: string;
  href?: string;
  sectionId?: string;
  onClick: (event: React.MouseEvent, sectionId?: string) => void;
  isScrolled: boolean;
  isMobile?: boolean;
  children: React.ReactNode;
  className?: string;
}

const NavLinkItem: React.FC<NavLinkItemProps> = ({
  to,
  href,
  sectionId,
  onClick,
  isScrolled,
  isMobile = false,
  children,
  className,
}) => {
  const baseDesktopClasses = "px-3 py-1 rounded font-semibold transition-colors duration-200 shadow-sm hover:bg-white/20 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";
  const scrolledDesktopClasses = "text-gray-800";
  const notScrolledDesktopClasses = "text-white drop-shadow-lg";

  const baseMobileClasses = "block py-2 text-base font-medium hover:text-primary transition-colors";
  const scrolledMobileClasses = "text-gray-700";
  const notScrolledMobileClasses = "text-white";

  const linkClasses = cn(
    isMobile ? baseMobileClasses : baseDesktopClasses,
    isScrolled 
      ? (isMobile ? scrolledMobileClasses : scrolledDesktopClasses)
      : (isMobile ? notScrolledMobileClasses : notScrolledDesktopClasses),
    className
  );

  const textShadowStyle = !isMobile ? {
    textShadow: isScrolled ? '0 1px 6px rgba(255,255,255,0.2)' : '0 2px 10px rgba(0,0,0,0.5)'
  } : {};

  const handleClick = (e: React.MouseEvent) => {
    onClick(e, sectionId);
  };

  if (to) {
    return (
      <Link to={to} className={linkClasses} onClick={handleClick} style={textShadowStyle}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={linkClasses} onClick={handleClick} style={textShadowStyle}>
      {children}
    </a>
  );
};


// --- Componente Principal Navbar ---
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    window.addEventListener('scroll', handleScroll, { passive: true }); // passive para mejor rendimiento
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleNavLinkClick = useCallback((event: React.MouseEvent, sectionId?: string) => {
    closeMobileMenu();
    if (sectionId) {
      event.preventDefault();
      const isHomePage = location.pathname === '/' || location.pathname === '/home';
      if (isHomePage) {
        setTimeout(() => scrollToSection(sectionId), SMOOTH_SCROLL_DELAY_SAME_PAGE);
      } else {
        navigate('/');
        setTimeout(() => scrollToSection(sectionId), SMOOTH_SCROLL_DELAY_DIFFERENT_PAGE);
      }
    }
    // Si no es sectionId (ej. /propiedades o /login), Link se encarga de la navegación.
  }, [location.pathname, navigate, scrollToSection, closeMobileMenu]);

  // Función helper para obtener la ruta del dashboard según el rol
  const getDashboardPath = useCallback((role: string) => {
    switch (role) {
      case 'admin':
        return '/dashboard/admin/reservations';
      case 'owner':
        return '/dashboard/owner/reservations';
      case 'agency':
        return '/dashboard/agencies';
      case 'agent':
        return '/dashboard/admin/agents';
      default:
        return '/dashboard';
    }
  }, []);

  // Verificar si el usuario tiene acceso al dashboard
  const hasDashboardAccess = user && ['admin', 'agency', 'agent', 'owner'].includes(user.role);
  
  const navContainerClasses = cn(
    "fixed w-full z-50 transition-all",
    NAV_TRANSITION_DURATION,
    isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
  );

  const mobileMenuContainerClasses = cn(
    "md:hidden transition-all ease-in-out",
    NAV_TRANSITION_DURATION,
    isMobileMenuOpen
      ? 'max-h-screen opacity-100 visible py-4' // Ajustado max-h para contenido dinámico
      : 'max-h-0 opacity-0 invisible py-0'
  );
  
  const mobileMenuContentClasses = cn(
    "px-4 pt-2 pb-4 space-y-3",
    isScrolled ? 'bg-white/80 backdrop-blur-md' : 'bg-black/80 backdrop-blur-md'
  );

  const iconClasses = cn("w-6 h-6", isScrolled ? 'text-gray-800' : 'text-white'); // Tamaño de icono más estándar

  return (
    <nav className={navContainerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="block w-[150px]" onClick={closeMobileMenu}>
              <img
                src={isScrolled ? LOGO_SCROLLED : LOGO_DEFAULT}
                alt="Lovable"
                className="w-full h-auto"
              />
            </Link>
          </div>

          {/* Links de Navegación Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {NAV_ITEMS.map((item) => (
              <NavLinkItem
                key={item.label}
                to={item.to}
                href={item.href}
                sectionId={item.sectionId}
                onClick={handleNavLinkClick}
                isScrolled={isScrolled}
              >
                {item.label}
              </NavLinkItem>
            ))}
          </div>

          {/* Botones de Acción y Menú Móvil */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Menú de usuario en desktop */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="hidden md:flex">
                    <Button
                      variant="ghost"
                      className={cn(
                        "relative h-10 w-10 rounded-full",
                        isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/20'
                      )}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profileImage} alt={user.name} />
                        <AvatarFallback className={isScrolled ? 'bg-blue-600 text-white' : 'bg-white text-blue-800'}>
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {hasDashboardAccess && (
                      <DropdownMenuItem asChild>
                        <Link to={getDashboardPath(user.role)}>Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/properties">Ver Propiedades</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/profile/favorites">Mis Favoritos</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/profile">Mi Perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/login" className="hidden md:inline-flex">
                <Button variant={isScrolled ? "outline" : "secondary"}>
                  Iniciar Sesión
                </Button>
              </Link>
            )}
            <Button
              onClick={toggleMobileMenu}
              className={cn(
                "md:hidden transition-transform duration-200 active:scale-90 hover:scale-110 focus:outline-none",
                isScrolled ? 'text-gray-800 hover:bg-blue-600/10 hover:text-blue-700 focus:ring-blue-700' 
                           : 'text-white hover:bg-blue-600/20 hover:text-blue-400 focus:ring-blue-400',
                "focus:ring-2" // Anillo de foco
              )}
              variant="ghost"
              size="icon"
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className={iconClasses} /> : <Menu className={iconClasses} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      <div className={mobileMenuContainerClasses}>
        <div className={mobileMenuContentClasses}>
          {NAV_ITEMS.map((item) => (
            <NavLinkItem
              key={`mobile-${item.label}`}
              to={item.to}
              href={item.href}
              sectionId={item.sectionId}
              onClick={handleNavLinkClick}
              isScrolled={isScrolled}
              isMobile
            >
              {item.label}
            </NavLinkItem>
          ))}
          {isAuthenticated && user ? (
            <>
              <div className="pt-4 border-t border-white/20">
                <div className="flex items-center space-x-3 px-2 py-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profileImage} alt={user.name} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{user.name}</span>
                    <span className="text-xs text-white/80">{user.email}</span>
                  </div>
                </div>
              </div>
              {hasDashboardAccess && (
                <Link
                  to={getDashboardPath(user.role)}
                  className="block py-2 px-2 rounded hover:bg-white/10 text-white"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
              )}
              <Link
                to="/properties"
                className="block py-2 px-2 rounded hover:bg-white/10 text-white"
                onClick={closeMobileMenu}
              >
                Ver Propiedades
              </Link>
              <Link
                to="/dashboard/profile/favorites"
                className="block py-2 px-2 rounded hover:bg-white/10 text-white"
                onClick={closeMobileMenu}
              >
                Mis Favoritos
              </Link>
              <Link
                to="/dashboard/profile"
                className="block py-2 px-2 rounded hover:bg-white/10 text-white"
                onClick={closeMobileMenu}
              >
                Mi Perfil
              </Link>
              <Button
                onClick={() => {
                  logout();
                  closeMobileMenu();
                }}
                variant={isScrolled ? "outline" : "secondary"}
                className="w-full mt-2"
              >
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <Link
              to="/login"
              className="block pt-4"
              onClick={closeMobileMenu}
            >
              <Button
                variant={isScrolled ? "outline" : "secondary"}
                className="w-full"
              >
                Iniciar Sesión
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;