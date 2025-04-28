import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { HiOutlineUserCircle, HiOutlinePhoto } from 'react-icons/hi2';

const OwnerForm = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [owner, setOwner] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    photo_url: '',
  });
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) fetchOwner();
  }, [id]);

  const fetchOwner = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('property_owners')
      .select('*')
      .eq('id', id)
      .single();
    if (data) setOwner(data);
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOwner({ ...owner, [e.target.name]: e.target.value ?? '' });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('owners').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('owners').getPublicUrl(fileName);
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
      const { error } = await supabase.storage.from('owners').remove([fileName]);
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
      const ownerData = { ...owner, photo_url: photoUrl || null };
      let result;
      if (id) {
        result = await supabase
          .from('property_owners')
          .update(ownerData)
          .eq('id', id);
      } else {
        const password = Math.random().toString(36).slice(-8) + 'Aa1!';
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: owner.email,
          password,
        });
        if (signUpError || !signUpData.user) {
          toast({ title: 'Error', description: 'No se pudo crear el usuario Auth: ' + (signUpError?.message || 'Error desconocido'), variant: 'destructive' });
          setLoading(false);
          return;
        }
        const user_id = signUpData.user.id;
        result = await supabase
          .from('property_owners')
          .insert([{ ...ownerData, user_id }]);
        toast({ title: 'Usuario creado', description: `Contraseña temporal: ${password}` });
      }
      if (!result.error) {
        toast({ title: 'Éxito', description: 'Propietario guardado correctamente' });
        navigate('/admin/owners');
      } else {
        toast({ title: 'Error', description: 'No se pudo guardar', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 font-poppins max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">{id ? 'Editar Propietario' : 'Nuevo Propietario'}</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1 font-medium">Nombre</label>
          <input type="text" name="first_name" value={owner.first_name ?? ''} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Apellido</label>
          <input type="text" name="last_name" value={owner.last_name ?? ''} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input type="email" name="email" value={owner.email ?? ''} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Teléfono</label>
          <input type="tel" name="phone" value={owner.phone ?? ''} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
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
        <Button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </form>
    </div>
  );
};

export default OwnerForm; 