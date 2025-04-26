import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface RealEstateAgency {
  id: string;
  name: string;
}

interface AgentFormProps {
  isEditing?: boolean;
}

const AgentForm: React.FC<AgentFormProps> = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [agencies, setAgencies] = useState<RealEstateAgency[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<string>('');
  const [agent, setAgent] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAgencies();
    if (isEditing && id) {
      fetchAgent();
    }
  }, [id, isEditing]);

  const fetchAgencies = async () => {
    const { data, error } = await supabase
      .from('real_estate_agencies')
      .select('id, name')
      .order('name');
    if (!error && data) setAgencies(data);
  };

  const fetchAgent = async () => {
    const { data, error } = await supabase
      .from('real_estate_agents')
      .select('first_name, last_name, email, phone, agency_id')
      .eq('id', id)
      .single();
    if (!error && data) {
      setAgent({
        name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        phone: data.phone,
      });
      setSelectedAgency(data.agency_id || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const [first_name, ...lastArr] = agent.name.split(' ');
      const last_name = lastArr.join(' ');
      const agentData = {
        first_name,
        last_name,
        email: agent.email,
        phone: agent.phone,
        agency_id: selectedAgency || null,
      };
      if (isEditing && id) {
        const { error } = await supabase
          .from('real_estate_agents')
          .update(agentData)
          .eq('id', id);
        if (error) throw error;
        toast({ title: 'Éxito', description: 'Agente actualizado correctamente' });
      } else {
        const { error } = await supabase
          .from('real_estate_agents')
          .insert([agentData]);
        if (error) throw error;
        toast({ title: 'Éxito', description: 'Agente creado correctamente' });
      }
      navigate('/dashboard/agents');
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Error al guardar el agente', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Editar Agente' : 'Nuevo Agente'}
          </h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" placeholder="Nombre del agente" value={agent.name} onChange={e => setAgent({ ...agent, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Email del agente" value={agent.email} onChange={e => setAgent({ ...agent, email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" placeholder="Teléfono del agente" value={agent.phone} onChange={e => setAgent({ ...agent, phone: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="agency">Agencia</Label>
              <select
                id="agency"
                className="w-full border rounded p-2"
                value={selectedAgency}
                onChange={e => setSelectedAgency(e.target.value)}
              >
                <option value="">Sin agencia</option>
                {agencies.map(agency => (
                  <option key={agency.id} value={agency.id}>{agency.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/agents')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Agente'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentForm; 