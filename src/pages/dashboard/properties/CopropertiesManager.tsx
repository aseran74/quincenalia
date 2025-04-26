import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash, Save, X } from 'lucide-react';

interface Copropiedad {
  id: string;
  nombre: string;
  descripcion: string;
  caracteristicas: string[];
}

const CopropertiesManager: React.FC = () => {
  const navigate = useNavigate();
  const [copropiedades, setCopropiedades] = useState<Copropiedad[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCopropiedades();
  }, []);

  const fetchCopropiedades = async () => {
    try {
      const { data, error } = await supabase
        .from('copropiedades')
        .select('*')
        .order('nombre');

      if (error) throw error;
      setCopropiedades(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar las copropiedades',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleSave = async (copropiedad: Copropiedad) => {
    try {
      const { error } = await supabase
        .from('copropiedades')
        .update({
          nombre: copropiedad.nombre,
          descripcion: copropiedad.descripcion,
          caracteristicas: copropiedad.caracteristicas
        })
        .eq('id', copropiedad.id);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Copropiedad actualizada correctamente',
      });

      setEditingId(null);
      fetchCopropiedades();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar la copropiedad',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleAddCaracteristica = (copropiedad: Copropiedad) => {
    const newCaracteristica = '';
    const updatedCopropiedad = {
      ...copropiedad,
      caracteristicas: [...copropiedad.caracteristicas, newCaracteristica]
    };
    setCopropiedades(copropiedades.map(c => 
      c.id === copropiedad.id ? updatedCopropiedad : c
    ));
  };

  const handleRemoveCaracteristica = (copropiedad: Copropiedad, index: number) => {
    const updatedCaracteristicas = copropiedad.caracteristicas.filter((_, i) => i !== index);
    const updatedCopropiedad = {
      ...copropiedad,
      caracteristicas: updatedCaracteristicas
    };
    setCopropiedades(copropiedades.map(c => 
      c.id === copropiedad.id ? updatedCopropiedad : c
    ));
  };

  const handleUpdateCaracteristica = (
    copropiedad: Copropiedad,
    index: number,
    value: string
  ) => {
    const updatedCaracteristicas = [...copropiedad.caracteristicas];
    updatedCaracteristicas[index] = value;
    const updatedCopropiedad = {
      ...copropiedad,
      caracteristicas: updatedCaracteristicas
    };
    setCopropiedades(copropiedades.map(c => 
      c.id === copropiedad.id ? updatedCopropiedad : c
    ));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Cargando...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Copropiedades</h1>
        <Button variant="outline" onClick={() => navigate('/dashboard/properties')}>
          Volver
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {copropiedades.map((copropiedad) => (
          <Card key={copropiedad.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {editingId === copropiedad.id ? (
                  <Input
                    value={copropiedad.nombre}
                    onChange={(e) => setCopropiedades(copropiedades.map(c => 
                      c.id === copropiedad.id ? { ...c, nombre: e.target.value } : c
                    ))}
                  />
                ) : (
                  copropiedad.nombre
                )}
                <div className="flex space-x-2">
                  {editingId === copropiedad.id ? (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSave(copropiedad)}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancel}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(copropiedad.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Descripción</Label>
                  {editingId === copropiedad.id ? (
                    <textarea
                      className="w-full min-h-[100px] p-2 border rounded-md mt-2"
                      value={copropiedad.descripcion}
                      onChange={(e) => setCopropiedades(copropiedades.map(c => 
                        c.id === copropiedad.id ? { ...c, descripcion: e.target.value } : c
                      ))}
                    />
                  ) : (
                    <p className="text-gray-600 mt-1">{copropiedad.descripcion}</p>
                  )}
                </div>

                <div>
                  <Label>Características</Label>
                  <div className="space-y-2 mt-2">
                    {copropiedad.caracteristicas.map((caracteristica, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {editingId === copropiedad.id ? (
                          <>
                            <Input
                              value={caracteristica}
                              onChange={(e) => handleUpdateCaracteristica(
                                copropiedad,
                                index,
                                e.target.value
                              )}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveCaracteristica(copropiedad, index)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <p className="text-gray-600">• {caracteristica}</p>
                        )}
                      </div>
                    ))}
                    {editingId === copropiedad.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddCaracteristica(copropiedad)}
                      >
                        Añadir Característica
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CopropertiesManager; 