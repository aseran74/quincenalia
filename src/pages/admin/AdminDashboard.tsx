import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Building, Users, Calendar, FileText, AlertTriangle, MessageSquare, DollarSign,
  User, LogOut, Home, Menu, ChevronLeft, PhoneCall
} from 'lucide-react';
import { FaSyncAlt } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: <Home className="w-5 h-5 text-white" />, label: 'Panel de Control', path: '/dashboard/admin' },
  { icon: <Users className="w-5 h-5 text-white" />, label: 'Propietarios', path: '/dashboard/admin/owners' },
  { icon: <Building className="w-5 h-5 text-white" />, label: 'Propiedades', path: '/dashboard/admin/properties' },
  { icon: <Calendar className="w-5 h-5 text-white" />, label: 'Reservas', path: '/dashboard/admin/reservations' },
  { icon: <FileText className="w-5 h-5 text-white" />, label: 'Facturas', path: '/dashboard/admin/invoices' },
  { icon: <AlertTriangle className="w-5 h-5 text-white" />, label: 'Incidencias', path: '/dashboard/admin/incidents' },
  { icon: <FaSyncAlt className="w-5 h-5 text-white" />, label: 'Intercambios', path: '/dashboard/admin/exchange' },
  { icon: <MessageSquare className="w-5 h-5 text-white" />, label: 'Mensajes', path: '/dashboard/admin/messages' },
  { icon: <DollarSign className="w-5 h-5 text-white" />, label: 'Comisiones', path: '/dashboard/admin/commissions' },
  { icon: <Building className="w-5 h-5 text-white" />, label: 'Agencias', path: '/dashboard/admin/agencies' },
  { icon: <Users className="w-5 h-5 text-white" />, label: 'Agentes', path: '/dashboard/admin/agents' },
  { icon: <PhoneCall className="w-5 h-5 text-white" />, label: 'Solicitudes de Contacto', path: '/dashboard/admin/contact-requests' }
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const checkMobile = () => window.innerWidth < 768;
    const mobile = checkMobile();
    setIsMobile(mobile);
    setIsSidebarOpen(!mobile);

    const handleResize = () => {
      const newMobile = checkMobile();
      if (newMobile !== isMobile) {
        setIsMobile(newMobile);
        setIsSidebarOpen(!newMobile);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location, isMobile]);

  // Efecto para forzar el color de la sidebar
  useEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.style.backgroundColor = '#064D82';
      sidebarRef.current.style.setProperty('background-color', '#064D82', 'important');
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-boxdark-2 dark:text-bodydark">
      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col overflow-y-hidden duration-300 ease-linear lg:static lg:translate-x-0",
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          isSidebarOpen ? 'w-64' : 'w-0 lg:w-20'
        )}
        style={{ backgroundColor: '#064D82' }}
      >
        {/* ----- Logo arriba del todo ----- */}
        <div className="flex items-center justify-center py-4 px-4 border-b border-white/10">
          <a href="/dashboard/admin" className="flex items-center justify-center">
            {isSidebarOpen ? (
              <img
                src="/logo-blanco.png"
                alt="Logo"
                className="h-10 w-auto"
              />
            ) : (
              <img
                src="/logo-blanco.png"
                alt="Logo"
                className="h-8 w-8 object-contain"
              />
            )}
          </a>
        </div>

        {/* Botón de menú solo en móvil para mostrar/ocultar sidebar */}
        {isMobile && (
          <div className="flex items-center justify-between gap-2 px-4 py-4 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-white hover:text-gray-300 focus:outline-none"
              aria-label="Abrir/cerrar menú"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        )}

        {/* Sidebar Header */}
        <div className="hidden lg:flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
          {/* Botón de toggle solo en escritorio */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-white hover:text-white/20 focus:outline-none ml-auto"
            aria-label="Toggle Sidebar"
          >
            <ChevronLeft className={cn(
              "h-5 w-5 transition-transform text-white",
              !isSidebarOpen && "rotate-180"
            )} />
          </Button>
        </div>

        {/* Sidebar Menu */}
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          <div className="mb-6 flex flex-col gap-1.5">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname.startsWith(item.path) ? "secondary" : "ghost"}
                className={cn(
                  "group relative flex w-full items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-white duration-300 ease-in-out hover:bg-white/10",
                  location.pathname.startsWith(item.path) && "bg-white/10",
                  !isSidebarOpen && "lg:justify-center lg:px-0"
                )}
                onClick={() => navigate(item.path)}
                title={!isSidebarOpen ? item.label : ""}
              >
                {item.icon}
                {/* Mostrar texto solo si el sidebar está abierto */}
                <span className={cn("whitespace-nowrap text-white transition-all duration-200", !isSidebarOpen && "lg:hidden")}>{item.label}</span>
              </Button>
            ))}
          </div>

          {/* User Profile */}
          <div className="mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "relative w-full rounded-lg hover:bg-white/10 flex items-center gap-2 px-2 text-left text-white",
                    !isSidebarOpen && "lg:justify-center"
                  )}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImage} alt={user?.name} />
                    <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className={cn("flex flex-col overflow-hidden", !isSidebarOpen && "lg:hidden")}>
                    <span className="text-sm font-medium truncate text-white">{user?.name}</span>
                    <span className="text-xs text-gray-300 truncate">{user?.email}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-gray-900 text-white border-gray-700 shadow-xl" align="end" forceMount>
                <DropdownMenuItem 
                  onClick={() => navigate('/dashboard/admin/profile')} 
                  className="hover:bg-white/10 text-white cursor-pointer focus:bg-white/10"
                >
                  <User className="mr-2 h-4 w-4 text-white" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="text-red-400 hover:bg-red-500/20 cursor-pointer focus:bg-red-500/20"
                >
                  <LogOut className="mr-2 h-4 w-4 text-red-400" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </aside>

      {/* Content Area */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-[60] flex w-full bg-white border-b border-gray-200 shadow-sm">
          <div className="flex flex-grow items-center justify-between px-4 py-4 md:px-6 2xl:px-11 w-full">
            {/* Botón de menú móvil */}
            <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
            
            {/* User Menu en Header - Siempre visible en todas las pantallas */}
            <div className="ml-auto flex items-center">
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 hover:bg-gray-100 rounded-full px-2 py-1.5"
                    >
                      <Avatar className="h-9 w-9 border-2 border-gray-200 ring-2 ring-gray-100">
                        <AvatarImage src={user?.profileImage} alt={user?.name} />
                        <AvatarFallback className="bg-blue-600 text-white font-semibold">
                          {user?.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:flex flex-col items-start">
                        <span className="text-sm font-semibold text-gray-900">{user?.name}</span>
                        <span className="text-xs text-gray-500">{user?.email}</span>
                      </div>
                      <ChevronLeft className="hidden sm:block h-4 w-4 text-gray-400 rotate-90" />
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 shadow-lg" align="end" forceMount>
                  <div className="px-2 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.profileImage} alt={user?.name} />
                        <AvatarFallback className="bg-blue-600 text-white">
                          {user?.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{user?.name}</span>
                        <span className="text-xs text-gray-500">{user?.email}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuItem 
                    onClick={() => navigate('/dashboard/admin/profile')} 
                    className="cursor-pointer py-2.5"
                  >
                    <User className="mr-2 h-4 w-4 text-gray-600" />
                    <span>Mi Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="text-red-600 hover:bg-red-50 cursor-pointer py-2.5 focus:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4 text-red-600" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 