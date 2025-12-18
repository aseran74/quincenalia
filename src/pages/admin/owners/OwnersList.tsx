import React, { useMemo, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Pencil, Trash2, Plus, Home, Mail, Phone, Search, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

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
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'owner');

      if (error) throw error;
      setOwners(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los propietarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredOwners = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return owners;
    return owners.filter((o) => {
      const fullName = `${o.first_name || ''} ${o.last_name || ''}`.trim().toLowerCase();
      const email = (o.email || '').toLowerCase();
      const phone = (o.phone || '').toLowerCase();
      return fullName.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [owners, query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold">Propietarios</h1>
          <Button onClick={() => navigate('/dashboard/admin/owners/new')}>
            <Plus className="h-5 w-5 mr-2" />
            Nuevo Propietario
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar propietario por nombre, email o teléfono..."
              className="pl-9 pr-9"
            />
            {query.trim() && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>
          <div className="text-sm text-gray-600">
            Mostrando <b>{filteredOwners.length}</b> de <b>{owners.length}</b>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOwners.map((owner) => (
          <Card 
            key={owner.id}
            className="group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => navigate(`/dashboard/admin/owners/${owner.id}`)}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={owner.photo_url} alt={`${owner.first_name} ${owner.last_name}`} />
                  <AvatarFallback className="bg-blue-500 text-white text-xl">
                    {(owner.first_name?.[0] || '?')}{(owner.last_name?.[0] || '')}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <CardTitle className="text-xl font-bold mb-2">
                    {owner.first_name} {owner.last_name}
                  </CardTitle>
                  
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="h-4 w-4" />
                      <p className="text-sm truncate">{owner.email}</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4" />
                      <p className="text-sm">{owner.phone}</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Home className="h-4 w-4" />
                      <p className="text-sm">{owner.properties?.length || 0} propiedades</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/admin/owners/${owner.id}/edit`);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm('¿Estás seguro de que quieres eliminar este propietario?')) {
                        const { error } = await supabase
                          .from('profiles')
                          .delete()
                          .eq('id', owner.id);
                        
                        if (error) {
                          toast({
                            title: "Error",
                            description: "No se pudo eliminar el propietario",
                            variant: "destructive",
                          });
                        } else {
                          fetchOwners();
                          toast({
                            title: "Éxito",
                            description: "Propietario eliminado correctamente",
                          });
                        }
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!filteredOwners.length && owners.length > 0 && (
        <div className="mt-10 text-center text-gray-600">
          No hay resultados para <b>{query.trim()}</b>.
        </div>
      )}
    </div>
  );
};

export default OwnersList; 
