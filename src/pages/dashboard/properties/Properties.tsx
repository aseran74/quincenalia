import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { LayoutGrid, List, Plus } from 'lucide-react';
import { PropertiesList } from './PropertiesList';

interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  status?: 'disponible' | 'reservado' | 'vendido';
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  location?: string;
}

const TableView = ({ properties, onDelete }: { properties: Property[], onDelete: (id: string) => void }) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Habitaciones</TableHead>
            <TableHead>Baños</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No hay propiedades registradas
              </TableCell>
            </TableRow>
          ) : (
            properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell>{property.title}</TableCell>
                <TableCell>{property.location || '-'}</TableCell>
                <TableCell>€{property.price?.toLocaleString() || '0'}</TableCell>
                <TableCell>{property.bedrooms || 0}</TableCell>
                <TableCell>{property.bathrooms || 0}</TableCell>
                <TableCell>{property.area || 0} m²</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/dashboard/properties/${property.id}`)}
                    >
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/dashboard/properties/${property.id}/edit`)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(property.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

const Properties = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar las propiedades',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta propiedad?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProperties(properties.filter(property => property.id !== id));
      toast({
        title: 'Éxito',
        description: 'Propiedad eliminada correctamente',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Error al eliminar la propiedad',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Propiedades</h1>
          <div className="flex items-center space-x-4">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'table')}>
              <TabsList>
                <TabsTrigger value="grid">
                  <LayoutGrid className="h-5 w-5 mr-2" />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="table">
                  <List className="h-5 w-5 mr-2" />
                  Lista
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button onClick={() => navigate('/dashboard/properties/new')}>
              <Plus className="h-5 w-5 mr-2" />
              Nueva Propiedad
            </Button>
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No hay propiedades registradas</p>
            <Button onClick={() => navigate('/dashboard/properties/new')}>
              <Plus className="h-5 w-5 mr-2" />
              Crear primera propiedad
            </Button>
          </div>
        ) : (
          viewMode === 'grid' ? (
            <PropertiesList properties={properties} onDelete={handleDelete} />
          ) : (
            <TableView properties={properties} onDelete={handleDelete} />
          )
        )}
      </div>
    </div>
  );
};

export default Properties; 