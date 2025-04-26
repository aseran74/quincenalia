import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const propertySchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  price: z.coerce
    .number()
    .min(0, 'El precio debe ser mayor a 0')
    .nonnegative('El precio no puede ser negativo'),
  location: z.string().min(1, 'La ubicación es requerida'),
  bedrooms: z.coerce
    .number()
    .int('El número de habitaciones debe ser un entero')
    .min(0, 'El número de habitaciones debe ser mayor o igual a 0'),
  bathrooms: z.coerce
    .number()
    .int('El número de baños debe ser un entero')
    .min(0, 'El número de baños debe ser mayor o igual a 0'),
  area: z.coerce
    .number()
    .min(0, 'El área debe ser mayor a 0')
    .nonnegative('El área no puede ser negativa'),
  image_url: z.string().optional(),
  features: z.array(z.string()).optional(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      location: '',
      bedrooms: 0,
      bathrooms: 0,
      area: 0,
      image_url: '',
      features: [],
    },
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        if (!id) throw new Error('ID no proporcionado');

        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Propiedad no encontrada');
        
        form.reset(data);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: 'Error',
          description: 'Error al cargar los datos de la propiedad',
          variant: 'destructive',
        });
        navigate('/dashboard/properties');
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id, form, navigate, toast]);

  const onSubmit = async (data: PropertyFormValues) => {
    try {
      if (!id) throw new Error('ID no proporcionado');

      const { error } = await supabase
        .from('properties')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Éxito',
        description: 'Propiedad actualizada correctamente',
      });
      
      navigate('/dashboard/properties');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar la propiedad',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Editar Propiedad</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Habitaciones</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Baños</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área (m²)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de la imagen</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard/properties')}
                >
                  Cancelar
                </Button>
                <Button type="submit">Guardar Cambios</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProperty; 