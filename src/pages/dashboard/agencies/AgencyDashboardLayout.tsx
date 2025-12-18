import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  HiOutlineBuildingOffice2,
  HiOutlineUsers,
  HiOutlineHome,
  HiOutlineChatBubbleLeftRight,
} from 'react-icons/hi2';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, User, LogOut } from 'lucide-react';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  agencyId?: string | null;
}

const SidebarLink = ({ to, icon, children, agencyId, onNavigate }: SidebarLinkProps & { onNavigate?: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <Link
      to={agencyId ? to.replace(':agencyId', agencyId) : to}
      onClick={onNavigate}
      className={cn(
        'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
        isActive
          ? 'bg-white/15 text-white font-semibold'
          : 'text-white/80 hover:bg-white/10 hover:text-white'
      )}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
};

const AgencyDashboardLayout = ({ children }: { children?: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetchAgencyId();
  }, [user]);

  useEffect(() => {
    const checkMobile = () => window.innerWidth < 1024;
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

  const fetchAgencyId = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('agency_id')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setAgencyId(profile?.agency_id || null);
    } catch (error) {
      console.error('Error fetching agency_id:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F2F3F4]">
      {/* Overlay para móvil */}
      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col overflow-y-auto bg-black text-white border-r border-white/10 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isSidebarOpen ? 'w-64' : 'w-0 lg:w-64'
        )}
      >
        <div className="flex flex-col h-full p-4">
          {/* Header del Sidebar */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white">Dashboard Agencia</h2>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={closeSidebar}
                className="lg:hidden text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Navegación */}
          <nav className="flex-1 space-y-2">
            <SidebarLink
              to="/dashboard/agencies"
              icon={<HiOutlineBuildingOffice2 className="h-5 w-5" />}
              onNavigate={closeSidebar}
            >
              Inicio
            </SidebarLink>
            
            {agencyId && (
              <>
                <SidebarLink
                  to={`/dashboard/agencies/${agencyId}/agents`}
                  icon={<HiOutlineUsers className="h-5 w-5" />}
                  onNavigate={closeSidebar}
                >
                  Mis Agentes
                </SidebarLink>
                
                <SidebarLink
                  to={`/dashboard/agencies/${agencyId}/messages`}
                  icon={<HiOutlineChatBubbleLeftRight className="h-5 w-5" />}
                  onNavigate={closeSidebar}
                >
                  Mensajes a Agentes
                </SidebarLink>
              </>
            )}
            
            <SidebarLink
              to="/dashboard/agencies/properties"
              icon={<HiOutlineHome className="h-5 w-5" />}
              onNavigate={closeSidebar}
            >
              Mis Viviendas
            </SidebarLink>
          </nav>

          {/* User Profile en Sidebar */}
          <div className="mt-auto pt-4 border-t border-white/10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-white hover:bg-white/10"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImage} alt={user?.name} />
                    <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="text-sm font-medium truncate">{user?.name}</span>
                    <span className="text-xs text-white/70 truncate">{user?.email}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem onClick={() => navigate('/dashboard/agencies/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden bg-[#F2F3F4]">
        {/* Header */}
        <header className="sticky top-0 z-40 flex w-full bg-black text-white border-b border-white/10 shadow-sm">
          <div className="flex flex-grow items-center justify-between px-4 py-4 md:px-6">
            <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="lg:hidden text-white hover:bg-white/10"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            {/* User Menu en Header - Visible en desktop cuando sidebar está cerrado o siempre en móvil */}
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-white hover:bg-white/10"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImage} alt={user?.name} />
                      <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium text-white">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem onClick={() => navigate('/dashboard/agencies/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-[#F2F3F4]">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AgencyDashboardLayout;


