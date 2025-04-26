import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HiOutlineUserCircle } from 'react-icons/hi2';

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

interface RealEstateAgent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  photo_url?: string;
}

const AgencyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [agency, setAgency] = useState<RealEstateAgency | null>(null);
  const [agents, setAgents] = useState<RealEstateAgent[]>([]);

  useEffect(() => {
    fetchAgency();
    fetchAgents();
  }, [id]);

  const fetchAgency = async () => {
    const { data, error } = await supabase
      .from('real_estate_agencies')
      .select('*')
      .eq('id', id)
      .single();
    if (!error) setAgency(data);
  };

  const fetchAgents = async () => {
    const { data, error } = await supabase
      .from('real_estate_agents')
      .select('id, first_name, last_name, email, phone, photo_url')
      .eq('agency_id', id);
    if (!error) setAgents(data || []);
  };

  if (!agency) return <div className="p-8">Cargando agencia...</div>;

  return (
    <div className="container mx-auto p-6 font-poppins">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-col items-center">
          {agency.logo_url ? (
            <img src={agency.logo_url} alt={agency.name} className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 mb-2" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200 mb-2">
              <span className="text-gray-400 text-5xl">🏢</span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-center">{agency.name}</h1>
          <p className="text-gray-600 text-center">{agency.email} | {agency.phone}</p>
          <p className="text-gray-600 text-center">{agency.address}</p>
          <p className="text-gray-600 text-center">{agency.website}</p>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">{agency.description}</p>
          <h2 className="text-lg font-semibold mb-2">Agentes vinculados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.length === 0 ? (
              <p className="text-gray-500 col-span-2">No hay agentes vinculados a esta agencia.</p>
            ) : (
              agents.map(agent => (
                <Link to={`/dashboard/agents/${agent.id}`} key={agent.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-100">
                  {agent.photo_url ? (
                    <img src={agent.photo_url} alt={agent.first_name} className="w-12 h-12 rounded-full object-cover border" />
                  ) : (
                    <HiOutlineUserCircle className="w-12 h-12 text-gray-300" />
                  )}
                  <div>
                    <div className="font-semibold">{agent.first_name} {agent.last_name}</div>
                    <div className="text-gray-500 text-sm">{agent.email}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgencyDetail; 