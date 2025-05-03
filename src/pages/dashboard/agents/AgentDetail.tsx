import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { HiOutlineUserCircle } from 'react-icons/hi2';

interface AgentProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_image?: string;
}

const AgentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<AgentProfile | null>(null);

  useEffect(() => {
    fetchAgent();
  }, [id]);

  const fetchAgent = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, phone, profile_image')
      .eq('id', id)
      .eq('role', 'agent')
      .single();
    if (!error && data) {
      setAgent(data);
    }
  };

  if (!agent) return <div className="p-8">Cargando agente...</div>;

  return (
    <div className="container mx-auto p-6 font-poppins">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-col items-center">
          {agent.profile_image ? (
            <img src={agent.profile_image} alt={agent.first_name} className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 mb-2" />
          ) : (
            <HiOutlineUserCircle className="w-24 h-24 text-gray-300 mb-2" />
          )}
          <h1 className="text-2xl font-bold text-center">{agent.first_name} {agent.last_name}</h1>
          <p className="text-gray-600 text-center">{agent.email} | {agent.phone}</p>
        </CardHeader>
        <CardContent>
          {/* Aquí puedes añadir más información del agente si lo deseas */}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentDetail; 