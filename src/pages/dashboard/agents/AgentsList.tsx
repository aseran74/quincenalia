import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Importar lo necesario
import { Link, Navigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Pencil, Trash2, LayoutGrid, List, UserPlus } from 'lucide-react'; // Iconos de Lucide
import { useAuth } from '@/context/AuthContext';
import { HiOutlineUserCircle } from 'react-icons/hi2'; // Placeholder
import { cn } from '@/lib/utils'; // Utilidad para clases condicionales

// Interfaz (Asegúrate que coincida con tu tabla 'profiles')
interface AgentProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_image?: string;
  // Añade otros campos si existen y los necesitas (e.g., role, bio, etc.)
}

interface AgentsListProps {
  adminMode?: boolean; // Si necesitas diferenciar vistas/acciones para admin
}

// Clave de servicio para borrar en Auth
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbmVpdXB2enNxenlydXJjZ21vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTU3OTcyNSwiZXhwIjoyMDYxMTU1NzI1fQ.Qw4fMANMvO9ndKvfi4r6xcCQ0yrIZOXyzlNQIYPVIj0';
const SUPABASE_PROJECT_ID = 'vpneiupvzsqzyrurcgmo';

const AgentsList = ({ adminMode = false }: AgentsListProps) => {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const { user } = useAuth(); // Para condicionales de admin

  // Ajusta basePath según tu estructura de rutas
  const basePath = adminMode ? '/dashboard/admin/agents' : '/dashboard/agents';

  useEffect(() => {
    fetchAgents();
  }, []); // Fetch solo al montar

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles') // Tabla de donde se obtienen los agentes
        .select('id, first_name, last_name, email, phone, profile_image') // Campos a seleccionar
        .eq('role', 'agent') // Filtrar por rol si existe en la tabla 'profiles'
        .order('first_name'); // Ordenar

      if (error) throw error; // Lanzar error de Supabase

      setAgents(data || []);

    } catch (error: any) {
      console.error("Error fetching agents:", error);
      toast({
        title: 'Error',
        description: `No se pudieron cargar los agentes: ${error.message || 'Error desconocido'}`,
        variant: 'destructive'
      });
      setAgents([]); // Limpiar agentes en caso de error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este agente? Esta acción no se puede deshacer.')) return;
    try {
      // 1. Eliminar de la tabla 'profiles'
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      if (error) throw error;

      // 2. Eliminar de Supabase Auth usando la API REST de admin
      const res = await fetch(`https://${SUPABASE_PROJECT_ID}.supabase.co/auth/v1/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error('Error al eliminar en Auth: ' + errorText);
      }

      setAgents(prevAgents => prevAgents.filter(a => a.id !== id));
      toast({ title: 'Éxito', description: 'Agente eliminado completamente.' });
    } catch (error: any) {
      console.error('Error deleting agent:', error);
      toast({
        title: 'Error',
        description: `No se pudo eliminar el agente: ${error.message || 'Error desconocido'}`,
        variant: 'destructive',
      });
    }
  };

  // Redirección si es admin pero está en ruta no-admin (si aplica)
  if (user?.role === 'admin' && !adminMode) {
    // Ajusta la ruta de redirección si es necesario
    return <Navigate to="/dashboard/admin/agents" replace />;
  }

  // ---- RENDERIZADO ----
  return (
    <div className="container mx-auto p-4 md:p-6 font-poppins">
      {/* Encabezado Responsivo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Agentes
          {adminMode && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs align-middle">Admin</span>}
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Botones de Vista */}
          <div className="flex gap-2">
             <Button
               variant={view === 'grid' ? 'default' : 'outline'}
               size="sm"
               onClick={() => setView('grid')}
               aria-label="Vista de cuadrícula"
               className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
             >
               <LayoutGrid className="h-4 w-4 mr-0 sm:mr-2" /> {/* Ocultar margen en móvil */}
               <span className="hidden sm:inline">Grid</span> {/* Ocultar texto en móvil */}
             </Button>
             <Button
               variant={view === 'table' ? 'default' : 'outline'}
               size="sm"
               onClick={() => setView('table')}
               aria-label="Vista de tabla"
               className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
             >
               <List className="h-4 w-4 mr-0 sm:mr-2" />
               <span className="hidden sm:inline">Tabla</span>
             </Button>
          </div>
          {/* Botón Nuevo Agente (Mostrar si es admin o si la lógica lo permite) */}
          { (adminMode || user?.role === 'admin') && (
             <Link to={`${basePath}/new`} className="w-full sm:w-auto">
               <Button className="w-full sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">
                   <UserPlus className="h-4 w-4 mr-2"/>
                   Nuevo Agente
                </Button>
             </Link>
          )}
        </div>
      </div>

      {/* Contenido Principal */}
      {loading ? (
         <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            Cargando agentes...
        </div>
      ) : agents.length === 0 ? (
        <Card className="text-center shadow-sm dark:bg-gray-800 border dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-300">No hay agentes registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Parece que aún no se ha añadido ningún agente.
            </p>
            { (adminMode || user?.role === 'admin') && (
              <Link to={`${basePath}/new`}>
                <Button>
                   <UserPlus className="h-4 w-4 mr-2"/>
                   Añadir Primer Agente
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : view === 'grid' ? (
        // ---- Vista Grid ----
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {agents.map((agent) => (
            <Card key={agent.id} className="w-full flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
              <CardContent className="p-4 flex flex-col flex-grow"> {/* Padding y flex */}
                 {/* Sección Superior: Imagen y Nombre */}
                 <div className="flex items-center gap-3 mb-3">
                    {/* Imagen o Placeholder */}
                    <div className="flex-shrink-0">
                       {agent.profile_image ? (
                         <img src={agent.profile_image} alt={`${agent.first_name}`} className="w-14 h-14 object-cover rounded-full border border-gray-200 dark:border-gray-600" loading="lazy" />
                       ) : (
                         <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                            <HiOutlineUserCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                         </div>
                       )}
                    </div>
                    {/* Nombre y Contacto */}
                    <div className="flex-1 min-w-0">
                       <Link to={`${basePath}/${agent.id}`} className="hover:underline">
                         <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate" title={`${agent.first_name} ${agent.last_name}`}>
                            {agent.first_name} {agent.last_name}
                         </h2>
                       </Link>
                       <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={agent.email}>{agent.email}</p>
                       <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={agent.phone}>{agent.phone}</p>
                    </div>
                 </div>

                 {/* Espacio Flexible (si hubiera una bio, iría aquí con flex-grow) */}
                 <div className="flex-grow"></div>

                 {/* Acciones (al final) */}
                 {/* Mostrar acciones si es admin o si la lógica lo permite */}
                 { (adminMode || user?.role === 'admin') && (
                    <div className="flex justify-end space-x-2 pt-3 mt-3 border-t border-gray-100 dark:border-gray-700">
                      <Link to={`${basePath}/edit/${agent.id}`} aria-label={`Editar a ${agent.first_name}`}> {/* Ajusta la ruta de edición */}
                        <Button size="sm" variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                          <Pencil className="h-4 w-4 mr-0 sm:mr-1" />
                          <span className="hidden sm:inline">Editar</span>
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost" // Podría ser 'destructive' para más énfasis
                        className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
                        onClick={() => handleDelete(agent.id)}
                        aria-label={`Eliminar a ${agent.first_name}`}
                      >
                        <Trash2 className="h-4 w-4 mr-0 sm:mr-1" />
                        <span className="hidden sm:inline">Eliminar</span>
                      </Button>
                    </div>
                 )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // ---- Vista Tabla ----
        <div className="overflow-x-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Teléfono</th>
                 {/* Mostrar columna de acciones si es admin o si la lógica lo permite */}
                 { (adminMode || user?.role === 'admin') && (
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                 )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  {/* Celda Nombre con Imagen */}
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                       <div className="flex-shrink-0 h-10 w-10">
                          {agent.profile_image ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={agent.profile_image} alt="" loading="lazy" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <HiOutlineUserCircle className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                            </div>
                          )}
                       </div>
                       <div>
                           <Link to={`${basePath}/${agent.id}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                               {agent.first_name} {agent.last_name}
                           </Link>
                           {/* Podrías añadir rol u otra info aquí si es relevante */}
                       </div>
                    </div>
                  </td>
                  {/* Email y Teléfono */}
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{agent.email}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{agent.phone}</td>
                  {/* Acciones */}
                  { (adminMode || user?.role === 'admin') && (
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                         <Link to={`${basePath}/edit/${agent.id}`} aria-label={`Editar a ${agent.first_name}`}> {/* Ajusta ruta edición */}
                           <Button size="sm" variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                             <Pencil size={16} />
                           </Button>
                         </Link>
                         <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
                            onClick={() => handleDelete(agent.id)}
                            aria-label={`Eliminar a ${agent.first_name}`}
                          >
                           <Trash2 size={16} />
                         </Button>
                      </div>
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

export default AgentsList;