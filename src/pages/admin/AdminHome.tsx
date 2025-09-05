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
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AdminHome = () => {
  const navigate = useNavigate();

  // Estados para los KPIs
  const [ownersCount, setOwnersCount] = useState<number>(0);
  const [propertiesCount, setPropertiesCount] = useState<number>(0);
  const [invoicesCount, setInvoicesCount] = useState<number>(0);
  const [incidentsCount, setIncidentsCount] = useState<number>(0);
  const [messagesCount, setMessagesCount] = useState<number>(0);
  const [commissionsSum, setCommissionsSum] = useState<number>(0);

  useEffect(() => {
    // Propietarios con copropiedad asignada (IDs únicos en los campos shareX_owner_id)
    supabase
      .from('properties')
      .select('share1_owner_id, share2_owner_id, share3_owner_id, share4_owner_id')
      .then(({ data }) => {
        if (data && Array.isArray(data)) {
          const ownerIds = new Set();
          data.forEach((row) => {
            ['share1_owner_id', 'share2_owner_id', 'share3_owner_id', 'share4_owner_id'].forEach((field) => {
              if (row[field]) ownerIds.add(row[field]);
            });
          });
          setOwnersCount(ownerIds.size);
        } else {
          setOwnersCount(0);
        }
      });
    // Propiedades
    supabase.from('properties').select('id', { count: 'exact', head: true }).then(({ count }) => setPropertiesCount(count || 0));
    // Facturas
    supabase.from('invoices').select('id', { count: 'exact', head: true }).then(({ count }) => setInvoicesCount(count || 0));
    // Incidencias
    supabase.from('incidents').select('id', { count: 'exact', head: true }).then(({ count }) => setIncidentsCount(count || 0));
    // Mensajes
    supabase.from('messages').select('id', { count: 'exact', head: true }).then(({ count }) => setMessagesCount(count || 0));
    // Comisiones (suma total)
    supabase.from('commissions').select('amount').then(({ data }) => {
      if (data && Array.isArray(data)) {
        const sum = data.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        setCommissionsSum(sum);
      } else {
        setCommissionsSum(0);
      }
    });
  }, []);

  const stats = [
    {
      title: "Propietarios",
      value: ownersCount,
      icon: <Users className="h-8 w-8" />,
      path: "/dashboard/admin/owners",
      color: "bg-blue-500"
    },
    {
      title: "Propiedades",
      value: propertiesCount,
      icon: <Building className="h-8 w-8" />,
      path: "/dashboard/admin/properties",
      color: "bg-green-500"
    },
    {
      title: "Facturas",
      value: invoicesCount,
      icon: <FileText className="h-8 w-8" />,
      path: "/dashboard/admin/invoices",
      color: "bg-yellow-500"
    },
    {
      title: "Incidencias",
      value: incidentsCount,
      icon: <AlertTriangle className="h-8 w-8" />,
      path: "/dashboard/admin/incidents",
      color: "bg-red-500"
    },
    {
      title: "Mensajes",
      value: messagesCount,
      icon: <MessageSquare className="h-8 w-8" />,
      path: "/dashboard/admin/messages",
      color: "bg-purple-500"
    },
    {
      title: "Comisiones",
      value: commissionsSum.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }),
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