import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { HiOutlineUserCircle } from 'react-icons/hi2';

interface RealEstateAgent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  photo_url?: string;
  agency_id?: string;
}

interface RealEstateAgency {
  id: string;
  name: string;
  email: string;
  phone: string;
  logo_url?: string;
}

const AgentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<RealEstateAgent | null>(null);
  const [agency, setAgency] = useState<RealEstateAgency | null>(null);

  useEffect(() => {
    fetchAgent();
  }, [id]);

  const fetchAgent = async () => {
    const { data, error } = await supabase
      .from('real_estate_agents')
      .select('*, real_estate_agencies(id, name, email, phone, logo_url)')
      .eq('id', id)
      .single();
    if (!error && data) {
      setAgent({
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        photo_url: data.photo_url,
        agency_id: data.agency_id,
      });
      if (data.real_estate_agencies) setAgency(data.real_estate_agencies);
    }
  };

  if (!agent) return <div className="p-8">Cargando agente...</div>;

  return (
    <div className="container mx-auto p-6 font-poppins">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-col items-center">
          {agent.photo_url ? (
            <img src={agent.photo_url} alt={agent.first_name} className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 mb-2" />
          ) : (
            <HiOutlineUserCircle className="w-24 h-24 text-gray-300 mb-2" />
          )}
          <h1 className="text-2xl font-bold text-center">{agent.first_name} {agent.last_name}</h1>
          <p className="text-gray-600 text-center">{agent.email} | {agent.phone}</p>
        </CardHeader>
        <CardContent>
          <h2 className="text-lg font-semibold mb-2">Agencia</h2>
          {agency ? (
            <Link to={`/dashboard/agencies/${agency.id}`} className="flex items-center gap-3 p-2 rounded hover:bg-gray-100">
              {agency.logo_url ? (
                <img src={agency.logo_url} alt={agency.name} className="w-12 h-12 rounded-full object-cover border" />
              ) : (
                <span className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center border text-3xl text-gray-400">🏢</span>
              )}
              <div>
                <div className="font-semibold">{agency.name}</div>
                <div className="text-gray-500 text-sm">{agency.email} | {agency.phone}</div>
              </div>
            </Link>
          ) : (
            <p className="text-gray-500">Sin agencia asignada</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentDetail; 