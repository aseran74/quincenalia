import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Pencil, Trash2 } from 'lucide-react';
import { HiOutlineUserCircle } from 'react-icons/hi2';

interface Owner {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  photo_url?: string;
  properties?: Array<{
    id: string;
    title: string;
    shares: Array<{ num: number; status: string }>;
  }>;
}

const OwnersList = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    setLoading(true);
    const { data: ownersData } = await supabase
      .from('property_owners')
      .select('*')
      .order('first_name');
    const { data: propertiesData } = await supabase
      .from('properties')
      .select('id, title, share1_owner_id, share1_status, share2_owner_id, share2_status, share3_owner_id, share3_status, share4_owner_id, share4_status');
    const ownersWithProps = (ownersData || []).map(owner => {
      const props = (propertiesData || []).map(p => {
        const shares = [];
        if (p.share1_owner_id === owner.id) shares.push({ num: 1, status: p.share1_status });
        if (p.share2_owner_id === owner.id) shares.push({ num: 2, status: p.share2_status });
        if (p.share3_owner_id === owner.id) shares.push({ num: 3, status: p.share3_status });
        if (p.share4_owner_id === owner.id) shares.push({ num: 4, status: p.share4_status });
        return shares.length > 0 ? { id: p.id, title: p.title, shares } : null;
      }).filter(Boolean);
      return { ...owner, properties: props };
    });
    setOwners(ownersWithProps);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar este propietario?')) return;
    const { error } = await supabase
      .from('property_owners')
      .delete()
      .eq('id', id);
    if (!error) {
      setOwners(owners.filter(o => o.id !== id));
      toast({ title: 'Éxito', description: 'Propietario eliminado correctamente' });
    } else {
      toast({ title: 'Error', description: 'Error al eliminar', variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto p-6 font-poppins">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Propietarios</h1>
        <div className="flex gap-2">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            onClick={() => setView('grid')}
          >
            Grid
          </Button>
          <Button
            variant={view === 'table' ? 'default' : 'outline'}
            onClick={() => setView('table')}
          >
            Tabla
          </Button>
          <Link to="/admin/owners/new">
            <Button>Nuevo Propietario</Button>
          </Link>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-12">Cargando propietarios...</div>
      ) : owners.length === 0 ? (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">No hay propietarios registrados</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Comienza agregando un nuevo propietario.
            </p>
          </CardContent>
        </Card>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {owners.map((owner) => (
            <Card key={owner.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-4">
                  {owner.photo_url ? (
                    <img src={owner.photo_url} alt={owner.first_name} className="w-16 h-16 object-cover rounded-full" />
                  ) : (
                    <HiOutlineUserCircle className="w-16 h-16 text-gray-300" />
                  )}
                  <div>
                    <Link to={`/admin/owners/${owner.id}`} className="hover:underline">
                      <h2 className="text-xl font-semibold">{owner.first_name} {owner.last_name}</h2>
                    </Link>
                    <p className="text-gray-600 text-sm">{owner.email}</p>
                    <p className="text-gray-600 text-sm">{owner.phone}</p>
                    {owner.properties && owner.properties.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {owner.properties.map(prop => (
                          <div key={prop.id} className="flex items-center gap-2 text-xs">
                            <span className="font-semibold">{prop.title}</span>
                            {prop.shares.map(share => (
                              <span key={share.num} className={`px-2 py-0.5 rounded text-white ${share.status === 'reservada' ? 'bg-blue-500' : 'bg-green-600'}`}>#{share.num} {share.status}</span>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 justify-end">
                  <Link to={`/admin/owners/${owner.id}/edit`}>
                    <Button size="icon" variant="ghost"><Pencil /></Button>
                  </Link>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(owner.id)}><Trash2 color="#e11d48" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Nombre</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Teléfono</th>
                <th className="px-4 py-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((owner) => (
                <tr key={owner.id}>
                  <td className="px-4 py-2 border flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {owner.photo_url ? (
                        <img src={owner.photo_url} alt={owner.first_name} className="w-8 h-8 object-cover rounded-full" />
                      ) : (
                        <HiOutlineUserCircle className="w-8 h-8 text-gray-300" />
                      )}
                      <Link to={`/admin/owners/${owner.id}`} className="hover:underline">
                        {owner.first_name} {owner.last_name}
                      </Link>
                    </div>
                    {owner.properties && owner.properties.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {owner.properties.map(prop => (
                          <div key={prop.id} className="flex items-center gap-2 text-xs">
                            <span className="font-semibold">{prop.title}</span>
                            {prop.shares.map(share => (
                              <span key={share.num} className={`px-2 py-0.5 rounded text-white ${share.status === 'reservada' ? 'bg-blue-500' : 'bg-green-600'}`}>#{share.num} {share.status}</span>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 border">{owner.email}</td>
                  <td className="px-4 py-2 border">{owner.phone}</td>
                  <td className="px-4 py-2 border flex gap-2">
                    <Link to={`/admin/owners/${owner.id}/edit`}>
                      <Button size="icon" variant="ghost"><Pencil /></Button>
                    </Link>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(owner.id)}><Trash2 color="#e11d48" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OwnersList; 