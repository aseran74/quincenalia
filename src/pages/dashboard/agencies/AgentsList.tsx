import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Asegúrate de importar lo que uses
import { toast } from '@/components/ui/use-toast';
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineArrowLeft,
  HiOutlinePlus,
  HiOutlineUserCircle, // Icono para placeholder de foto
} from "react-icons/hi2";
import { cn } from '@/lib/utils'; // Asumiendo que tienes cn para clases condicionales

// Interfaces (sin cambios)
interface RealEstateAgent {
  id: string;
  agency_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  photo_url: string | null;
  bio: string;
  specialization: string;
  license_number: string;
  created_at: string;
  updated_at: string;
}

interface RealEstateAgency {
  id: string;
  name: string;
}

const AgentsList = () => {
  const { agencyId } = useParams<{ agencyId: string }>();
  const navigate = useNavigate();
  const [agents, setAgents] = useState<RealEstateAgent[]>([]);
  const [agency, setAgency] = useState<RealEstateAgency | null>(null);
  const [loading, setLoading] = useState(true);

  // basePath para navegación (ajusta según tu estructura de rutas)
  const basePath = '/dashboard/agencies'; // O '/dashboard/admin/agencies' si es relevante

  useEffect(() => {
    if (!agencyId) {
      // Si no hay agencyId, redirigir o mostrar error
      toast({ title: 'Error', description: 'ID de agencia no proporcionado.', variant: 'destructive' });
      navigate(basePath); // Vuelve a la lista principal de agencias
      return;
    }
    fetchAgencyAndAgents();
  }, [agencyId, navigate, basePath]); // Añadir dependencias

  const fetchAgencyAndAgents = async () => {
    setLoading(true);
    try {
      // Obtener la agencia (paralelizar si es posible, pero secuencial es más simple)
      const { data: agencyData, error: agencyError } = await supabase
        .from('real_estate_agencies')
        .select('id, name')
        .eq('id', agencyId)
        .single();

      // Manejo específico si la agencia no se encuentra
      if (agencyError && agencyError.code === 'PGRST116') { // Código para "single row not found"
          console.warn(`Agency with ID ${agencyId} not found.`);
          setAgency(null); // Establecer agencia a null explícitamente
          // No lanzar error aquí, se manejará en el render
      } else if (agencyError) {
          throw agencyError; // Lanzar otros errores de Supabase
      } else {
          setAgency(agencyData);
      }


      // Obtener los agentes solo si la agencia existe
      if (agencyData) { // Solo buscar agentes si encontramos la agencia
        const { data: agentsData, error: agentsError } = await supabase
          .from('real_estate_agents')
          .select('*')
          .eq('agency_id', agencyId)
          .order('first_name');

        if (agentsError) throw agentsError;
        setAgents(agentsData || []);
      } else {
        // Si la agencia no se encontró, no hay agentes que buscar para ella
        setAgents([]);
      }

    } catch (error: any) { // Especificar tipo 'any' o 'Error'
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: `No se pudieron cargar los datos: ${error.message || 'Error desconocido'}`,
        variant: 'destructive',
      });
      // Podrías querer limpiar estados aquí si es necesario
      // setAgency(null);
      // setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este agente? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('real_estate_agents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAgents(prevAgents => prevAgents.filter(agent => agent.id !== id)); // Usar callback para estado previo
      toast({
        title: 'Éxito',
        description: 'Agente eliminado correctamente',
      });
    } catch (error: any) { // Especificar tipo
      console.error('Error deleting agent:', error);
      toast({
        title: 'Error',
        description: `Error al eliminar el agente: ${error.message || 'Error desconocido'}`,
        variant: 'destructive',
      });
    }
  };

  // ---- ESTADOS DE CARGA Y ERROR ----

  if (loading) {
    return (
      // Un loader más centrado y con texto opcional
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-gray-500 dark:text-gray-400">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        Cargando datos...
      </div>
    );
  }

  // Si la carga terminó pero la agencia no se encontró
  if (!agency) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
          <Card className="max-w-md mx-auto p-6 shadow-lg dark:bg-gray-800">
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-red-600 dark:text-red-500">Agencia no encontrada</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                    No se encontró ninguna agencia con el ID proporcionado.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button
                    variant="outline"
                    onClick={() => navigate(basePath)} // Usar basePath
                    className="mt-4 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                    <HiOutlineArrowLeft className="h-5 w-5 mr-2" />
                    Volver a la lista
                </Button>
            </CardContent>
          </Card>
      </div>
    );
  }

  // ---- RENDERIZADO PRINCIPAL ----
  return (
    <div className="container mx-auto py-8 px-4 font-poppins">
      {/* Encabezado Responsivo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        {/* Izquierda: Volver y Título */}
        <div className="flex items-center gap-3 md:gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(basePath)} aria-label="Volver a la lista de agencias" className="flex-shrink-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
            <HiOutlineArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            {/* Usar un tamaño de fuente base y aumentarlo en pantallas más grandes */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100">{agency.name}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Agentes Inmobiliarios</p>
          </div>
        </div>
        {/* Derecha: Botón Nuevo Agente */}
        {/* Opcional: Mostrar solo si es admin? agregar condición user?.role === 'admin' && (...) */}
        <Button onClick={() => navigate(`${basePath}/${agencyId}/agents/new`)} className="w-full md:w-auto dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">
          <HiOutlinePlus className="h-5 w-5 mr-2" />
          Nuevo Agente
        </Button>
      </div>

      {/* Grid de Agentes */}
      {agents.length === 0 ? (
        <Card className="text-center py-12 px-6 shadow-sm dark:bg-gray-800">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-300">No hay agentes registrados</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Esta agencia aún no tiene agentes vinculados.
                </p>
                 {/* Opcional: Botón para añadir el primero */}
                 {/* <Button onClick={() => navigate(`${basePath}/${agencyId}/agents/new`)}>
                    Añadir Primer Agente
                 </Button> */}
            </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {agents.map((agent) => (
            <Card key={agent.id} className="w-full flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
              <CardContent className="p-4 flex flex-col flex-grow"> {/* Padding base, flex-grow para empujar botones abajo */}
                <div className="flex items-start justify-between mb-3 gap-3">
                  {/* Info principal */}
                  <div className="flex-1 min-w-0"> {/* min-w-0 necesario para que truncate funcione en flex */}
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate" title={`${agent.first_name} ${agent.last_name}`}>
                      {agent.first_name} {agent.last_name}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={agent.specialization || ''}>
                      {agent.specialization || 'Especialización no indicada'}
                    </p>
                  </div>
                  {/* Foto o Placeholder */}
                  <div className="flex-shrink-0">
                    {agent.photo_url ? (
                      <img
                        src={agent.photo_url}
                        alt={`${agent.first_name} ${agent.last_name}`}
                        className="w-14 h-14 object-cover rounded-full border border-gray-200 dark:border-gray-600"
                        loading="lazy" // Carga diferida para imágenes
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                        <HiOutlineUserCircle className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {agent.bio && (
                   <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-3 flex-grow"> {/* line-clamp-3, flex-grow para ocupar espacio */}
                      {agent.bio}
                   </p>
                )}

                {/* Contacto y Licencia */}
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mt-auto"> {/* mt-auto para empujar hacia abajo */}
                  {agent.phone && <p className="truncate">📞 {agent.phone}</p>}
                  {agent.email && <p className="truncate">✉️ {agent.email}</p>}
                  {agent.license_number && <p className="truncate">🪪 Lic: {agent.license_number}</p>}
                </div>

                {/* Acciones */}
                {/* Opcional: Mostrar solo si es admin? agregar condición user?.role === 'admin' && (...) */}
                <div className="flex justify-end space-x-2 pt-4 mt-2 border-t border-gray-100 dark:border-gray-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`${basePath}/${agencyId}/agents/edit/${agent.id}`)}
                    className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    aria-label={`Editar a ${agent.first_name}`}
                  >
                    <HiOutlinePencil className="h-4 w-4 sm:mr-1" /> {/* Ocultar margen en móvil si es necesario */}
                    <span className="hidden sm:inline">Editar</span> {/* Ocultar texto en pantallas muy pequeñas */}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(agent.id)}
                    aria-label={`Eliminar a ${agent.first_name}`}
                  >
                    <HiOutlineTrash className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentsList;