import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  Building, Users, Calendar, FileText, AlertTriangle, MessageSquare, DollarSign,
  User, LogOut, Home, Menu, ChevronLeft, Search, X // Asegúrate de importar X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils'; // Asegúrate que esta utilidad exista y funcione
import { FaSyncAlt } from 'react-icons/fa';

// Asegúrate que la ruta a tus componentes (ui/button, ui/avatar, etc.) y hooks (useAuth) sea correcta

const menuItems = [
  { icon: <Home className="w-5 h-5" />, label: 'Panel de Control', path: '/dashboard/admin' },
  { icon: <Users className="w-5 h-5" />, label: 'Propietarios', path: '/dashboard/admin/owners' },
  { icon: <Building className="w-5 h-5" />, label: 'Propiedades', path: '/dashboard/admin/properties' },
  { icon: <FileText className="w-5 h-5" />, label: 'Facturas', path: '/dashboard/admin/invoices' },
  { icon: <AlertTriangle className="w-5 h-5" />, label: 'Incidencias', path: '/dashboard/admin/incidents' },
  { icon: <FaSyncAlt className="w-5 h-5" />, label: 'Intercambios', path: '/dashboard/admin/exchange' },
  { icon: <MessageSquare className="w-5 h-5" />, label: 'Mensajes', path: '/dashboard/admin/messages' },
  { icon: <DollarSign className="w-5 h-5" />, label: 'Comisiones', path: '/dashboard/admin/commissions' },
  { icon: <Building className="w-5 h-5" />, label: 'Agencias', path: '/dashboard/admin/agencies' },
  { icon: <Users className="w-5 h-5" />, label: 'Agentes', path: '/dashboard/admin/agents' }
];

const SIDEBAR_ID = "app-sidebar";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); // Asegúrate que useAuth funcione y devuelva user y logout

  // Estado inicial: Detecta si es móvil y ajusta la visibilidad inicial del sidebar
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile); // Abierto en desktop, cerrado en móvil por defecto

  const sidebarRef = useRef<HTMLElement>(null);
  const mobileToggleButtonRef = useRef<HTMLButtonElement>(null); // Ref para el botón externo

  // Función para cambiar el estado del sidebar (abrir/cerrar)
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Función específica para cerrar el sidebar (usada por overlay y navegación)
  const closeSidebar = () => {
    if (isMobile) { // Solo cierra automáticamente en móvil
        setIsSidebarOpen(false);
    }
  };

  // Efecto para manejar el redimensionamiento de la ventana
  useEffect(() => {
    const checkMobile = () => window.innerWidth < 1024; // lg breakpoint

    const handleResize = () => {
      const newMobile = checkMobile();
      if (newMobile !== isMobile) {
        setIsMobile(newMobile);
        // Ajustar el estado del sidebar al cambiar entre móvil/escritorio
        setIsSidebarOpen(!newMobile); // Abrir en escritorio, cerrar en móvil
      }
    };

    window.addEventListener('resize', handleResize);
    // Llama una vez al montar para asegurar el estado inicial
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // No incluir isMobile aquí para evitar re-renders innecesarios


  // Efecto para cerrar el sidebar en móvil al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isMobile || !isSidebarOpen) return;

      // Si el clic no fue en el sidebar ni en el botón que lo abre/cierra
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        mobileToggleButtonRef.current && // Verifica también el botón externo
        !mobileToggleButtonRef.current.contains(event.target as Node)
      ) {
        closeSidebar();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen, isMobile]); // Depende de estos estados


  // Efecto para cerrar el sidebar en móvil al cambiar de ruta
  useEffect(() => {
    closeSidebar(); // Intentará cerrar (solo lo hará si es móvil)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, isMobile]); // Depende de location y isMobile

  // Handler para el logout
  const handleLogout = async () => {
    if (logout) { // Verifica que logout exista
        await logout();
    }
    navigate('/login'); // Redirige siempre
  };

  // Clases CSS dinámicas para el ancho del sidebar y el margen del contenido
  const sidebarWidthClass = isSidebarOpen ? 'w-64' : 'w-0 lg:w-20'; // Colapsado en desktop es w-20
  const mainContentMarginClass = isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'; // Margen ajustado en desktop

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-boxdark-2 dark:text-bodydark">

      {/* ==================== Botón Toggle Móvil (Externo) ==================== */}
      <Button
        ref={mobileToggleButtonRef}
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-[60] lg:hidden bg-white dark:bg-boxdark p-2 rounded-md shadow-md border dark:border-strokedark" // Estilos para visibilidad
        aria-label="Abrir/cerrar menú" // Label más genérico ya que hace ambas cosas
        aria-controls={SIDEBAR_ID}
        aria-expanded={isSidebarOpen}
      >
        {/* Mantenemos Menu aquí, el cierre visual principal es el botón interno 'X' */}
        <Menu className="h-6 w-6" />
      </Button>

      {/* ==================== Overlay Móvil ==================== */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden" // Se muestra solo en móvil y si el sidebar está abierto
          onClick={closeSidebar} // Cierra al hacer clic
          aria-label="Cerrar menú"
        />
      )}

      {/* ==================== Sidebar ==================== */}
      <aside
        id={SIDEBAR_ID}
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark", // Estilos base y transición
          "lg:static lg:translate-x-0", // Comportamiento en desktop
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full', // Animación de entrada/salida móvil
          sidebarWidthClass // Ancho dinámico
        )}
        aria-hidden={isMobile ? !isSidebarOpen : undefined} // Oculto a lectores de pantalla si está cerrado en móvil
      >
        {/* ----- Cabecera del Sidebar ----- */}
        <div className="relative flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5"> {/* Añadido relative para el botón absoluto */}
          {/* Logo/Título (Visible si sidebar abierto o en móvil) */}
           <a href="/dashboard/admin" className={cn(isSidebarOpen ? "block" : "hidden lg:hidden")}>
                <span className="text-white text-lg font-semibold">Lovable</span>
           </a>
           {/* Icono Home (Visible si sidebar colapsado en desktop) */}
           {!isSidebarOpen && (
              <a href="/dashboard/admin" className="hidden lg:block px-4"> {/* Padding para centrar */}
                  <Home className="w-6 h-6 text-white" />
              </a>
           )}
           {/* Botón Colapsar/Expandir Desktop */}
           <Button
             variant="ghost"
             size="icon"
             onClick={toggleSidebar}
             className="hidden lg:flex text-white hover:text-gray-300 focus:outline-none" // Solo visible en desktop
             aria-label={isSidebarOpen ? "Colapsar menú" : "Expandir menú"}
             aria-controls={SIDEBAR_ID}
             aria-expanded={isSidebarOpen}
           >
             <ChevronLeft className={cn("h-5 w-5 transition-transform", !isSidebarOpen && "rotate-180")} />
           </Button>

            {/* ==================== BOTÓN DE CIERRE INTERNO MÓVIL ==================== */}
            {/* *** Colocado aquí DENTRO del header para posicionamiento relativo *** */}
            {/* *** O justo después del header, pero DENTRO del <aside> ***        */}
            {isMobile && isSidebarOpen && (
                <button
                    onClick={toggleSidebar} // Cierra el sidebar
                    className="absolute top-3 right-4 z-[51] flex items-center justify-center w-8 h-8 rounded-full bg-white/80 dark:bg-gray-700/80 text-black dark:text-white shadow-lg hover:bg-white dark:hover:bg-gray-600 transition lg:hidden" // Ajustado Z-index, tamaño y estilos
                    aria-label="Cerrar menú"
                    type="button"
                >
                    <X className="h-5 w-5" /> {/* Icono de cierre */}
                </button>
            )}
           {/* =================================================================== */}
        </div>

        {/* ----- Navegación del Sidebar (Scrollable) ----- */}
        <div className="no-scrollbar flex flex-col flex-grow overflow-y-auto duration-300 ease-linear">
          <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6 flex flex-col flex-grow"> {/* flex-grow para empujar user menu abajo */}
            {/* Lista de Items */}
            <ul className="mb-6 flex flex-col gap-1.5">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Button
                    variant={location.pathname.startsWith(item.path) ? "secondary" : "ghost"}
                    className={cn(
                      "group relative flex w-full items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 justify-start",
                      location.pathname.startsWith(item.path) && "bg-graydark dark:bg-meta-4", // Estilo activo
                      !isSidebarOpen && "lg:justify-center lg:px-0" // Estilo colapsado desktop
                    )}
                    onClick={() => {
                      navigate(item.path);
                      closeSidebar(); // Cierra en móvil al navegar
                    }}
                    title={!isSidebarOpen ? item.label : ""} // Tooltip en desktop colapsado
                  >
                    {item.icon}
                    <span className={cn("truncate", !isSidebarOpen && "lg:hidden")}> {/* Ocultar texto si colapsado desktop */}
                      {item.label}
                    </span>
                  </Button>
                </li>
              ))}
            </ul>

            {/* ----- Menú de Usuario (al final) ----- */}
            <div className={cn(
                "mt-auto p-4 border-t border-gray-700 dark:border-strokedark", // mt-auto lo empuja abajo
                !isSidebarOpen && "lg:px-0 lg:flex lg:justify-center" // Centrado si colapsado desktop
            )}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="ghost" className={cn(
                    "relative h-auto rounded-lg hover:bg-graydark dark:hover:bg-meta-4 flex items-center gap-2 px-2 w-full text-left text-bodydark1 py-2",
                    !isSidebarOpen && "lg:w-12 lg:justify-center lg:px-0" // Estilo colapsado desktop
                  )}>
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={user?.profileImage || undefined} alt={user?.name || 'U'} /> {/* Usa undefined si es null/empty */}
                      <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className={cn(
                        "flex flex-col items-start overflow-hidden whitespace-nowrap flex-grow min-w-0",
                        !isSidebarOpen && "lg:hidden" // Ocultar texto si colapsado desktop
                    )}>
                        <span className="text-sm font-medium truncate w-full">{user?.name || 'Usuario'}</span>
                        <span className="text-xs text-gray-400 truncate w-full">{user?.email || ''}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white dark:bg-boxdark border border-gray-200 dark:border-strokedark mb-2" align="end" side="top" sideOffset={10}>
                  <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 dark:hover:bg-meta-4" onClick={() => navigate('/dashboard/admin/profile')}>
                    <User className="mr-2 h-4 w-4" /><span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-strokedark" />
                  <DropdownMenuItem className="cursor-pointer text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /><span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>
        </div>
      </aside>

      {/* ==================== Área de Contenido Principal ==================== */}
      <div className={cn(
          "relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden transition-margin duration-300 ease-linear", // Transición para el margen
          mainContentMarginClass // Aplica el margen dinámico en desktop
      )}>
        {/* ----- Header Principal ----- */}
        <header className="sticky top-0 z-30 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
          <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
             {/* Espacio Izquierdo para compensar botón fijo móvil */}
             <div className="w-10 h-10 flex-shrink-0 lg:hidden"></div> {/* Ocupa espacio solo en móvil */}

            {/* Contenido Opcional del Header (Centro/Derecha) */}
            <div className="hidden sm:block">
              {/* Puedes poner un título de página o búsqueda aquí */}
            </div>
            <div className="flex items-center gap-3 2xsm:gap-7">
              {/* Puedes poner notificaciones, menú de usuario aquí si no está en sidebar, etc. */}
            </div>
          </div>
        </header>

        {/* ----- Contenido Principal (Outlet) ----- */}
        <main>
          <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            <Outlet /> {/* Aquí se renderizarán las rutas anidadas */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;