import React, { useEffect, useState, ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#22c55e', '#ef4444', '#6366f1', '#f59e42'];

interface DashboardProps {
  children?: ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProperties: 0,
    soldProperties: 0,
    reservedProperties: 0,
    paidCommissions: 0,
    totalOwners: 0,
    weeksOccupied: 0,
    totalIncidents: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      // Propiedades
      const { count: totalProperties } = await supabase.from('properties').select('id', { count: 'exact', head: true });
      const { count: soldProperties } = await supabase.from('properties').select('id', { count: 'exact', head: true }).eq('share1_status', 'vendida').eq('share2_status', 'vendida').eq('share3_status', 'vendida').eq('share4_status', 'vendida');
      const { count: reservedProperties } = await supabase.from('properties').select('id', { count: 'exact', head: true }).or('share1_status.eq.reservada,share2_status.eq.reservada,share3_status.eq.reservada,share4_status.eq.reservada');
      // Comisiones pagadas
      const { count: paidCommissions } = await supabase.from('commissions').select('id', { count: 'exact', head: true }).eq('status', 'pagada');
      // Propietarios
      const { count: totalOwners } = await supabase.from('property_owners').select('id', { count: 'exact', head: true });
      // Semanas ocupadas
      const { count: weeksOccupied } = await supabase.from('reservations').select('id', { count: 'exact', head: true });
      // Incidencias
      const { count: totalIncidents } = await supabase.from('incidents').select('id', { count: 'exact', head: true });
      setStats({
        totalProperties: totalProperties || 0,
        soldProperties: soldProperties || 0,
        reservedProperties: reservedProperties || 0,
        paidCommissions: paidCommissions || 0,
        totalOwners: totalOwners || 0,
        weeksOccupied: weeksOccupied || 0,
        totalIncidents: totalIncidents || 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  // Datos para gráficos
  const barData = [
    { name: 'Gestionadas', value: stats.totalProperties },
    { name: 'Vendidas', value: stats.soldProperties },
    { name: 'Reservadas', value: stats.reservedProperties },
  ];
  const pieData = [
    { name: 'Comisiones pagadas', value: stats.paidCommissions },
    { name: 'Incidencias', value: stats.totalIncidents },
    { name: 'Propietarios', value: stats.totalOwners },
    { name: 'Semanas ocupadas', value: stats.weeksOccupied },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          {location.pathname === '/dashboard' ? (
            children || (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-1 sm:px-2 md:px-6">
                {loading ? (
                  <div className="col-span-3 flex justify-center items-center h-64">
                    <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
                  </div>
                ) : (
                  <>
                    <Card className="flex flex-col w-full max-w-sm mx-auto">
                      <CardHeader>Resumen de Propiedades</CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <RechartsTooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    <Card className="flex flex-col w-full max-w-sm mx-auto">
                      <CardHeader>Resumen General</CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={pieData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    <Card className="flex flex-col w-full max-w-sm mx-auto">
                      <CardHeader>Totales</CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          <li><b>Propiedades gestionadas:</b> {stats.totalProperties}</li>
                          <li><b>Propiedades vendidas:</b> {stats.soldProperties}</li>
                          <li><b>Propiedades reservadas:</b> {stats.reservedProperties}</li>
                          <li><b>Comisiones pagadas:</b> {stats.paidCommissions}</li>
                          <li><b>Propietarios:</b> {stats.totalOwners}</li>
                          <li><b>Semanas ocupadas:</b> {stats.weeksOccupied}</li>
                          <li><b>Incidencias:</b> {stats.totalIncidents}</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            )
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
