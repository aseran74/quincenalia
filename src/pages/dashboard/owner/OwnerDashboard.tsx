import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  FaHome,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaFileInvoiceDollar,
  FaEnvelope,
  FaUser,
  FaSignOutAlt
} from 'react-icons/fa';
import { Card } from '@/components/ui/card';

export const OwnerInvoices = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Mis Facturas</h1>
      <Card className="p-4">
        <p className="text-gray-600">
          Aquí podrás ver las facturas que el administrador te ha enviado.
          Las facturas son de solo lectura y se actualizan automáticamente.
        </p>
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p className="text-center text-gray-500">No hay facturas disponibles</p>
        </div>
      </Card>
    </div>
  );
};

export const OwnerMessages = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Mensajes</h1>
      <Card className="p-4">
        <p className="text-gray-600">
          Aquí podrás ver los mensajes del administrador.
          Los mensajes son de solo lectura y se actualizan automáticamente.
        </p>
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p className="text-center text-gray-500">No hay mensajes nuevos</p>
        </div>
      </Card>
    </div>
  );
};

const menuItems = [
  {
    icon: <FaHome className="w-5 h-5" />,
    label: 'Inicio',
    path: '/dashboard/owner'
  },
  {
    icon: <FaExclamationTriangle className="w-5 h-5" />,
    label: 'Incidencias',
    path: '/dashboard/owner/incidents'
  },
  {
    icon: <FaCalendarAlt className="w-5 h-5" />,
    label: 'Reservar Semanas',
    path: '/dashboard/owner/reservations'
  },
  {
    icon: <FaFileInvoiceDollar className="w-5 h-5" />,
    label: 'Facturas',
    path: '/dashboard/owner/invoices'
  },
  {
    icon: <FaEnvelope className="w-5 h-5" />,
    label: 'Mensajes',
    path: '/dashboard/owner/messages'
  },
  {
    icon: <FaUser className="w-5 h-5" />,
    label: 'Perfil',
    path: '/dashboard/owner/profile'
  }
];

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800">Panel de Propietario</h2>
          <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
        </div>
        <nav className="mt-6 flex flex-col h-full">
          <div className="flex-1">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="w-full justify-start gap-2 p-4"
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 p-4 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </Button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default OwnerDashboard; 