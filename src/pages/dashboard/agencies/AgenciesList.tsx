import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Pencil, Trash2, LayoutGrid, List } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface RealEstateAgency {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo_url?: string;
}

interface AgenciesListProps {
  adminMode?: boolean;
}

const AgenciesList = ({ adminMode = false }: AgenciesListProps) => {
  const [agencies, setAgencies] = useState<RealEstateAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const { user } = useAuth();
  const [agentsCount, setAgentsCount] = useState<{ [agencyId: string]: number }>({});

  const basePath = adminMode ? '/dashboard/admin/agencies' : '/dashboard/agencies';

  useEffect(() => {
    fetchAgencies();
    fetchAgentsCount();
  }, []);

  const fetchAgencies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('real_estate_agencies')
      .select('*')
      .order('name');

    if (error) {
      console.error("Error fetching agencies:", error);
      toast({ title: 'Error', description: 'No se pudieron cargar las agencias.', variant: 'destructive' });
      setAgencies([]);
    } else {
      setAgencies(data || []);
    }
    setLoading(false);
  };

  const fetchAgentsCount = async () => {
      try {
          const { data: detailedData, error: detailedError } = await supabase
              .from('agency_agents')
              .select('agency_id');

          if (detailedError) throw detailedError;

          if (detailedData) {
              const countMap: { [agencyId: string]: number } = {};
              detailedData.forEach((row: any) => {
                  countMap[row.agency_id] = (countMap[row.agency_id] || 0) + 1;
              });
              setAgentsCount(countMap);
          }
      } catch (error: any) {
          console.error("Error fetching agents count:", error);
      }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta agencia? Esta acción no se puede deshacer.')) return;
    try {
      const { error } = await supabase
        .from('real_estate_agencies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAgencies(prevAgencies => prevAgencies.filter(a => a.id !== id));
      toast({ title: 'Éxito', description: 'Agencia eliminada correctamente.' });

    } catch (error: any) {
      console.error("Error deleting agency:", error);
      toast({
        title: 'Error',
        description: `No se pudo eliminar la agencia. ${error.message || ''}`,
        variant: 'destructive'
      });
    }
  };

  if (user?.role === 'admin' && !adminMode) {
    return <Navigate to="/dashboard/admin/agencies" replace />;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 font-poppins">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Agencias
          {adminMode && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs align-middle">Admin</span>}
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="flex gap-2">
             <Button
               variant={view === 'grid' ? 'default' : 'outline'}
               size="sm"
               onClick={() => setView('grid')}
               aria-label="Vista de cuadrícula"
             >
               <LayoutGrid className="h-4 w-4 mr-2 sm:mr-0 md:mr-2" />
               <span className="hidden sm:inline md:inline">Grid</span>
             </Button>
             <Button
               variant={view === 'table' ? 'default' : 'outline'}
               size="sm"
               onClick={() => setView('table')}
               aria-label="Vista de tabla"
             >
               <List className="h-4 w-4 mr-2 sm:mr-0 md:mr-2" />
               <span className="hidden sm:inline md:inline">Tabla</span>
             </Button>
          </div>
          { (adminMode || user?.role === 'admin') && (
             <Link to={`${basePath}/new`} className="w-full sm:w-auto">
               <Button className="w-full sm:w-auto">Nueva Agencia</Button>
             </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando agencias...</div>
      ) : agencies.length === 0 ? (
        <Card className="text-center shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-300">No hay agencias</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Parece que aún no se ha registrado ninguna agencia.
            </p>
            { (adminMode || user?.role === 'admin') && (
              <Link to={`${basePath}/new`}>
                <Button>Crear la Primera Agencia</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 font-poppins">
          {agencies.map((agency) => (
            <Card key={agency.id} className="flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden group transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between p-4 space-y-0">
                <div className="flex items-center gap-3">
                  {agency.logo_url ? (
                    <img src={agency.logo_url} alt={`Logo de ${agency.name}`} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                      <span className="text-gray-400 text-2xl">🏢</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                     <Link to={`${basePath}/${agency.id}`} className="hover:underline">
                        <CardTitle className="text-base font-semibold text-gray-900 dark:text-white truncate">{agency.name}</CardTitle>
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{agency.email}</p>
                  </div>
                </div>
                 { (adminMode || user?.role === 'admin') && (
                    <div className="flex flex-col sm:flex-row gap-1 items-end pt-1">
                        <Link to={`${basePath}/${agency.id}/edit`}>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400" aria-label="Editar agencia">
                                <Pencil size={16} />
                            </Button>
                        </Link>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-red-600 dark:hover:text-red-500" onClick={() => handleDelete(agency.id)} aria-label="Eliminar agencia">
                            <Trash2 size={16} />
                        </Button>
                    </div>
                 )}
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">{agency.description || 'Sin descripción.'}</p>
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                    <p className="truncate">Tel: {agency.phone || 'N/A'}</p>
                    {agency.website && <a href={agency.website.startsWith('http') ? agency.website : `https://${agency.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block">Web</a>}
                    <p>Agentes: {agentsCount[agency.id] || 0}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 font-poppins">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Teléfono</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Agentes</th>
                { (adminMode || user?.role === 'admin') && (
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {agencies.map((agency) => (
                <tr key={agency.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link to={`${basePath}/${agency.id}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                      {agency.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{agency.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{agency.phone}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">{agentsCount[agency.id] || 0}</td>
                  { (adminMode || user?.role === 'admin') && (
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                      <Link to={`${basePath}/${agency.id}/edit`} aria-label="Editar agencia">
                        <Button size="sm" variant="ghost" className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400">
                          <Pencil size={16} />
                        </Button>
                      </Link>
                      <Button size="sm" variant="ghost" className="text-gray-500 hover:text-red-600 dark:hover:text-red-500" onClick={() => handleDelete(agency.id)} aria-label="Eliminar agencia">
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AgenciesList; 