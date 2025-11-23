import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HiOutlineUserCircle, HiOutlinePhone, HiOutlineEnvelope, HiOutlineGlobeAlt, HiOutlineMapPin, HiOutlineBuildingOffice2, HiArrowLeft } from 'react-icons/hi2';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { Property } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/Navbar';

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

interface AgentProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  profile_image?: string;
}

const PublicAgencyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agency, setAgency] = useState<RealEstateAgency | null>(null);
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([fetchAgency(), fetchAgents(), fetchProperties()]).finally(() => setLoading(false));
    }
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
      .from('profiles')
      .select('id, first_name, last_name, email, phone, profile_image')
      .eq('agency_id', id);
    
    if (!error && data) {
      setAgents(data);
    }
  };

  const fetchProperties = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('agency_id', id);

    if (!error && data) {
      setProperties(data as unknown as Property[]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto p-6 space-y-8 pt-24">
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!agency) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-8 pt-32 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Agencia no encontrada</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/agencias')}>
          Volver al listado
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Hero Section con Banner Abstracto/Gradiente */}
        <div className="relative h-64 bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden mt-16">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-8 left-4 container mx-auto px-4">
                <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => navigate('/agencias')}>
                    <HiArrowLeft className="mr-2 h-5 w-5" /> Volver a Agencias
                </Button>
            </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-12">
            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Card Principal de la Agencia */}
                <Card className="w-full md:w-1/3 lg:w-1/4 overflow-hidden shadow-lg border-0">
                    <div className="flex flex-col items-center p-6 bg-white">
                        <div className="w-32 h-32 rounded-full bg-white p-1 shadow-md -mt-16 mb-4 relative z-20 overflow-hidden border-4 border-white">
                            {agency.logo_url ? (
                                <img src={agency.logo_url} alt={agency.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                                    <HiOutlineBuildingOffice2 className="w-16 h-16 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">{agency.name}</h1>
                        <Badge variant="secondary" className="mb-4">Agencia Inmobiliaria</Badge>
                        
                        <div className="w-full space-y-3 text-sm">
                            {agency.email && (
                                <div className="flex items-center text-gray-600">
                                    <HiOutlineEnvelope className="w-5 h-5 mr-3 text-gray-400" />
                                    <a href={`mailto:${agency.email}`} className="hover:text-blue-600 truncate">{agency.email}</a>
                                </div>
                            )}
                            {agency.phone && (
                                <div className="flex items-center text-gray-600">
                                    <HiOutlinePhone className="w-5 h-5 mr-3 text-gray-400" />
                                    <a href={`tel:${agency.phone}`} className="hover:text-blue-600">{agency.phone}</a>
                                </div>
                            )}
                            {agency.website && (
                                <div className="flex items-center text-gray-600">
                                    <HiOutlineGlobeAlt className="w-5 h-5 mr-3 text-gray-400" />
                                    <a href={agency.website.startsWith('http') ? agency.website : `https://${agency.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 truncate">{agency.website}</a>
                                </div>
                            )}
                            {agency.address && (
                                <div className="flex items-start text-gray-600">
                                    <HiOutlineMapPin className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                                    <span>{agency.address}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Stats Rápidos */}
                    <div className="grid grid-cols-2 border-t divide-x bg-gray-50">
                        <div className="p-4 text-center">
                            <div className="text-2xl font-bold text-gray-800">{agents.length}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Agentes</div>
                        </div>
                        <div className="p-4 text-center">
                            <div className="text-2xl font-bold text-gray-800">{properties.length}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Propiedades</div>
                        </div>
                    </div>
                </Card>

                {/* Contenido Principal (Tabs) */}
                <div className="flex-1 w-full">
                    <Tabs defaultValue="properties" className="w-full">
                        <div className="flex items-center justify-between mb-6">
                            <TabsList className="bg-white shadow-sm border p-1 h-auto">
                                <TabsTrigger value="properties" className="px-6 py-2">Propiedades</TabsTrigger>
                                <TabsTrigger value="agents" className="px-6 py-2">Agentes</TabsTrigger>
                                <TabsTrigger value="about" className="px-6 py-2">Información</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="properties" className="space-y-6">
                            {properties.length === 0 ? (
                                <Card className="bg-white border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <HiOutlineBuildingOffice2 className="w-16 h-16 text-gray-300 mb-4" />
                                        <p className="text-gray-500 text-lg">No hay propiedades publicadas por esta agencia actualmente.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {properties.map(property => (
                                        <PropertyCard key={property.id} {...property} />
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="agents">
                            <Card className="border-0 shadow-none bg-transparent">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {agents.length === 0 ? (
                                         <div className="col-span-full flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-dashed">
                                            <HiOutlineUserCircle className="w-16 h-16 text-gray-300 mb-4" />
                                            <p className="text-gray-500 text-lg">No hay agentes vinculados.</p>
                                        </div>
                                    ) : (
                                        agents.map(agent => (
                                            <div key={agent.id} className="group">
                                                <Card className="hover:shadow-md transition-all duration-200 border overflow-hidden h-full">
                                                    <CardContent className="p-4 flex items-center space-x-4">
                                                        {agent.profile_image ? (
                                                            <img src={agent.profile_image} alt={agent.first_name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 group-hover:border-blue-100 transition-colors" />
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-400 transition-colors">
                                                                <HiOutlineUserCircle className="w-10 h-10" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{agent.first_name} {agent.last_name}</h3>
                                                            {/* Email protegido o visible? Para público mostramos contacto de agencia generalmente, pero si queremos mostrar el del agente... */}
                                                            {/* <p className="text-sm text-gray-500 truncate">{agent.email}</p> */}
                                                            {/* Solo mostrar nombre para evitar spam, o contacto de agencia */}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="about">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sobre {agency.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                                        {agency.description || "No hay descripción disponible."}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    </div>
  );
};

export default PublicAgencyDetail;
