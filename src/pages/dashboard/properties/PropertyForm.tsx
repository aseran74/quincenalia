import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { HiOutlineArrowLeft, HiOutlinePhoto, HiOutlineTrash } from "react-icons/hi2";

type ShareStatus = 'disponible' | 'reservado' | 'vendido';

interface Property {
  id?: string;
  title: string;
  description?: string;
  price: number;
  status?: ShareStatus;
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  location?: string;
  user_id: string | null;
  share1_status?: ShareStatus;
  share2_status?: ShareStatus;
  share3_status?: ShareStatus;
  share4_status?: ShareStatus;
}

const PropertyForm: React.FC<{ isEditing?: boolean }> = ({ isEditing = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && user) {
      setProperty({
        title: '',
        description: '',
        price: 0,
        status: 'disponible',
        images: [],
        bedrooms: 0,
        bathrooms: 0,
        area: 0,
        location: '',
        user_id: user.id,
        share1_status: 'disponible',
        share2_status: 'disponible',
        share3_status: 'disponible',
        share4_status: 'disponible',
      });
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (isEditing && id && !authLoading) {
      fetchProperty();
    }
  }, [id, isEditing, authLoading]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setProperty({
          ...data,
          user_id: user?.id || null
        });
        if (data.images) {
          setPreviewImages(data.images);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar la propiedad',
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const newImages: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('properties')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('properties')
          .getPublicUrl(fileName);

        newImages.push(publicUrl);
      }

      setProperty(prev => prev ? ({
        ...prev,
        images: [...(prev.images || []), ...newImages]
      }) : null);
      setPreviewImages(prev => [...prev, ...newImages]);

      toast({
        title: 'Éxito',
        description: 'Imágenes subidas correctamente',
      });
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      toast({
        title: 'Error',
        description: 'Error al subir las imágenes',
        variant: 'destructive',
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    if (!property?.images) return;
    
    try {
      const imageUrl = property.images[index];
      if (!imageUrl) return;

      // Extraer el nombre del archivo de la URL
      const fileName = imageUrl.split('/').pop();
      if (!fileName) return;

      const { error } = await supabase.storage
        .from('properties')
        .remove([fileName]);

      if (error) throw error;

      const newImages = property.images.filter((_, i) => i !== index);
      setProperty(prev => prev ? ({ ...prev, images: newImages }) : null);
      setPreviewImages(newImages);

      toast({
        title: 'Éxito',
        description: 'Imagen eliminada correctamente',
      });
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      toast({
        title: 'Error',
        description: 'Error al eliminar la imagen',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para realizar esta acción',
        variant: 'destructive',
      });
      return;
    }

    if (!property) {
      toast({
        title: 'Error',
        description: 'No hay datos de la propiedad para guardar',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const propertyData = {
        ...property,
        user_id: user.id
      };

      if (isEditing) {
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', id);

        if (error) throw error;
      } else {
        // Cuando creamos una nueva propiedad, omitimos el id
        const { id, ...newPropertyData } = propertyData;
        const { error } = await supabase
          .from('properties')
          .insert([newPropertyData]);

        if (error) throw error;
      }

      toast({
        title: 'Éxito',
        description: `Propiedad ${isEditing ? 'actualizada' : 'creada'} correctamente`,
      });
      navigate('/dashboard/properties');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: `Error al ${isEditing ? 'actualizar' : 'crear'} la propiedad`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !property) {
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
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/dashboard/properties')}>
              <HiOutlineArrowLeft className="h-5 w-5 mr-2" />
              Volver
            </Button>
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Editar Propiedad' : 'Nueva Propiedad'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={property.title}
                      onChange={(e) => setProperty({ ...property, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={property.description}
                      onChange={(e) => setProperty({ ...property, description: e.target.value })}
                      className="h-32"
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Precio (€)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={property.price}
                      onChange={(e) => setProperty({ ...property, price: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={property.status}
                      onValueChange={(value) => setProperty({ ...property, status: value as Property['status'] })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disponible">Disponible</SelectItem>
                        <SelectItem value="reservado">Reservado</SelectItem>
                        <SelectItem value="vendido">Vendido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Estado de Copropiedades</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="share1">Copropiedad 1</Label>
                        <Select
                          value={property.share1_status}
                          onValueChange={(value) => setProperty({ ...property, share1_status: value as ShareStatus })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="disponible">Disponible</SelectItem>
                            <SelectItem value="reservado">Reservado</SelectItem>
                            <SelectItem value="vendido">Vendido</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="share2">Copropiedad 2</Label>
                        <Select
                          value={property.share2_status}
                          onValueChange={(value) => setProperty({ ...property, share2_status: value as ShareStatus })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="disponible">Disponible</SelectItem>
                            <SelectItem value="reservado">Reservado</SelectItem>
                            <SelectItem value="vendido">Vendido</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="share3">Copropiedad 3</Label>
                        <Select
                          value={property.share3_status}
                          onValueChange={(value) => setProperty({ ...property, share3_status: value as ShareStatus })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="disponible">Disponible</SelectItem>
                            <SelectItem value="reservado">Reservado</SelectItem>
                            <SelectItem value="vendido">Vendido</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="share4">Copropiedad 4</Label>
                        <Select
                          value={property.share4_status}
                          onValueChange={(value) => setProperty({ ...property, share4_status: value as ShareStatus })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="disponible">Disponible</SelectItem>
                            <SelectItem value="reservado">Reservado</SelectItem>
                            <SelectItem value="vendido">Vendido</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      value={property.location}
                      onChange={(e) => setProperty({ ...property, location: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="bedrooms">Habitaciones</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        value={property.bedrooms}
                        onChange={(e) => setProperty({ ...property, bedrooms: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bathrooms">Baños</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        value={property.bathrooms}
                        onChange={(e) => setProperty({ ...property, bathrooms: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="area">Área (m²)</Label>
                      <Input
                        id="area"
                        type="number"
                        value={property.area}
                        onChange={(e) => setProperty({ ...property, area: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Imágenes</Label>
                    <div className="mt-2 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {previewImages.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Imagen ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <HiOutlineTrash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                          <HiOutlinePhoto className="h-8 w-8 text-gray-400" />
                          <span className="mt-2 text-sm text-gray-500">Agregar imágenes</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={uploadingImages}
                          />
                        </label>
                      </div>
                      {uploadingImages && (
                        <div className="flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <Button
                  type="submit"
                  disabled={loading || uploadingImages}
                  className="min-w-[150px]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    isEditing ? 'Guardar Cambios' : 'Crear Propiedad'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm; 