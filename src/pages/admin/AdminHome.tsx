import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building,
  FileText,
  AlertTriangle,
  MessageSquare,
  DollarSign,
  Plus,
  TrendingUp,
  Calendar,
  ArrowRight,
  Activity,
  Briefcase,
  PhoneCall,
  Sparkles
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const AdminHome = () => {
  const navigate = useNavigate();

  // Estados para los KPIs
  const [ownersCount, setOwnersCount] = useState<number>(0);
  const [propertiesCount, setPropertiesCount] = useState<number>(0);
  const [invoicesCount, setInvoicesCount] = useState<number>(0);
  const [incidentsCount, setIncidentsCount] = useState<number>(0);
  const [messagesCount, setMessagesCount] = useState<number>(0);
  const [commissionsSum, setCommissionsSum] = useState<number>(0);
  const [agenciesCount, setAgenciesCount] = useState<number>(0);
  const [agentsCount, setAgentsCount] = useState<number>(0);
  const [reservationsCount, setReservationsCount] = useState<number>(0);
  const [contactRequestsCount, setContactRequestsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Propietarios con copropiedad asignada
        const { data: propertiesData } = await supabase
          .from('properties')
          .select('share1_owner_id, share2_owner_id, share3_owner_id, share4_owner_id');
        
        if (propertiesData && Array.isArray(propertiesData)) {
          const ownerIds = new Set();
          propertiesData.forEach((row) => {
            ['share1_owner_id', 'share2_owner_id', 'share3_owner_id', 'share4_owner_id'].forEach((field) => {
              if (row[field]) ownerIds.add(row[field]);
            });
          });
          setOwnersCount(ownerIds.size);
        }

        // Propiedades
        const { count: propsCount } = await supabase
          .from('properties')
          .select('id', { count: 'exact', head: true });
        setPropertiesCount(propsCount || 0);

        // Facturas
        const { count: invCount } = await supabase
          .from('invoices')
          .select('id', { count: 'exact', head: true });
        setInvoicesCount(invCount || 0);

        // Incidencias
        const { count: incCount } = await supabase
          .from('incidents')
          .select('id', { count: 'exact', head: true });
        setIncidentsCount(incCount || 0);

        // Mensajes
        const { count: msgCount } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true });
        setMessagesCount(msgCount || 0);

        // Comisiones (suma total)
        const { data: commissionsData } = await supabase
          .from('commissions')
          .select('amount');
        if (commissionsData && Array.isArray(commissionsData)) {
          const sum = commissionsData.reduce((acc, curr) => acc + (curr.amount || 0), 0);
          setCommissionsSum(sum);
        }

        // Agencias
        const { count: agenciesCount } = await supabase
          .from('real_estate_agencies')
          .select('id', { count: 'exact', head: true });
        setAgenciesCount(agenciesCount || 0);

        // Agentes
        const { count: agentsCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'agent');
        setAgentsCount(agentsCount || 0);

        // Reservas
        const { count: resCount } = await supabase
          .from('reservations')
          .select('id', { count: 'exact', head: true });
        setReservationsCount(resCount || 0);

        // Solicitudes de contacto
        const { count: contactCount } = await supabase
          .from('contact_requests')
          .select('id', { count: 'exact', head: true });
        setContactRequestsCount(contactCount || 0);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      title: "Propietarios",
      value: ownersCount,
      icon: Users,
      path: "/dashboard/admin/owners",
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      description: "Usuarios registrados"
    },
    {
      title: "Propiedades",
      value: propertiesCount,
      icon: Building,
      path: "/dashboard/admin/properties",
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-100",
      description: "Viviendas gestionadas"
    },
    {
      title: "Agencias",
      value: agenciesCount,
      icon: Briefcase,
      path: "/dashboard/admin/agencies",
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      description: "Agencias inmobiliarias"
    },
    {
      title: "Agentes",
      value: agentsCount,
      icon: Users,
      path: "/dashboard/admin/agents",
      gradient: "from-cyan-500 to-cyan-600",
      bgGradient: "from-cyan-50 to-cyan-100",
      description: "Agentes activos"
    },
    {
      title: "Reservas",
      value: reservationsCount,
      icon: Calendar,
      path: "/dashboard/admin/reservations",
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      description: "Reservas activas"
    },
    {
      title: "Facturas",
      value: invoicesCount,
      icon: FileText,
      path: "/dashboard/admin/invoices",
      gradient: "from-yellow-500 to-amber-600",
      bgGradient: "from-yellow-50 to-amber-100",
      description: "Facturas emitidas"
    },
    {
      title: "Incidencias",
      value: incidentsCount,
      icon: AlertTriangle,
      path: "/dashboard/admin/incidents",
      gradient: "from-red-500 to-red-600",
      bgGradient: "from-red-50 to-red-100",
      description: "Incidencias pendientes",
      urgent: incidentsCount > 0
    },
    {
      title: "Mensajes",
      value: messagesCount,
      icon: MessageSquare,
      path: "/dashboard/admin/messages",
      gradient: "from-pink-500 to-pink-600",
      bgGradient: "from-pink-50 to-pink-100",
      description: "Mensajes sin leer"
    },
    {
      title: "Comisiones",
      value: commissionsSum.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }),
      icon: DollarSign,
      path: "/dashboard/admin/commissions",
      gradient: "from-indigo-500 to-indigo-600",
      bgGradient: "from-indigo-50 to-indigo-100",
      description: "Total acumulado"
    },
    {
      title: "Solicitudes",
      value: contactRequestsCount,
      icon: PhoneCall,
      path: "/dashboard/admin/contact-requests",
      gradient: "from-teal-500 to-teal-600",
      bgGradient: "from-teal-50 to-teal-100",
      description: "Solicitudes de contacto"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const quickActions = [
    { title: "Añadir Propietario", path: "/dashboard/admin/owners/new", icon: Users, color: "bg-blue-500 hover:bg-blue-600" },
    { title: "Añadir Propiedad", path: "/dashboard/admin/properties/new", icon: Building, color: "bg-green-500 hover:bg-green-600" },
    { title: "Añadir Agencia", path: "/dashboard/admin/agencies/new", icon: Briefcase, color: "bg-purple-500 hover:bg-purple-600" },
    { title: "Añadir Agente", path: "/dashboard/admin/agents/new", icon: Users, color: "bg-cyan-500 hover:bg-cyan-600" }
  ];

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header con Bienvenida */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Panel de Administración</h1>
          </div>
          <p className="text-gray-600">Gestiona y supervisa toda la plataforma desde aquí</p>
        </div>
        <Badge variant="outline" className="w-fit px-4 py-2 text-sm">
          <Activity className="h-4 w-4 mr-2" />
          Sistema Activo
        </Badge>
      </div>

      {/* Grid de estadísticas mejorado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className={cn(
                "group cursor-pointer border-2 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl overflow-hidden",
                stat.urgent ? "border-red-200 hover:border-red-300" : "border-transparent hover:border-gray-200"
              )}
              onClick={() => navigate(stat.path)}
            >
              <div className={cn("h-2 bg-gradient-to-r", stat.gradient)} />
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "p-3 rounded-xl bg-gradient-to-br",
                    stat.gradient,
                    "shadow-lg group-hover:scale-110 transition-transform duration-300"
                  )}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  {stat.urgent && (
                    <Badge variant="destructive" className="animate-pulse">
                      Urgente
                    </Badge>
                  )}
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {stat.value}
                  </div>
                  <CardTitle className="text-base font-semibold text-gray-700 mb-1">
                    {stat.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    {stat.description}
                  </CardDescription>
                </div>
                <div className="mt-4 flex items-center text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver detalles
                  <ArrowRight className="h-3 w-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Acciones Rápidas Mejoradas */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Acciones Rápidas</CardTitle>
              <CardDescription>Gestiona el contenido de la plataforma</CardDescription>
            </div>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.title}
                  variant="outline"
                  className={cn(
                    "h-auto py-6 flex flex-col items-center gap-3 border-2 hover:border-blue-300 transition-all duration-300 group",
                    "hover:shadow-lg hover:-translate-y-1"
                  )}
                  onClick={() => navigate(action.path)}
                >
                  <div className={cn(
                    "rounded-xl p-3 text-white transition-transform duration-300 group-hover:scale-110",
                    action.color
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium text-center leading-tight">{action.title}</span>
                  <Plus className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Sección de Resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Resumen General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Total de Usuarios</span>
              <span className="text-lg font-bold text-blue-600">{ownersCount + agentsCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Propiedades Activas</span>
              <span className="text-lg font-bold text-green-600">{propertiesCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Agencias Registradas</span>
              <span className="text-lg font-bold text-purple-600">{agenciesCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Reservas Totales</span>
              <span className="text-lg font-bold text-orange-600">{reservationsCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Finanzas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="text-sm text-gray-600 mb-1">Comisiones Totales</div>
              <div className="text-2xl font-bold text-green-700">
                {commissionsSum.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <div className="text-sm text-gray-600 mb-1">Facturas Emitidas</div>
              <div className="text-2xl font-bold text-blue-700">{invoicesCount}</div>
            </div>
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
              <div className="text-sm text-gray-600 mb-1">Solicitudes Pendientes</div>
              <div className="text-2xl font-bold text-yellow-700">{contactRequestsCount}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHome; 