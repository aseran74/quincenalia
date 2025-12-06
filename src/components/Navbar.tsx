import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Menu, X, Search, HelpCircle, Building2, 
  Compass, Info, RefreshCw, Eye, UserPlus, 
  TrendingUp, MessageCircle, Phone, Calendar, ChevronDown
} from 'lucide-react';
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

// Estructura de submenús
interface SubMenuItem {
  label: string;
  description: string;
  icon: React.ReactNode;
  to?: string;
  href?: string;
  sectionId?: string;
}

interface NavItem {
  label: string;
  icon?: React.ReactNode;
  to?: string;
  href?: string;
  sectionId?: string;
  submenu?: SubMenuItem[];
}

const NAV_ITEMS: NavItem[] = [
  { 
    label: 'Buscar', 
    icon: <Search className="w-4 h-4" />,
    to: '/propiedades' 
  },
  { 
    label: 'Cómo funciona',
    icon: <Info className="w-4 h-4" />,
    submenu: [
      {
        label: 'Explora y elige',
        description: 'Descubre propiedades únicas en destinos increíbles',
        icon: <Compass className="w-5 h-5" />,
        to: '/como-buscar-reservar'
      },
      {
        label: 'Como funciona',
        description: 'Conoce nuestro proceso paso a paso',
        icon: <Info className="w-5 h-5" />,
        to: '/como-funciona-dashboard'
      },
      {
        label: 'Intercambia tu propiedad',
        description: 'Intercambia tu casa por otra en cualquier lugar',
        icon: <RefreshCw className="w-5 h-5" />,
        to: '/intercambio-propiedades'
      }
    ]
  },
  { 
    label: 'Agencias',
    icon: <Building2 className="w-4 h-4" />,
    submenu: [
      {
        label: 'Ver agencias',
        description: 'Explora nuestras agencias asociadas',
        icon: <Eye className="w-5 h-5" />,
        to: '/agencias'
      },
      {
        label: 'Ser Agente',
        description: 'Únete a nuestro equipo de agentes',
        icon: <UserPlus className="w-5 h-5" />,
        to: '/ser-agente'
      },
      {
        label: 'Ventajas',
        description: 'Descubre los beneficios de trabajar con nosotros',
        icon: <TrendingUp className="w-5 h-5" />,
        to: '/ventajas'
      }
    ]
  },
  { 
    label: 'FAQ',
    icon: <HelpCircle className="w-4 h-4" />,
    submenu: [
      {
        label: 'FAQ',
        description: 'Preguntas frecuentes',
        icon: <HelpCircle className="w-5 h-5" />,
        href: '#faq',
        sectionId: 'faq'
      },
      {
        label: 'Reservas',
        description: 'Cómo reservar y cancelar',
        icon: <Calendar className="w-5 h-5" />,
        to: '/como-reservar'
      },
      {
        label: 'Soporte',
        description: 'Ayuda y soporte técnico',
        icon: <MessageCircle className="w-5 h-5" />,
        to: '/soporte'
      },
      {
        label: 'Contacto',
        description: 'Ponte en contacto con nosotros',
        icon: <Phone className="w-5 h-5" />,
        href: '#contacto',
        sectionId: 'contacto'
      }
    ]
  },
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

// Componente para submenú móvil
interface MobileSubmenuProps {
  item: NavItem;
  isNavbarScrolled: boolean;
  handleNavLinkClick: (event: React.MouseEvent, sectionId?: string) => void;
  closeMobileMenu: () => void;
}

const MobileSubmenu: React.FC<MobileSubmenuProps> = ({
  item,
  isNavbarScrolled,
  handleNavLinkClick,
  closeMobileMenu,
}) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}
        className={cn(
          "w-full flex items-center justify-between py-2 text-base font-medium transition-colors",
          isNavbarScrolled ? "text-gray-700" : "text-white"
        )}
      >
        <span className="flex items-center gap-2">
          {item.icon && (
            <span>
              {item.icon}
            </span>
          )}
          {item.label}
        </span>
        <ChevronDown 
          className={cn(
            "w-4 h-4 transition-transform",
            isSubmenuOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </button>
      {isSubmenuOpen && (
        <div className="pl-4 space-y-2 mt-2 border-l-2 border-white/20">
          {item.submenu?.map((subItem) => (
            subItem.to ? (
              <Link
                key={subItem.label}
                to={subItem.to}
                className="flex items-start gap-3 py-2 rounded hover:bg-white/10 transition-colors"
                onClick={closeMobileMenu}
              >
                <div className="mt-0.5 flex-shrink-0 text-white/80">
                  {subItem.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "font-medium",
                    isNavbarScrolled ? "text-gray-700" : "text-white"
                  )}>
                    {subItem.label}
                  </div>
                  <div className={cn(
                    "text-sm mt-0.5",
                    isNavbarScrolled ? "text-gray-500" : "text-white/70"
                  )}>
                    {subItem.description}
                  </div>
                </div>
              </Link>
            ) : (
              <a
                key={subItem.label}
                href={subItem.href}
                className="flex items-start gap-3 py-2 rounded hover:bg-white/10 transition-colors"
                onClick={(e) => {
                  handleNavLinkClick(e, subItem.sectionId);
                  closeMobileMenu();
                }}
              >
                <div className="mt-0.5 flex-shrink-0 text-white/80">
                  {subItem.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "font-medium",
                    isNavbarScrolled ? "text-gray-700" : "text-white"
                  )}>
                    {subItem.label}
                  </div>
                  <div className={cn(
                    "text-sm mt-0.5",
                    isNavbarScrolled ? "text-gray-500" : "text-white/70"
                  )}>
                    {subItem.description}
                  </div>
                </div>
              </a>
            )
          ))}
        </div>
      )}
    </div>
  );
};

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

  // Determinar si estamos en una página que requiere navbar siempre visible (fondo sólido)
  const isAlwaysScrolledPage = location.pathname.startsWith('/properties') || 
                               location.pathname.startsWith('/login') || 
                               location.pathname.startsWith('/dashboard'); 

  const isNavbarScrolled = isScrolled || isAlwaysScrolledPage;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
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
    isNavbarScrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
  );

  // Estado para controlar los dropdowns abiertos
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  const mobileMenuContainerClasses = cn(
    "md:hidden transition-all ease-in-out",
    NAV_TRANSITION_DURATION,
    isMobileMenuOpen
      ? 'max-h-screen opacity-100 visible py-4' // Ajustado max-h para contenido dinámico
      : 'max-h-0 opacity-0 invisible py-0'
  );
  
  const mobileMenuContentClasses = cn(
    "px-4 pt-2 pb-4 space-y-3",
    isNavbarScrolled ? 'bg-white/80 backdrop-blur-md' : 'bg-black/80 backdrop-blur-md'
  );

  const iconClasses = cn("w-6 h-6", isNavbarScrolled ? 'text-gray-800' : 'text-white'); // Tamaño de icono más estándar

  return (
    <nav className={navContainerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="block w-[150px]" onClick={closeMobileMenu}>
              <img
                src={isNavbarScrolled ? LOGO_SCROLLED : LOGO_DEFAULT}
                alt="Lovable"
                className="w-full h-auto"
              />
            </Link>
          </div>

          {/* Links de Navegación Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {NAV_ITEMS.map((item) => {
              // Si tiene submenú, renderizar DropdownMenu
              if (item.submenu) {
                const isOpen = openDropdowns[item.label] || false;
                return (
                  <DropdownMenu 
                    key={item.label}
                    open={isOpen}
                    onOpenChange={(open) => setOpenDropdowns(prev => ({ ...prev, [item.label]: open }))}
                  >
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          "px-3 py-1 rounded font-semibold transition-colors duration-200 shadow-sm hover:bg-white/20 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary flex items-center gap-2",
                          isNavbarScrolled ? "text-gray-800" : "text-white drop-shadow-lg"
                        )}
                        style={{
                          textShadow: isNavbarScrolled ? '0 1px 6px rgba(255,255,255,0.2)' : '0 2px 10px rgba(0,0,0,0.5)'
                        }}
                        onMouseEnter={() => {
                          setOpenDropdowns(prev => ({ ...prev, [item.label]: true }));
                        }}
                        onMouseLeave={() => {
                          setTimeout(() => setOpenDropdowns(prev => ({ ...prev, [item.label]: false })), 1500);
                        }}
                      >
                        {item.icon && (
                          <span className={cn(
                            isNavbarScrolled ? "text-gray-800" : "text-white"
                          )}>
                            {item.icon}
                          </span>
                        )}
                        {item.label}
                        <ChevronDown 
                          className={cn(
                            "w-3 h-3 transition-all duration-500 ease-in-out",
                            isOpen ? "rotate-180" : "rotate-0",
                            isNavbarScrolled ? "text-gray-800" : "text-white"
                          )}
                        />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      className="w-80 z-[100] mt-2 backdrop-blur-sm bg-white/95 shadow-xl border-gray-200/50" 
                      align="start"
                      sideOffset={8}
                      onMouseEnter={() => setOpenDropdowns(prev => ({ ...prev, [item.label]: true }))}
                      onMouseLeave={() => {
                        setTimeout(() => setOpenDropdowns(prev => ({ ...prev, [item.label]: false })), 1500);
                      }}
                    >
                      {item.submenu.map((subItem) => (
                        <DropdownMenuItem
                          key={subItem.label}
                          asChild
                          className="cursor-pointer p-0"
                        >
                          {subItem.to ? (
                            <Link
                              to={subItem.to}
                              className="group flex items-start gap-3 p-3 hover:bg-gray-50 rounded-md transition-all duration-200 ease-in-out hover:shadow-sm"
                              onClick={closeMobileMenu}
                            >
                              <div className={cn(
                                "mt-0.5 flex-shrink-0 transition-colors duration-200",
                                isNavbarScrolled ? "text-blue-600 group-hover:text-blue-700" : "text-blue-500 group-hover:text-blue-600"
                              )}>
                                {subItem.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 transition-colors duration-200 group-hover:text-gray-950">
                                  {subItem.label}
                                </div>
                                <div className="text-sm text-gray-500 mt-0.5 transition-colors duration-200 group-hover:text-gray-600">
                                  {subItem.description}
                                </div>
                              </div>
                            </Link>
                          ) : (
                            <a
                              href={subItem.href}
                              className="group flex items-start gap-3 p-3 hover:bg-gray-50 rounded-md transition-all duration-200 ease-in-out hover:shadow-sm"
                              onClick={(e) => {
                                handleNavLinkClick(e, subItem.sectionId);
                                closeMobileMenu();
                              }}
                            >
                              <div className={cn(
                                "mt-0.5 flex-shrink-0 transition-colors duration-200",
                                isNavbarScrolled ? "text-blue-600 group-hover:text-blue-700" : "text-blue-500 group-hover:text-blue-600"
                              )}>
                                {subItem.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 transition-colors duration-200 group-hover:text-gray-950">
                                  {subItem.label}
                                </div>
                                <div className="text-sm text-gray-500 mt-0.5 transition-colors duration-200 group-hover:text-gray-600">
                                  {subItem.description}
                                </div>
                              </div>
                            </a>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }
              
              // Si no tiene submenú, renderizar link normal
              return (
                <NavLinkItem
                  key={item.label}
                  to={item.to}
                  href={item.href}
                  sectionId={item.sectionId}
                  onClick={handleNavLinkClick}
                  isScrolled={isNavbarScrolled}
                >
                  <span className="flex items-center gap-2">
                    {item.icon && (
                      <span>
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                  </span>
                </NavLinkItem>
              );
            })}
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
                        isNavbarScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/20'
                      )}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profileImage} alt={user.name} />
                        <AvatarFallback className={isNavbarScrolled ? 'bg-blue-600 text-white' : 'bg-white text-blue-800'}>
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
                <Button variant={isNavbarScrolled ? "outline" : "secondary"}>
                  Iniciar Sesión
                </Button>
              </Link>
            )}
            <Button
              onClick={toggleMobileMenu}
              className={cn(
                "md:hidden transition-transform duration-200 active:scale-90 hover:scale-110 focus:outline-none",
                isNavbarScrolled ? 'text-gray-800 hover:bg-blue-600/10 hover:text-blue-700 focus:ring-blue-700' 
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
          {NAV_ITEMS.map((item) => {
            // Si tiene submenú, usar componente MobileSubmenu
            if (item.submenu) {
              return (
                <MobileSubmenu
                  key={`mobile-${item.label}`}
                  item={item}
                  isNavbarScrolled={isNavbarScrolled}
                  handleNavLinkClick={handleNavLinkClick}
                  closeMobileMenu={closeMobileMenu}
                />
              );
            }
            
            // Si no tiene submenú, renderizar link normal
            return (
              <NavLinkItem
                key={`mobile-${item.label}`}
                to={item.to}
                href={item.href}
                sectionId={item.sectionId}
                onClick={handleNavLinkClick}
                isScrolled={isNavbarScrolled}
                isMobile
              >
                <span className="flex items-center gap-2">
                  {item.icon && (
                    <span>
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </span>
              </NavLinkItem>
            );
          })}
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
                variant={isNavbarScrolled ? "outline" : "secondary"}
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
                variant={isNavbarScrolled ? "outline" : "secondary"}
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