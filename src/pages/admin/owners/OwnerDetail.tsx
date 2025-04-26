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
  const [shares, setShares] = useState<any[]>([]);

  useEffect(() => {
    fetchOwner();
    fetchShares();
  }, [id]);

  const fetchOwner = async () => {
    const { data } = await supabase
      .from('property_owners')
      .select('*')
      .eq('id', id)
      .single();
    if (data) setOwner(data);
  };

  const fetchShares = async () => {
    const { data, error } = await supabase
      .from('shares')
      .select(`id, status, price, percentage, 
        properties (id, title),
        copropiedades (id, nombre)
      `)
      .eq('owner_id', id)
      .in('status', ['reservada', 'vendida']);
    if (data) setShares(data);
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
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Copropiedades asignadas</h2>
            {shares.length === 0 ? (
              <p className="text-gray-500">Este propietario no tiene copropiedades reservadas ni compradas.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Propiedad</TableHead>
                    <TableHead>Fracción</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Porcentaje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shares.map((share) => (
                    <TableRow key={share.id}>
                      <TableCell>{share.properties?.title || '-'}</TableCell>
                      <TableCell>{share.copropiedades?.nombre || '-'}</TableCell>
                      <TableCell className="capitalize">{share.status}</TableCell>
                      <TableCell>€{share.price?.toLocaleString()}</TableCell>
                      <TableCell>{share.percentage}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <div className="mt-4">
            <Link to={`/admin/owners/${owner.id}/edit`} className="text-blue-600 hover:underline">Editar propietario</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerDetail; 