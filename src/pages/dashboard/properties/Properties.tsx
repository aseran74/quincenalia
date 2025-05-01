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
import { LayoutGrid, List, Plus, Pencil, Trash2 } from 'lucide-react';
import { PropertiesList } from './PropertiesList';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

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

// Hook para detectar si la pantalla es móvil (breakpoint sm: 640px)
const useIsMobile = (breakpoint = 640) => {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);
  return isMobile;
};

function PropertyMobileCard({ property, onDelete, onEdit }) {
  const navigate = useNavigate();
  const [imgIdx, setImgIdx] = React.useState(0);
  const totalImgs = property.images && property.images.length > 0 ? property.images.length : 0;
  const currentImg = totalImgs > 0 ? property.images[imgIdx] : null;
  const autoSlideRef = React.useRef(null);

  // Slide automático
  React.useEffect(() => {
    if (totalImgs <= 1) return;
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    autoSlideRef.current = setInterval(() => {
      setImgIdx(idx => (idx + 1) % totalImgs);
    }, 2500);
    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [totalImgs]);

  // Reinicia el temporizador si se navega manualmente
  const handlePrev = (e) => {
    e.stopPropagation();
    setImgIdx(idx => (idx - 1 + totalImgs) % totalImgs);
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    autoSlideRef.current = setInterval(() => {
      setImgIdx(idx => (idx + 1) % totalImgs);
    }, 2500);
  };
  const handleNext = (e) => {
    e.stopPropagation();
    setImgIdx(idx => (idx + 1) % totalImgs);
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    autoSlideRef.current = setInterval(() => {
      setImgIdx(idx => (idx + 1) % totalImgs);
    }, 2500);
  };

  return (
    <Card className="mb-4 overflow-hidden relative">
      <div
        className="relative w-full h-40 group cursor-pointer"
        onClick={() => navigate(`/dashboard/properties/${property.id}`)}
      >
        {currentImg ? (
          <img src={currentImg} alt={property.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:opacity-80" />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">Sin imagen</div>
        )}
        <div className="absolute inset-0 flex flex-col justify-end p-4 transition-colors pointer-events-none">
          <CardTitle className="text-white text-lg mb-1 line-clamp-2 drop-shadow font-semibold bg-black/60 px-2 py-1 rounded w-fit">{property.title}</CardTitle>
          <p className="text-white text-xs mb-1 bg-black/60 px-2 py-0.5 rounded w-fit"><strong>Ubicación:</strong> {property.location}</p>
          <p className="text-white text-xs bg-black/60 px-2 py-0.5 rounded w-fit"><strong>Precio:</strong> €{property.price.toLocaleString()}</p>
        </div>
        {totalImgs > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center z-10"
              onClick={handlePrev}
              aria-label="Anterior"
            >
              &#8592;
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center z-10"
              onClick={handleNext}
              aria-label="Siguiente"
            >
              &#8594;
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {property.images.map((_, i) => (
                <span key={i} className={`w-2 h-2 rounded-full ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`}></span>
              ))}
            </div>
          </>
        )}
      </div>
      <CardContent className="pt-3 pb-4 px-4 bg-[#222]">
        <div className="flex flex-wrap gap-3 text-white text-sm">
          <span><strong>Habitaciones:</strong> {property.bedrooms}</span>
          <span><strong>Baños:</strong> {property.bathrooms}</span>
          <span><strong>Área:</strong> {property.area} m²</span>
        </div>
        <div className="flex space-x-2 mt-4">
          <Button size="sm" variant="outline" onClick={() => onEdit(property.id)} className="flex-1">
            <Pencil className="mr-1 h-4 w-4" /> Editar
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(property.id)} className="flex-1">
            <Trash2 className="mr-1 h-4 w-4" /> Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const Properties = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filter, setFilter] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  const handleEdit = (id: string) => {
    navigate(`/dashboard/properties/${id}/edit`);
  };

  // Filtrado por nombre
  const filteredProperties = properties.filter((property) =>
    property.title.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
            <CardTitle className="mb-2 sm:mb-0">Propiedades</CardTitle>
            <input
              type="text"
              placeholder="Filtrar por nombre..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="border rounded px-3 py-1 text-sm w-full sm:w-64"
            />
            <Tabs value={viewMode} onValueChange={v => setViewMode(v as 'grid' | 'table')}>
              <TabsList>
                <TabsTrigger value="grid">
                  <LayoutGrid className="h-5 w-5 mr-2" /> Grid
                </TabsTrigger>
                <TabsTrigger value="table">
                  <List className="h-5 w-5 mr-2" /> Tabla
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <Button onClick={() => navigate('/dashboard/properties/add')}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Propiedad
          </Button>
        </CardHeader>
        <CardContent>
          {filteredProperties.length === 0 ? (
            <div className="text-center py-8">No hay propiedades registradas</div>
          ) : (
            isMobile ? (
              <div className="space-y-4">
                {filteredProperties.map((property) => (
                  <PropertyMobileCard
                    key={property.id}
                    property={property}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            ) : (
              viewMode === 'grid' ? (
                <PropertiesList properties={filteredProperties} onDelete={handleDelete} />
              ) : (
                <TableView properties={filteredProperties} onDelete={handleDelete} />
              )
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Properties; 