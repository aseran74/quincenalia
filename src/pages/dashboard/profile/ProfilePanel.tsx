import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';

const ProfilePanel: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [ownerPoints, setOwnerPoints] = useState<number | null>(null);
  const [pointsLoading, setPointsLoading] = useState(true);

  useEffect(() => {
    const fetchOwnerPoints = async () => {
      if (!user?.id || user.role !== 'owner') {
        setPointsLoading(false);
        setOwnerPoints(null);
        return;
      }
      setPointsLoading(true);
      try {
        const { data, error } = await supabase
          .from('owner_points')
          .select('points')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching owner points:', error);
          setOwnerPoints(0);
        } else if (data) {
           setOwnerPoints(typeof data.points === 'number' ? data.points : 0);
        } else {
           setOwnerPoints(0);
        }
      } catch (error) {
        console.error('Unexpected error fetching owner points:', error);
        setOwnerPoints(0);
      } finally {
        setPointsLoading(false);
      }
    };

    if (user?.id && user.role === 'owner') {
      fetchOwnerPoints();
    } else {
       setPointsLoading(false);
       setOwnerPoints(null);
    }

  }, [user?.id, user?.role]);

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
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Mi perfil</h1>

      {user && user.role === 'owner' && !pointsLoading && (
         <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <h2 className="text-lg font-semibold mb-2 text-blue-800">Tus Puntos</h2>
            <p className="text-blue-700 text-xl font-bold">
               {typeof ownerPoints === 'number' ? `${ownerPoints} Puntos` : 'Cargando...'}
            </p>
         </Card>
      )}

      {user && user.role === 'owner' && pointsLoading && <p>Cargando puntos...</p>}

      <div className="max-w-lg mx-auto mt-10 bg-white p-8 rounded shadow">
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
        <div className="mt-8 flex flex-col gap-4">
          <Button asChild variant="outline" className="w-fit">
            <Link to="/dashboard/profile/favorites">Ver mis favoritos</Link>
          </Button>
        </div>
        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </div>
  );
};

export default ProfilePanel; 