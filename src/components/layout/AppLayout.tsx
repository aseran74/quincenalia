import React, { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Navigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, requireAuth = true }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!requireAuth && isAuthenticated && user) {
    // Redirección específica según el rol
    switch (user.role) {
      case 'owner':
        return <Navigate to="/dashboard/owner" />;
      case 'admin':
        return <Navigate to="/dashboard/admin/agencies" />;
      case 'agency':
        return <Navigate to="/dashboard/agencies" />;
      case 'agent':
        return <Navigate to="/dashboard/agents" />;
      default:
        return <Navigate to="/dashboard" />;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex flex-1">
        {/* Botón Toggle para Móvil */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "fixed top-4 left-4 z-50 md:hidden transition-all duration-300 ease-in-out",
            isSidebarOpen && "left-[calc(256px+1rem)]"
          )}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {isAuthenticated && (
          <Sidebar 
            isOpen={isSidebarOpen} 
            setIsOpen={setIsSidebarOpen}
            isMobile={isMobile}
          />
        )}
        
        <main className={cn(
          "flex-1 p-4 md:p-6 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "md:ml-64" : "md:ml-20",
          "mt-16 md:mt-0"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
