import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, FileText, DollarSign, User, LogOut, Menu, X as XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const agentMenu = [
  { label: 'Solicitudes de contacto', icon: <MessageSquare className="w-5 h-5" />, path: '/dashboard/agents' },
  { label: 'ERP', icon: <FileText className="w-5 h-5" />, path: '/dashboard/agents/erp' },
  { label: 'Comisiones', icon: <DollarSign className="w-5 h-5" />, path: '/dashboard/agents/comisiones' },
  { label: 'Perfil', icon: <User className="w-5 h-5" />, path: '/dashboard/agents/profile' },
];

export default function AgentDashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Botón hamburguesa solo en móvil */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu className="h-6 w-6" />
      </Button>
      {/* Overlay y sidebar en móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-white border-r flex flex-col py-6 px-4 w-64 transition-transform duration-300 md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Botón cerrar en móvil */}
        <div className="flex justify-end md:hidden mb-2">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú">
            <XIcon className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex flex-col items-center mb-8">
          <Avatar className="h-16 w-16 mb-2">
            <AvatarImage src={user?.profileImage} alt={user?.name} />
            <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="font-semibold text-lg text-center break-words">{user?.name}</div>
          <div className="text-xs text-gray-500 text-center break-words">{user?.email}</div>
        </div>
        <nav className="flex-1 space-y-1">
          {agentMenu.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors',
                location.pathname === item.path
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <Button
          variant="ghost"
          className="mt-8 flex items-center gap-2 text-red-600 justify-center"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </Button>
      </aside>
      {/* Contenido principal */}
      <main className="flex-1 p-2 sm:p-4 md:p-6 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
} 