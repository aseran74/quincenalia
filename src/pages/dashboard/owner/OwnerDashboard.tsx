import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import MessagesBoard from '@/pages/dashboard/mensajes/MessagesBoard';
import { Owner } from '@/types/user'; // Import Owner type

// Importamos TODOS los iconos necesarios de react-icons/fa
import {
  FaHome,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaFileInvoiceDollar,
  FaEnvelope,
  FaUser,
  FaSignOutAlt, // Para el botón de logout
  FaBars,       // Reemplazo para Menu (lucide)
  FaTimes,      // Reemplazo para X (lucide)
  FaExchangeAlt // Icono para Intercambio
} from 'react-icons/fa';

// --- Componentes de ejemplo (Facturas, Mensajes) - Sin cambios ---

export const OwnerInvoices = () => {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Mis Facturas</h1>
      <Card className="p-4 md:p-6 bg-white dark:bg-gray-800 shadow-sm">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Aquí podrás ver las facturas que el administrador te ha enviado.
          Las facturas son de solo lectura y se actualizan automáticamente.
        </p>
        <div className="mt-4 p-6 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
          <p className="text-center text-gray-500 dark:text-gray-400">Actualmente no hay facturas disponibles.</p>
        </div>
      </Card>
    </div>
  );
};

// --- Definición de items del menú (usando react-icons/fa) ---
const menuItems = [
  { icon: <FaHome className="w-5 h-5 flex-shrink-0" />, label: 'Inicio', path: '/dashboard/owner' },
  { icon: <FaExclamationTriangle className="w-5 h-5 flex-shrink-0" />, label: 'Incidencias', path: '/dashboard/owner/incidents' },
  { icon: <FaCalendarAlt className="w-5 h-5 flex-shrink-0" />, label: 'Reservar Semanas', path: '/dashboard/owner/reservations' },
  { icon: <FaExchangeAlt className="w-5 h-5 flex-shrink-0" />, label: 'Intercambio', path: '/dashboard/owner/exchange' },
  { icon: <FaFileInvoiceDollar className="w-5 h-5 flex-shrink-0" />, label: 'Facturas', path: '/dashboard/owner/invoices' },
  { icon: <FaEnvelope className="w-5 h-5 flex-shrink-0" />, label: 'Mensajes', path: '/dashboard/owner/messages' },
  { icon: <FaUser className="w-5 h-5 flex-shrink-0" />, label: 'Perfil', path: '/dashboard/owner/profile' }
];

const SIDEBAR_ID = "owner-sidebar";

// --- Componente Principal del Dashboard del Propietario ---
const OwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading: authLoading } = useAuth();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  const sidebarRef = useRef<HTMLElement>(null);
  const mobileToggleButtonRef = useRef<HTMLButtonElement>(null);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => {
    if (isMobile) setIsSidebarOpen(false);
  };

  // Efecto para resize - Sin cambios
  useEffect(() => {
    const checkMobile = () => window.innerWidth < 1024;
    const handleResize = () => {
      const newMobile = checkMobile();
      if (newMobile !== isMobile) {
        setIsMobile(newMobile);
        setIsSidebarOpen(!newMobile);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Efecto para clic fuera - Sin cambios
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isMobile || !isSidebarOpen) return;
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        mobileToggleButtonRef.current &&
        !mobileToggleButtonRef.current.contains(event.target as Node)
      ) {
        closeSidebar();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen, isMobile]);

  // Efecto para cambio de ruta - Sin cambios
  useEffect(() => {
    closeSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, isMobile]);

  // Handler para logout - Sin cambios
  const handleLogout = async () => {
    if (logout) {
        await logout();
    }
    navigate('/login');
  };

  const sidebarWidthClass = 'w-64';
  const mainContentMarginClass = 'lg:ml-64';

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">

      {/* Botón para abrir/cerrar en móvil (usando react-icons) */}
      <Button
        ref={mobileToggleButtonRef}
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-[60] lg:hidden bg-white dark:bg-gray-800 p-2 rounded-md shadow-md border border-gray-200 dark:border-gray-700"
        aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
        aria-controls={SIDEBAR_ID}
        aria-expanded={isSidebarOpen}
      >
        {/* === CAMBIO DE ICONO === */}
        {isSidebarOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
      </Button>

      {/* Overlay - Sin cambios */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={closeSidebar}
          aria-label="Cerrar menú"
        />
      )}

      {/* Sidebar */}
      <aside
        id={SIDEBAR_ID}
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col bg-white dark:bg-gray-800 shadow-lg lg:shadow-md duration-300 ease-in-out",
          "lg:static lg:translate-x-0",
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          sidebarWidthClass
        )}
        aria-hidden={isMobile ? !isSidebarOpen : undefined}
      >
        {/* Cabecera del Sidebar - Solo visible en desktop */}
        <div className="hidden lg:flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
           <Avatar className="h-10 w-10">
                <AvatarImage src={user?.profileImage || undefined} alt={user?.name || 'P'} />
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                    {user?.name ? user.name.substring(0, 1).toUpperCase() : (user?.email ? user.email.substring(0, 1).toUpperCase() : 'P')}
                </AvatarFallback>
           </Avatar>
           <div className="flex flex-col overflow-hidden flex-grow">
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 truncate">{user?.name || 'Propietario'}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
           </div>

           {/* Display user points here in the sidebar header */}
           {!authLoading && user && user.role === 'owner' && 'points' in user && (
              <div className="flex-shrink-0 ml-2">
                 {/* You might want a smaller card or just text for the sidebar */}
                 <div className="text-center bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md px-2 py-1 text-sm font-bold">
                    {(user as Owner).points} Pts
                 </div>
              </div>
           )}

        </div>

        {/* Navegación */}
        <nav className="flex flex-col flex-grow pt-4 overflow-y-auto">
          <div className="flex-grow px-2 space-y-1">
            {/* Items del menú (ya usaban react-icons) - Sin cambios */}
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/dashboard/owner');
              const isHomeActive = item.path === '/dashboard/owner' && location.pathname === '/dashboard/owner';
              const finalIsActive = item.path === '/dashboard/owner' ? isHomeActive : isActive;

              return (
                  <Button
                    key={item.path}
                    variant={finalIsActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 px-3 py-2.5 rounded-md text-sm font-medium",
                      finalIsActive
                        ? "bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-300"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    )}
                    onClick={() => {
                      navigate(item.path);
                      closeSidebar();
                    }}
                  >
                    <span className={cn("flex-shrink-0 w-5 h-5", finalIsActive ? "text-blue-600 dark:text-blue-300" : "")}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </Button>
              );
            })}
          </div>

          {/* Botón de Logout (usando react-icons) */}
          <div className="p-2 mt-auto border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300"
              onClick={handleLogout}
            >
              {/* === CAMBIO DE ICONO === */}
              <FaSignOutAlt className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Cerrar Sesión</span>
            </Button>
          </div>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <div className={cn(
          "relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden transition-margin duration-300 ease-in-out",
          isSidebarOpen ? mainContentMarginClass : "lg:ml-0"
        )}
      >
         {/* Cabecera simple del contenido principal */}
         <header className="sticky top-0 z-30 flex w-full bg-white dark:bg-gray-800 shadow-sm dark:border-b dark:border-gray-700 lg:hidden"> {/* Oculto en desktop */}
             <div className="flex items-center justify-between px-4 py-3 w-full">
                 {/* Espacio para el botón de menú en móvil */}
                 <div className="w-10 h-10"></div>
                 {/* Podrías poner aquí el título de la sección actual si quisieras */}
                 <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">Panel Propietario</span>
                 {/* Espacio derecho (o iconos adicionales si los hubiera) */}
                 <div className="w-10"></div>
             </div>
        </header>

        {/* Outlet donde se renderiza el contenido de la ruta */}
        <main className="flex-1"> {/* Quitamos el p-6 de aquí para ponerlo en los componentes hijos si se desea */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Exportaciones (asegúrate que esto esté al final o donde corresponda)
// export { OwnerInvoices, OwnerMessages }; // Ya están exportados arriba
export default OwnerDashboard;