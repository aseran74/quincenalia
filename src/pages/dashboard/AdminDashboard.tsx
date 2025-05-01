import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  Building, Users, Calendar, FileText, AlertTriangle, MessageSquare, DollarSign,
  User, LogOut, Home, Menu, ChevronLeft, Search
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: <Home className="w-5 h-5" />, label: 'Panel de Control', path: '/dashboard/admin' },
  { icon: <Users className="w-5 h-5" />, label: 'Propietarios', path: '/dashboard/admin/owners' },
  { icon: <Building className="w-5 h-5" />, label: 'Propiedades', path: '/dashboard/admin/properties' },
  { icon: <FileText className="w-5 h-5" />, label: 'Facturas', path: '/dashboard/admin/invoices' },
  { icon: <AlertTriangle className="w-5 h-5" />, label: 'Incidencias', path: '/dashboard/admin/incidents' },
  { icon: <MessageSquare className="w-5 h-5" />, label: 'Mensajes', path: '/dashboard/admin/messages' },
  { icon: <DollarSign className="w-5 h-5" />, label: 'Comisiones', path: '/dashboard/admin/commissions' },
  { icon: <Building className="w-5 h-5" />, label: 'Agencias', path: '/dashboard/admin/agencies' },
  { icon: <Users className="w-5 h-5" />, label: 'Agentes', path: '/dashboard/admin/agents' }
];

const AdminDashboard: React.FC = () => {
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const sidebarWidthClass = isSidebarOpen ? 'w-64' : 'w-0 md:w-20';
  const mainContentMarginClass = isSidebarOpen ? 'md:ml-64' : 'md:ml-20';

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-boxdark-2 dark:text-bodydark">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0",
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          sidebarWidthClass
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
          <a href="/dashboard/admin">
            <span className={cn("text-white text-lg font-semibold", !isSidebarOpen && "lg:hidden")}>
              Lovable
            </span>
            {!isSidebarOpen && <Home className="w-6 h-6 text-white hidden lg:block" />}
          </a>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden lg:flex text-white hover:text-gray-300 focus:outline-none"
            aria-label="Toggle Sidebar"
          >
            <ChevronLeft className={cn(
              "h-5 w-5 transition-transform",
              !isSidebarOpen && "rotate-180"
            )} />
          </Button>
        </div>

        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
            <ul className="mb-6 flex flex-col gap-1.5">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Button
                    variant={location.pathname.startsWith(item.path) ? "secondary" : "ghost"}
                    className={cn(
                      "group relative flex w-full items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4",
                      location.pathname.startsWith(item.path) && "bg-graydark dark:bg-meta-4",
                      !isSidebarOpen && "lg:justify-center lg:px-0"
                    )}
                    onClick={() => navigate(item.path)}
                    title={!isSidebarOpen ? item.label : ""}
                  >
                    {item.icon}
                    <span className={cn(!isSidebarOpen && "lg:hidden")}>
                      {item.label}
                    </span>
                  </Button>
                </li>
              ))}
            </ul>

            <div className={cn("mt-auto p-4 border-t border-gray-700", !isSidebarOpen && "lg:px-0 lg:flex lg:justify-center")}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={cn(
                    "relative h-10 rounded-lg hover:bg-graydark flex items-center gap-2 px-2 w-full text-left text-bodydark1",
                    !isSidebarOpen && "lg:w-12 lg:justify-center lg:px-0"
                  )}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImage} alt={user?.name} />
                      <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className={cn("flex flex-col items-start overflow-hidden whitespace-nowrap", !isSidebarOpen && "lg:hidden")}>
                      <span className="text-sm font-medium truncate">{user?.name}</span>
                      <span className="text-xs text-gray-400 truncate">{user?.email}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white dark:bg-boxdark border border-gray-200 dark:border-strokedark" align="start" side="right" sideOffset={10}>
                  <DropdownMenuItem className="hover:bg-gray-100 dark:hover:bg-meta-4" onClick={() => navigate('/dashboard/admin/profile')}>
                    <User className="mr-2 h-4 w-4" /><span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-strokedark" />
                  <DropdownMenuItem className="text-red-600 hover:bg-gray-100 dark:hover:bg-meta-4" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /><span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>
        </div>
      </aside>

      {/* Content Area */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-40 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
          <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
            <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="z-50 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
                aria-label="Toggle Sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            <div className="hidden sm:block">
              {/* Aquí puedes añadir un campo de búsqueda global si lo necesitas */}
            </div>

            <div className="flex items-center gap-3 2xsm:gap-7">
              {/* Aquí puedes añadir iconos adicionales del header si los necesitas */}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 