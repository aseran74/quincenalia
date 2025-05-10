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
      "fixed top-0 left-0 z-40 h-screen bg-white shadow-md transition-transform duration-300 ease-in-out min-w-[64px]",
      isOpen ? "translate-x-0" : "-translate-x-full",
      // On md screens and up, the sidebar is relative and visible based on width,
      // so we remove the mobile transform that hides it.
      "md:relative md:translate-x-0",
      // Set the width dynamically based on isOpen state
      isOpen ? "w-64" : "w-16"
    )}>
      <div className={cn(
        "flex flex-col h-full relative", // relative is not strictly needed here as the button is absolute within <aside> which is relative on md+
        !isOpen && !isMobile && "md:items-center",
        !isOpen && isMobile && "overflow-hidden" // Keep overflow hidden for collapsed mobile view
      )}>
        {/* Botón de colapsar/expandir */}
        <div className={cn(
          "fixed top-1/2 -translate-y-1/2 z-50 flex items-center pointer-events-auto transition-all duration-300",
          isOpen ? "left-64" : "left-16"
        )}>
          <button
            className="bg-gray-100 hover:bg-gray-200 rounded-full p-1 border border-gray-300 transition shadow"
            onClick={() => setIsOpen(!isOpen)}
            title={isOpen ? 'Colapsar menú' : 'Expandir menú'}
            // style={{ outline: 'none' }} // Recommended to use Tailwind's focus classes instead of inline style
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", !isOpen && "rotate-180")}/>
          </button>
        </div>

        {/* Header con Avatar y Info de Usuario (solo visible cuando abierto en desktop) */}
        {!isMobile && (
          <div className="flex items-center gap-4 p-4 border-b">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profileImage} alt={user?.name} />
              <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            {/* Only show text info when sidebar is open */}
            {isOpen && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate">{user?.name}</span>
                <span className="text-xs text-gray-500 truncate">{user?.email}</span>
              </div>
            )}
          </div>
        )}

        {/* Navegación */}
        <nav className="mt-4 flex-1 overflow-y-auto">
          {filteredItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={location.pathname.startsWith(item.path) ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 p-3",
                  // Center icon and remove text padding when collapsed on md+
                  !isOpen && !isMobile && "md:justify-center md:px-0 md:py-3",
                  // Handle padding when collapsed on mobile (full height)
                  !isOpen && isMobile && "justify-center px-0 py-3",
                  location.pathname.startsWith(item.path) ? "font-semibold" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
                title={!isOpen ? item.label : ""} // Show full label as title when collapsed
              >
                {item.icon}
                {isOpen && <span>{item.label}</span>}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Assuming you might have a persistent user/logout section at the bottom */}
        {/* You would adapt this similarly, showing minimal info/icon when collapsed */}
        {/* Example:
        <div className={cn("mt-auto p-4 border-t", !isOpen && !isMobile && "md:p-2")}>
           ... user avatar/icon and maybe dropdown or logout button ...
        </div>
        */}

      </div>
    </aside>
  );
};

export default Sidebar;