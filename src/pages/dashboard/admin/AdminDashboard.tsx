import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet, Routes, Route } from 'react-router-dom';
import {
  Building, Users, Calendar, FileText, AlertTriangle, MessageSquare, DollarSign,
  User, LogOut, Home, Menu, ChevronLeft
} from 'lucide-react';
import { FaExchangeAlt } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import AddProperty2 from '../AddProperty2';

const menuItems = [
  { icon: <Home className="w-5 h-5" />, label: 'Panel de Control', path: '/dashboard/admin' },
  { icon: <Users className="w-5 h-5" />, label: 'Propietarios', path: '/dashboard/admin/owners' },
  { icon: <Building className="w-5 h-5" />, label: 'Propiedades', path: '/dashboard/admin/properties' },
  { icon: <FileText className="w-5 h-5" />, label: 'Facturas', path: '/dashboard/admin/invoices' },
  { icon: <AlertTriangle className="w-5 h-5" />, label: 'Incidencias', path: '/dashboard/admin/incidents' },
  { icon: <FaExchangeAlt className="w-5 h-5" />, label: 'Intercambios', path: '/dashboard/admin/exchange' },
  { icon: <MessageSquare className="w-5 h-5" />, label: 'Mensajes', path: '/dashboard/admin/messages' },
  { icon: <DollarSign className="w-5 h-5" />, label: 'Comisiones', path: '/dashboard/admin/commissions' },
  { icon: <Building className="w-5 h-5" />, label: 'Agencias', path: '/dashboard/admin/agencies' },
  { icon: <Users className="w-5 h-5" />, label: 'Agentes', path: '/dashboard/admin/agents' }
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  console.log('RENDER CHECK - isMobile:', isMobile, 'isSidebarOpen:', isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "fixed top-4 left-4 z-50 md:hidden",
        )}
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-6 w-6" />
      </Button>

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-white shadow-md",
          "transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64" : "w-0 md:w-20",
          "md:relative md:translate-x-0",
          isMobile
            ? isSidebarOpen
              ? "translate-x-0"
              : "hidden"
            : "",
           isMobile && !isSidebarOpen && "!w-auto"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className={cn(
              "flex items-center p-4 border-b",
              isSidebarOpen ? "justify-between" : "justify-center md:justify-between"
          )}>
            {(isSidebarOpen || !isMobile) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={cn(
                      "relative h-10 rounded-lg hover:bg-gray-100 flex items-center gap-2 px-2",
                      !isSidebarOpen && !isMobile && "w-12 justify-center p-0"
                  )}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImage} alt={user?.name} />
                      <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {isSidebarOpen && (
                      <div className="flex flex-col items-start overflow-hidden whitespace-nowrap">
                        <span className="text-sm font-medium truncate">{user?.name}</span>
                        <span className="text-xs text-gray-500 truncate">{user?.email}</span>
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start" forceMount>
                  <DropdownMenuItem onClick={() => navigate('/dashboard/admin/profile')}>
                    <User className="mr-2 h-4 w-4" /><span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" /><span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isSidebarOpen && !isMobile && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="hidden md:flex"
                    aria-label="Collapse sidebar"
                >
                    <ChevronLeft className="h-4 w-4 transition-transform" />
                </Button>
            )}
            {!isSidebarOpen && !isMobile && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="hidden md:flex"
                    aria-label="Expand sidebar"
                >
                    <ChevronLeft className="h-4 w-4 transition-transform rotate-180" />
                </Button>
            )}
          </div>

          <nav className="mt-4 flex-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname.startsWith(item.path) ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 p-3",
                  !isSidebarOpen && !isMobile && "md:justify-center md:px-0 md:py-3",
                  !isSidebarOpen && "text-transparent md:text-inherit"
                )}
                onClick={() => navigate(item.path)}
                title={isSidebarOpen ? "" : item.label}
              >
                {item.icon}
                {isSidebarOpen && <span>{item.label}</span>}
              </Button>
            ))}
          </nav>
        </div>
      </aside>

      <main className={cn(
        "flex-1 p-4 md:p-6 transition-all duration-300 ease-in-out",
        "mt-16 md:mt-0",
        isSidebarOpen ? "md:ml-64" : "md:ml-20"
      )}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;

export function AdminDashboardRoutes() {
  return (
    <Routes>
      <Route path="properties/new2" element={<AddProperty2 />} />
    </Routes>
  );
} 