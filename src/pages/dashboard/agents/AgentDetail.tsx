import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import {
    HiOutlineUserCircle,
    HiOutlineArrowLeft,
    HiOutlineEnvelope,
    HiOutlinePhone,
} from 'react-icons/hi2';
import { cn } from '@/lib/utils';

interface AgentProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_image?: string;
}

const AgentDetail: React.FC = () => {
  const { id: agentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detectar si estamos en admin
  const isAdmin = location.pathname.includes('/admin/agents');
  const basePath = isAdmin ? '/dashboard/admin/agents' : '/dashboard/agents';

  useEffect(() => {
    if (agentId) {
      fetchAgent();
    } else {
        setError("No se proporcionó un ID de agente.");
        setLoading(false);
        toast({ title: 'Error', description: 'ID de agente inválido.', variant: 'destructive' });
    }
    return () => {
        setAgent(null);
        setLoading(true);
        setError(null);
    }
  }, [agentId]);

  const fetchAgent = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, profile_image')
        .eq('id', agentId)
        .single();

      if (dbError) {
        if (dbError.code === 'PGRST116') {
          throw new Error('Agente no encontrado.');
        } else {
          throw dbError;
        }
      }

      if (data) {
        setAgent(data);
      } else {
         throw new Error('No se recibieron datos del agente.');
      }

    } catch (err: any) {
      console.error("Error fetching agent:", err);
      const errorMessage = err.message || 'No se pudo cargar la información del agente.';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setAgent(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-gray-500 dark:text-gray-400 p-8">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        Cargando agente...
      </div>
    );
  }

  if (error || !agent) {
     return (
      <div className="container mx-auto py-12 px-4 text-center">
        <Card className="max-w-md mx-auto p-6 shadow-lg dark:bg-gray-800">
          <CardHeader>
              <CardTitle className="text-xl font-semibold text-red-600 dark:text-red-500">Error al cargar</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                  {error || 'No se pudo encontrar la información del agente solicitado.'}
              </CardDescription>
          </CardHeader>
          <CardContent>
              <Button
                  variant="outline"
                  onClick={() => navigate(basePath)}
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

  return (
    <div className="container mx-auto p-4 md:p-6 font-poppins">
      <div className="flex items-center mb-6 gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(basePath)} aria-label="Volver" className="flex-shrink-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
            <HiOutlineArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
          Perfil del Agente
        </h1>
      </div>

      <Card className="max-w-2xl mx-auto overflow-hidden shadow-md dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-700/50">
          <div className="mb-4">
            {agent.profile_image ? (
              <img
                src={agent.profile_image}
                alt={`Foto de perfil de ${agent.first_name} ${agent.last_name}`}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-500 shadow-sm"
                loading="lazy"
              />
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center border border-gray-300 dark:border-gray-500 shadow-sm">
                 <HiOutlineUserCircle className="w-12 h-12 md:w-14 md:h-14 text-gray-400 dark:text-gray-400" />
              </div>
            )}
          </div>
          <CardTitle className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            {agent.first_name} {agent.last_name}
          </CardTitle>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1">
             {agent.email && (
                <div className="flex items-center justify-center gap-2">
                    <HiOutlineEnvelope className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <a href={`mailto:${agent.email}`} className="hover:underline">{agent.email}</a>
                </div>
             )}
             {agent.phone && (
                <div className="flex items-center justify-center gap-2">
                    <HiOutlinePhone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>{agent.phone}</span>
                </div>
             )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Información Adicional</h3>
          <div className="text-gray-700 dark:text-gray-300 space-y-2">
             <p className="text-sm text-gray-500 italic">
                (Aquí puedes añadir más detalles como biografía, especialización, propiedades asignadas, etc.)
             </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentDetail; 