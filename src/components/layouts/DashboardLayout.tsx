import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  HiOutlineBuildingOffice2,
  HiOutlineUsers,
  HiOutlineClipboardDocument,
  HiOutlineCalendarDays,
} from 'react-icons/hi2';
import { useAuth } from '@/context/AuthContext';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SidebarLink = ({ to, icon, children }: SidebarLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={cn(
        'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
        isActive
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100'
      )}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 px-4 mb-2">Dashboard</h2>
          </div>
          <nav className="space-y-4">
            <div className="space-y-1">
              <SidebarLink
                to={user?.role === 'admin' ? '/dashboard/admin/agencies' : '/dashboard/agencies'}
                icon={<HiOutlineBuildingOffice2 className="h-5 w-5" />}
              >
                Listado de Agencias
              </SidebarLink>
              <SidebarLink
                to="/dashboard/agencies/new"
                icon={<HiOutlineClipboardDocument className="h-5 w-5" />}
              >
                Crear Agencia
              </SidebarLink>
              <SidebarLink
                to={user?.role === 'admin' ? '/dashboard/admin/agents' : '/dashboard/agents'}
                icon={<HiOutlineUsers className="h-5 w-5" />}
              >
                Agentes Inmobiliarios
              </SidebarLink>
              <SidebarLink
                to="/dashboard/agents/new"
                icon={<HiOutlineClipboardDocument className="h-5 w-5" />}
              >
                Crear Agente
              </SidebarLink>
              <SidebarLink
                to={user?.role === 'admin' ? '/dashboard/admin/reservations' : '/dashboard/reservations'}
                icon={<HiOutlineCalendarDays className="h-5 w-5" />}
              >
                Reservas
              </SidebarLink>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 