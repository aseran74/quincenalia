import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building,
  FileText,
  AlertTriangle,
  MessageSquare,
  DollarSign,
  Plus
} from 'lucide-react';

const AdminHome = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Propietarios",
      value: "24",
      icon: <Users className="h-8 w-8" />,
      path: "/dashboard/admin/owners",
      color: "bg-blue-500"
    },
    {
      title: "Propiedades",
      value: "12",
      icon: <Building className="h-8 w-8" />,
      path: "/dashboard/admin/properties",
      color: "bg-green-500"
    },
    {
      title: "Facturas",
      value: "8",
      icon: <FileText className="h-8 w-8" />,
      path: "/dashboard/admin/invoices",
      color: "bg-yellow-500"
    },
    {
      title: "Incidencias",
      value: "5",
      icon: <AlertTriangle className="h-8 w-8" />,
      path: "/dashboard/admin/incidents",
      color: "bg-red-500"
    },
    {
      title: "Mensajes",
      value: "3",
      icon: <MessageSquare className="h-8 w-8" />,
      path: "/dashboard/admin/messages",
      color: "bg-purple-500"
    },
    {
      title: "Comisiones",
      value: "€2,450",
      icon: <DollarSign className="h-8 w-8" />,
      path: "/dashboard/admin/commissions",
      color: "bg-indigo-500"
    }
  ];

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Panel de Administración</h1>
      
      {/* Grid de estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card 
            key={stat.title}
            className="group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => navigate(stat.path)}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`p-4 rounded-full ${stat.color} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300`}>
                  <div className={`${stat.color} text-white rounded-full p-3`}>
                    {stat.icon}
                  </div>
                </div>
                <div>
                  <CardTitle className="text-xl font-bold mb-2">{stat.value}</CardTitle>
                  <p className="text-gray-600 font-medium">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Acciones Rápidas */}
      <h2 className="text-xl font-bold mt-8 mb-4">Acciones Rápidas</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: "Añadir Propietario", path: "/dashboard/admin/owners/new", icon: <Users className="h-5 w-5" /> },
          { title: "Añadir Propiedad", path: "/dashboard/admin/properties/new", icon: <Building className="h-5 w-5" /> },
          { title: "Añadir Agencia", path: "/dashboard/admin/agencies/new", icon: <Building className="h-5 w-5" /> },
          { title: "Añadir Agente", path: "/dashboard/admin/agents/new", icon: <Users className="h-5 w-5" /> }
        ].map((action) => (
          <Button
            key={action.title}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-gray-50"
            onClick={() => navigate(action.path)}
          >
            <div className="rounded-full bg-gray-100 p-2">
              {action.icon}
            </div>
            <span className="text-sm text-center">{action.title}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AdminHome; 