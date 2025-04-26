import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { HiOutlineArrowLeft, HiOutlinePhoto } from "react-icons/hi2";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RealEstateAgency {
  id?: string;
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
  agency_id: string | null;
}

interface AgencyFormProps {
  isEditing?: boolean;
}

const AgencyForm: React.FC<AgencyFormProps> = ({ isEditing = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [agency, setAgency] = useState<RealEstateAgency>({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  });
  const [agents, setAgents] = useState<RealEstateAgent[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  useEffect(() => {
    if (isEditing && id) {
      fetchAgency();
    }
    fetchAgents();
  }, [id, isEditing]);

  const fetchAgency = async () => {
    try {
      const { data, error } = await supabase
        .from('real_estate_agencies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setAgency(data);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar la agencia',
        variant: 'destructive',
      });
    }
  };

  const fetchAgents = async () => {
    const { data, error } = await supabase
      .from('real_estate_agents')
      .select('id, first_name, last_name, email, agency_id');
    if (!error && data) {
      setAgents(data);
      if (isEditing && id) {
        setSelectedAgents(data.filter(a => a.agency_id === id).map(a => a.id));
      }
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('agencies')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('agencies')
        .getPublicUrl(fileName);

      setAgency({ ...agency, logo_url: publicUrl });
      toast({
        title: 'Éxito',
        description: 'Logo subido correctamente',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Error al subir el logo',
        variant: 'destructive',
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let agencyId = id;
      if (isEditing) {
        const { error } = await supabase
          .from('real_estate_agencies')
          .update(agency)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('real_estate_agencies')
          .insert([agency])
          .select('id')
          .single();
        if (error) throw error;
        agencyId = data.id;
      }
      await supabase
        .from('real_estate_agents')
        .update({ agency_id: agencyId })
        .in('id', selectedAgents);
      await supabase
        .from('real_estate_agents')
        .update({ agency_id: null })
        .not('id', 'in', `(${selectedAgents.join(',')})`)
        .eq('agency_id', agencyId);
      toast({
        title: 'Éxito',
        description: `Agencia ${isEditing ? 'actualizada' : 'creada'} correctamente`,
      });
      navigate('/dashboard/agencies');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: `Error al ${isEditing ? 'actualizar' : 'crear'} la agencia`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Editar Agencia' : 'Nueva Agencia'}
          </h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={agency.name}
                onChange={(e) => setAgency({ ...agency, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={agency.description}
                onChange={(e) => setAgency({ ...agency, description: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={agency.address}
                onChange={(e) => setAgency({ ...agency, address: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={agency.email}
                onChange={(e) => setAgency({ ...agency, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={agency.phone}
                onChange={(e) => setAgency({ ...agency, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                value={agency.website}
                onChange={(e) => setAgency({ ...agency, website: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Logo</Label>
              <div className="mt-2 space-y-4">
                {agency.logo_url && (
                  <img
                    src={agency.logo_url}
                    alt="Logo"
                    className="w-32 h-32 object-cover rounded"
                  />
                )}
                <label className="block">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={uploadingLogo}
                  >
                    <HiOutlinePhoto className="h-5 w-5 mr-2" />
                    {uploadingLogo ? 'Subiendo...' : 'Subir Logo'}
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                  />
                </label>
              </div>
            </div>
            <div>
              <Label>Agentes vinculados</Label>
              <select
                multiple
                className="w-full border rounded p-2"
                value={selectedAgents}
                onChange={e => {
                  const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
                  setSelectedAgents(options);
                }}
              >
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.first_name} {agent.last_name} ({agent.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/agencies')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                  isEditing ? 'Guardar Cambios' : 'Crear Agencia'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgencyForm; 