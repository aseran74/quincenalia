import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Home, Building, Users, Mail, FileText, Calendar, AlertTriangle, User, UserPlus } from 'lucide-react';

interface SidebarItem {
  icon: React.ReactNode;
  title: string;
  href: string;
  roles: string[];
}

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const sidebarItems: SidebarItem[] = [
    { 
      icon: <Home className="h-5 w-5" />, 
      title: 'Propiedades', 
      href: '/dashboard',
      roles: ['admin', 'agency', 'agent', 'owner', 'interested']
    },
    {
      icon: <UserPlus className="h-5 w-5" />,
      title: 'Propietarios',
      href: '/admin/owners',
      roles: ['admin']
    },
    { 
      icon: <Building className="h-5 w-5" />, 
      title: 'Agencias', 
      href: '/dashboard/agencies',
      roles: ['admin', 'agency']
    },
    { 
      icon: <Users className="h-5 w-5" />, 
      title: 'Agentes', 
      href: '/dashboard/agents',
      roles: ['admin', 'agency']
    },
    { 
      icon: <Calendar className="h-5 w-5" />, 
      title: 'Citas', 
      href: '/dashboard/appointments',
      roles: ['admin', 'agent', 'interested']
    },
    { 
      icon: <Mail className="h-5 w-5" />, 
      title: 'Mensajes', 
      href: '/dashboard/messages',
      roles: ['admin', 'agency', 'agent', 'owner', 'interested']
    },
    { 
      icon: <FileText className="h-5 w-5" />, 
      title: 'Facturas', 
      href: '/dashboard/invoices',
      roles: ['admin', 'owner']
    },
    { 
      icon: <AlertTriangle className="h-5 w-5" />, 
      title: 'Incidencias', 
      href: '/dashboard/incidents',
      roles: ['admin', 'owner']
    },
    { 
      icon: <User className="h-5 w-5" />, 
      title: 'Perfil', 
      href: '/dashboard/profile',
      roles: ['admin', 'agency', 'agent', 'owner', 'interested']
    },
  ];

  const filteredItems = sidebarItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-blue-900 text-white h-[calc(100vh-4rem)] shrink-0 hidden md:block">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Menú</h2>
        <nav className="space-y-1">
          {filteredItems.map((item) => (
            <Link key={item.href} to={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-white hover:bg-blue-800 hover:text-white",
                  location.pathname === item.href && "bg-blue-800"
                )}
              >
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </Button>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
