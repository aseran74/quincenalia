import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';

const ProfilePanel: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    let photoUrl = user?.profileImage || '';
    try {
      if (photo) {
        const { data, error } = await supabase.storage
          .from('profile')
          .upload(`profile_${user.id}_${Date.now()}`, photo, { upsert: true });
        if (error) throw error;
        const { data: publicData } = supabase.storage.from('profile').getPublicUrl(data.path);
        photoUrl = publicData.publicUrl;
      }
      // Actualizar datos en la tabla de perfiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ name, profile_image: photoUrl })
        .eq('id', user.id);
      if (updateError) throw updateError;
      toast.success('Perfil actualizado');
    } catch (err: any) {
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Mi Perfil</h2>
      <div className="flex flex-col items-center mb-6">
        <img
          src={photo ? URL.createObjectURL(photo) : user?.profileImage || '/default-avatar.png'}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover mb-2"
        />
        <input type="file" accept="image/*" onChange={handlePhotoChange} className="mb-2" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <Input value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Email</label>
        <Input value={user?.email || ''} disabled />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Rol</label>
        <Input value={user?.role || ''} disabled />
      </div>
      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </div>
  );
};

export default ProfilePanel; 