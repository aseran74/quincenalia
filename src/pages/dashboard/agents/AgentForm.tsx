import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { HiOutlineUserCircle, HiOutlinePhoto } from 'react-icons/hi2';

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
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
      .from('profiles')
      .select('first_name, last_name, email, phone, agency_id, photo_url')
      .eq('id', id)
      .eq('role', 'agent')
      .single();
    if (!error && data) {
      setAgent({
        name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        phone: data.phone,
      });
      setSelectedAgency(data.agency_id || '');
      setPhotoUrl(data.photo_url);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('agents').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('agents').getPublicUrl(fileName);
      setPhotoUrl(publicUrl);
      toast({ title: 'Éxito', description: 'Foto subida correctamente' });
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Error al subir la foto', variant: 'destructive' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!photoUrl) return;
    try {
      const fileName = photoUrl.split('/').pop();
      if (!fileName) throw new Error('No se pudo determinar el archivo');
      const { error } = await supabase.storage.from('agents').remove([fileName]);
      if (error) throw error;
      setPhotoUrl(undefined);
      toast({ title: 'Éxito', description: 'Foto eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar foto:', error);
      toast({ title: 'Error', description: 'No se pudo eliminar la foto', variant: 'destructive' });
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
        photo_url: photoUrl || null,
      };
      if (isEditing && id) {
        const { error } = await supabase
          .from('profiles')
          .update({ ...agentData, agency_id: selectedAgency || null, role: 'agent' })
          .eq('id', id)
          .eq('role', 'agent');
        if (error) throw error;
        toast({ title: 'Éxito', description: 'Agente actualizado correctamente' });
      } else {
        // Registro público: crear usuario en Auth y luego en profiles
        const password = Math.random().toString(36).slice(-8) + 'Aa1!';
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: agent.email,
          password,
        });
        if (signUpError || !signUpData.user) {
          toast({ title: 'Error', description: 'No se pudo crear el usuario Auth: ' + (signUpError?.message || 'Error desconocido'), variant: 'destructive' });
          setLoading(false);
          return;
        }
        const user_id = signUpData.user.id;
        const { error } = await supabase
          .from('profiles')
          .insert([{ ...agentData, agency_id: selectedAgency || null, id: user_id, role: 'agent' }]);
        if (error) throw error;
        toast({ title: 'Usuario creado', description: `Contraseña temporal: ${password}` });
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
          <div className="flex flex-col items-center mb-4">
            <div className="relative">
              {photoUrl ? (
                <>
                  <img
                    src={photoUrl}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-0 right-0 z-10"
                    onClick={handleRemovePhoto}
                  >
                    ×
                  </Button>
                </>
              ) : (
                <HiOutlineUserCircle className="w-24 h-24 text-gray-300" />
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-2"
              disabled={uploadingPhoto}
              onClick={() => fileInputRef.current?.click()}
            >
              <HiOutlinePhoto className="h-5 w-5 mr-2" />
              {uploadingPhoto ? 'Subiendo...' : 'Subir Foto'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={uploadingPhoto}
            />
          </div>
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