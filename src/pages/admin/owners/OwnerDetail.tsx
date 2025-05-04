import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { HiOutlineUserCircle } from 'react-icons/hi2';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Owner {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  photo_url?: string;
  created_at?: string;
}

const OwnerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [owner, setOwner] = useState<Owner | null>(null);
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    fetchOwner();
    fetchProperties();
  }, [id]);

  const fetchOwner = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .eq('role', 'owner')
      .single();
    if (data) setOwner(data);
  };

  const fetchProperties = async () => {
    const { data: propertiesData } = await supabase
      .from('properties')
      .select('id, title, share1_owner_id, share1_status, share2_owner_id, share2_status, share3_owner_id, share3_status, share4_owner_id, share4_status');
    if (!id) return;
    const props = (propertiesData || []).map(p => {
      const shares = [];
      if (p.share1_owner_id === id && ['vendida', 'reservada'].includes(p.share1_status)) shares.push({ num: 1, status: p.share1_status });
      if (p.share2_owner_id === id && ['vendida', 'reservada'].includes(p.share2_status)) shares.push({ num: 2, status: p.share2_status });
      if (p.share3_owner_id === id && ['vendida', 'reservada'].includes(p.share3_status)) shares.push({ num: 3, status: p.share3_status });
      if (p.share4_owner_id === id && ['vendida', 'reservada'].includes(p.share4_status)) shares.push({ num: 4, status: p.share4_status });
      return shares.length > 0 ? { id: p.id, title: p.title, shares } : null;
    }).filter(Boolean);
    setProperties(props);
  };

  if (!owner) return <div className="p-8">Cargando propietario...</div>;

  return (
    <div className="container mx-auto p-6 font-poppins">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-col items-center">
          {owner.photo_url ? (
            <img src={owner.photo_url} alt={owner.first_name} className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 mb-2" />
          ) : (
            <HiOutlineUserCircle className="w-24 h-24 text-gray-300 mb-2" />
          )}
          <h1 className="text-2xl font-bold text-center">{owner.first_name} {owner.last_name}</h1>
          <p className="text-gray-600 text-center">{owner.email} | {owner.phone}</p>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500 text-sm mb-2">ID: {owner.id}</div>
          {owner.created_at && (
            <div className="text-gray-500 text-sm">Creado: {new Date(owner.created_at).toLocaleString()}</div>
          )}

          <h2 className="text-xl font-bold mb-4">Copropiedades asignadas</h2>
          {properties.length === 0 ? (
            <p className="text-gray-500">Este propietario no tiene copropiedades reservadas ni compradas.</p>
          ) : (
            <div className="space-y-2 mb-4">
              {properties.map(prop => (
                <div key={prop.id} className="flex items-center gap-2 text-sm">
                  <Link to={`/dashboard/admin/properties/${prop.id}`} className="font-semibold text-blue-600 hover:underline">{prop.title}</Link>
                  {prop.shares.map(share => (
                    <span key={share.num} className={`px-2 py-0.5 rounded text-white ${share.status === 'reservada' ? 'bg-blue-500' : 'bg-green-600'}`}>#{share.num} {share.status}</span>
                  ))}
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Link to={`/admin/owners/${owner.id}/edit`} className="text-blue-600 hover:underline">Editar propietario</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerDetail; 