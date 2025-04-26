import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface RealEstateAgency {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo_url?: string;
}

const AgenciesList = () => {
  const [agencies, setAgencies] = useState<RealEstateAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const { user } = useAuth();

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('real_estate_agencies')
      .select('*')
      .order('name');
    if (!error) setAgencies(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta agencia?')) return;
    const { error } = await supabase
      .from('real_estate_agencies')
      .delete()
      .eq('id', id);
    if (!error) {
      setAgencies(agencies.filter(a => a.id !== id));
      toast({ title: 'Éxito', description: 'Elemento eliminado correctamente' });
    } else {
      toast({ title: 'Error', description: 'Error al realizar la acción', variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agencias Inmobiliarias</h1>
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
          <Link to="/dashboard/agencies/new">
            <Button>Nueva Agencia</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Cargando agencias...</div>
      ) : agencies.length === 0 ? (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">No hay agencias registradas</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Comienza agregando una nueva agencia inmobiliaria.
            </p>
          </CardContent>
        </Card>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agencies.map((agency) => (
            <Card key={agency.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-4">
                  {agency.logo_url && (
                    <img src={agency.logo_url} alt={agency.name} className="w-16 h-16 object-cover rounded" />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold">{agency.name}</h2>
                    <p className="text-gray-600 text-sm">{agency.email}</p>
                    <p className="text-gray-600 text-sm">{agency.phone}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 line-clamp-2 mb-2">{agency.description}</p>
                <div className="flex gap-2 justify-end">
                  <Link to={`/dashboard/agencies/${agency.id}/edit`}>
                    <Button size="icon" variant="ghost"><Pencil /></Button>
                  </Link>
                  {user?.role === 'admin' && (
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(agency.id)}><Trash2 color="#e11d48" /></Button>
                  )}
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
              {agencies.map((agency) => (
                <tr key={agency.id}>
                  <td className="px-4 py-2 border">{agency.name}</td>
                  <td className="px-4 py-2 border">{agency.email}</td>
                  <td className="px-4 py-2 border">{agency.phone}</td>
                  <td className="px-4 py-2 border flex gap-2">
                    <Link to={`/dashboard/agencies/${agency.id}/edit`}>
                      <Button size="icon" variant="ghost"><Pencil /></Button>
                    </Link>
                    {user?.role === 'admin' && (
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(agency.id)}><Trash2 color="#e11d48" /></Button>
                    )}
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

export default AgenciesList; 