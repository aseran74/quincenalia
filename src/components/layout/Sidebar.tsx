import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Home, Building, Users, Mail, FileText, Calendar, AlertTriangle, User, UserPlus, LogOut, ChevronLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, isMobile }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: 'Panel de Control',
      path: '/dashboard',
      roles: ['admin', 'agency', 'agent', 'owner', 'interested']
    },
    {
      icon: <Building className="h-5 w-5" />,
      label: 'Propiedades',
      path: '/dashboard/properties',
      roles: ['admin', 'agency', 'agent', 'owner', 'interested']
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: 'Reservas',
      path: '/dashboard/properties/reservas',
      roles: ['admin', 'agency']
    },
    {
      icon: <Building className="h-5 w-5" />,
      label: 'Agencias',
      path: '/dashboard/agencies',
      roles: ['admin', 'agency']
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Agentes',
      path: '/dashboard/agents',
      roles: ['admin', 'agency']
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: 'Citas',
      path: '/dashboard/appointments',
      roles: ['admin', 'agent', 'interested']
    },
    {
      icon: <Mail className="h-5 w-5" />,
      label: 'Mensajes',
      path: '/dashboard/messages',
      roles: ['admin', 'agency', 'agent', 'owner', 'interested']
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: 'Facturas',
      path: '/dashboard/invoices',
      roles: ['admin', 'owner']
    },
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      label: 'Incidencias',
      path: '/dashboard/incidents',
      roles: ['admin', 'owner']
    }
  ];

  const filteredItems = menuItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <aside className={cn(
      "fixed top-0 left-0 z-40 h-screen bg-white shadow-md transition-transform duration-300 ease-in-out",
      isOpen ? "translate-x-0" : "-translate-x-full",
      "md:relative md:translate-x-0",
      isOpen ? "w-64" : "w-0 md:w-20"
    )}>
      <div className={cn(
        "flex flex-col h-full",
        !isOpen && !isMobile && "md:items-center",
        !isOpen && isMobile && "overflow-hidden"
      )}>
        {/* Header con Avatar y Toggle */}
        <div className="flex items-center justify-between p-4 border-b">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn(
                "relative h-10 rounded-lg hover:bg-gray-100 flex items-center gap-2 px-2 w-full justify-start",
                !isOpen && "md:w-12 md:justify-center md:px-0"
              )}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImage} alt={user?.name} />
                  <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                {isOpen && (
                  <div className="flex flex-col items-start overflow-hidden whitespace-nowrap">
                    <span className="text-sm font-medium truncate">{user?.name}</span>
                    <span className="text-xs text-gray-500 truncate">{user?.email}</span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start" forceMount>
              <DropdownMenuItem onClick={() => {}}>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Botón Toggle para Desktop */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:flex"
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-transform",
              !isOpen && "rotate-180"
            )} />
          </Button>
        </div>

        {/* Navegación */}
        <nav className="mt-4 flex-1 overflow-y-auto">
          {filteredItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={location.pathname.startsWith(item.path) ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 p-3",
                  !isOpen && "md:justify-center md:px-0 md:py-3",
                  location.pathname.startsWith(item.path) ? "font-semibold" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
                title={isOpen ? "" : item.label}
              >
                {item.icon}
                {isOpen && <span>{item.label}</span>}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
