import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { HiOutlineArrowLeft, HiOutlinePhoto } from "react-icons/hi2";

interface RealEstateAgent {
  id?: string;
  agency_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  photo_url?: string;
  bio: string;
  specialization: string;
  license_number: string;
}

const AgentForm: React.FC<{ isEditing?: boolean }> = ({ isEditing = false }) => {
  const { agencyId, id } = useParams<{ agencyId: string; id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [agent, setAgent] = useState<RealEstateAgent>({
    agency_id: agencyId || '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
    specialization: '',
    license_number: '',
  });

  useEffect(() => {
    if (isEditing && id) {
      fetchAgent();
    }
  }, [id, isEditing]);

  const fetchAgent = async () => {
    try {
      const { data, error } = await supabase
        .from('real_estate_agents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setAgent(data);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar el agente',
        variant: 'destructive',
      });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('agents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('agents')
        .getPublicUrl(fileName);

      setAgent({ ...agent, photo_url: publicUrl });
      toast({
        title: 'Éxito',
        description: 'Foto subida correctamente',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Error al subir la foto',
        variant: 'destructive',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('real_estate_agents')
          .update(agent)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('real_estate_agents')
          .insert([agent]);

        if (error) throw error;
      }

      toast({
        title: 'Éxito',
        description: `Agente ${isEditing ? 'actualizado' : 'creado'} correctamente`,
      });
      navigate(`/dashboard/agencies/${agencyId}/agents`);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: `Error al ${isEditing ? 'actualizar' : 'crear'} el agente`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/agencies/${agencyId}/agents`)}
            >
              <HiOutlineArrowLeft className="h-5 w-5 mr-2" />
              Volver
            </Button>
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Editar Agente' : 'Nuevo Agente'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="first_name">Nombre</Label>
                    <Input
                      id="first_name"
                      value={agent.first_name}
                      onChange={(e) => setAgent({ ...agent, first_name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="last_name">Apellidos</Label>
                    <Input
                      id="last_name"
                      value={agent.last_name}
                      onChange={(e) => setAgent({ ...agent, last_name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={agent.email}
                      onChange={(e) => setAgent({ ...agent, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={agent.phone}
                      onChange={(e) => setAgent({ ...agent, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="specialization">Especialización</Label>
                    <Input
                      id="specialization"
                      value={agent.specialization}
                      onChange={(e) => setAgent({ ...agent, specialization: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="license_number">Número de Licencia</Label>
                    <Input
                      id="license_number"
                      value={agent.license_number}
                      onChange={(e) => setAgent({ ...agent, license_number: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea
                      id="bio"
                      value={agent.bio}
                      onChange={(e) => setAgent({ ...agent, bio: e.target.value })}
                      className="h-32"
                    />
                  </div>

                  <div>
                    <Label>Foto</Label>
                    <div className="mt-2 space-y-4">
                      {agent.photo_url && (
                        <img
                          src={agent.photo_url}
                          alt="Foto del agente"
                          className="w-32 h-32 object-cover rounded-full"
                        />
                      )}
                      <label className="block">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          disabled={uploadingPhoto}
                        >
                          <HiOutlinePhoto className="h-5 w-5 mr-2" />
                          {uploadingPhoto ? 'Subiendo...' : 'Subir Foto'}
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                          disabled={uploadingPhoto}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <Button
                  type="submit"
                  disabled={loading}
                  className="min-w-[150px]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    isEditing ? 'Guardar Cambios' : 'Crear Agente'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default AgentForm; 