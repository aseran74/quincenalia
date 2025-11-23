import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
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
import { Autocomplete, useLoadScript } from '@react-google-maps/api';
import { Bed, Bath, Toilet, Building2 } from 'lucide-react';

const propertySchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  price: z.coerce
    .number()
    .min(0, 'El precio debe ser mayor o igual a 0')
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
    .min(0, 'El área debe ser mayor o igual a 0')
    .nonnegative('El área no puede ser negativa'),
  zona: z.string().min(1, 'La zona es requerida'),
  lavabos: z.coerce
    .number()
    .int('El número de lavabos debe ser un entero')
    .min(0, 'El número de lavabos debe ser mayor o igual a 0'),
  url_externa_anuncio: z.string().url('Debe ser una URL válida').optional().or(z.literal('')).nullable(),
  tipo_vivienda: z.string().min(1, 'El tipo de vivienda es requerido'),
  features: z.array(z.string()).optional(),
  features_extra: z.array(z.string()).optional(),
  images: z.array(z.string().url('Debe ser una URL válida')).optional(),
  nearby_services: z.array(z.string()).optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  destacada: z.boolean().optional(),
  status: z.string().optional(),
  agent_id: z.string().optional().nullable(),
  agency_id: z.string().optional().nullable(),
  share1_price: z.coerce.number().optional().nullable(),
  share1_status: z.string().optional().nullable(),
  share1_owner_id: z.string().optional().nullable(),
  share2_price: z.coerce.number().optional().nullable(),
  share2_status: z.string().optional().nullable(),
  share2_owner_id: z.string().optional().nullable(),
  share3_price: z.coerce.number().optional().nullable(),
  share3_status: z.string().optional().nullable(),
  share3_owner_id: z.string().optional().nullable(),
  share4_price: z.coerce.number().optional().nullable(),
  share4_status: z.string().optional().nullable(),
  share4_owner_id: z.string().optional().nullable(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

const TIPO_VIVIENDA_OPTIONS = [
  'Piso o apartamento.',
  'Atico.',
  'Bajo con jardin.',
  'Chalet adosado.',
  'Chalet individual.',
  'Casa rural'
];

const STATUS_OPTIONS = ['disponible', 'reservada', 'vendida'];
const SHARE_STATUS_OPTIONS = ['disponible', 'reservada', 'vendida'];
const NEARBY_SERVICES_OPTIONS = [
  { value: 'playa_cercana', label: 'Playa cercana', icon: '🏖️' },
  { value: 'supermercados', label: 'Supermercados', icon: '🛒' },
  { value: 'vida_nocturna', label: 'Vida nocturna', icon: '🌃' },
  { value: 'parques_naturales', label: 'Parques naturales', icon: '🌳' },
  { value: 'deportes_nauticos', label: 'Deportes náuticos', icon: '🏄' },
  { value: 'puerto_deportivo', label: 'Puerto deportivo', icon: '⛵' },
  { value: 'farmacias', label: 'Farmacias', icon: '💊' },
];
const FEATURES_OPTIONS = [
  { value: 'Piscina', icon: '🏊' },
  { value: 'Jardín', icon: '🌳' },
  { value: 'Garaje', icon: '🚗' },
  { value: 'Trastero', icon: '📦' },
  { value: 'Ascensor', icon: '🛗' },
  { value: 'Terraza', icon: '🌅' },
  { value: 'Balcón', icon: '🏞️' },
  { value: 'Aire acondicionado', icon: '❄️' },
  { value: 'Vistas al mar', icon: '🌊' },
  { value: 'Vivienda accesible', icon: '♿' },
  { value: 'Vivienda de lujo', icon: '💎' },
  { value: 'Armarios empotrados', icon: '🚪' },
  { value: 'Exterior', icon: '🌤️' },
];

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const GOOGLE_MAPS_LIBRARIES = ["places"] as ["places"];

// Lista de zonas oficiales a partir de los nombres de las imágenes en /public
const ZONAS_OFICIALES = [
  'Costa de levante.',
  'Canarias.',
  'Baleares.',
  'Costa Catalana',
  'Andalucia',
  'Euskadi.',
  'Asturias.',
  'Galicia',
  'Murcia',
  'Zonas de interior.',
  'Marruecos',
  'República Dominicana'
];

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [owners, setOwners] = useState<{ id: string; name: string }[]>([]);
  const [agents, setAgents] = useState<{ id: string; name: string; agency_id?: string }[]>([]);
  const [agencies, setAgencies] = useState<{ id: string; name: string }[]>([]);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const { isLoaded } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY, libraries: GOOGLE_MAPS_LIBRARIES });
  const [initialValues, setInitialValues] = useState<PropertyFormValues | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [zonasUnicas, setZonasUnicas] = useState<string[]>([]);

  // Cargar propietarios, agentes y agencias
  useEffect(() => {
    const fetchData = async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, role, agency_id')
        .in('role', ['owner', 'agent']);
      
      if (profilesError) console.error('Error cargando perfiles:', profilesError);
      else {
        setOwners((profiles || []).filter(u => u.role === 'owner'));
        setAgents((profiles || []).filter(u => u.role === 'agent'));
      }

      const { data: agencias, error: agenciasError } = await supabase
        .from('real_estate_agencies')
        .select('id, name')
        .order('name');
        
      if (agenciasError) console.error('Error cargando agencias:', agenciasError);
      else setAgencies(agencias || []);
    };
    fetchData();
  }, []);

  // Cargar datos de la propiedad
  useEffect(() => {
    if (!id) return;
    const fetchProperty = async () => {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();
      if (error || !data) {
        toast({ title: 'Error', description: 'No se pudo cargar la propiedad', variant: 'destructive' });
        navigate('/dashboard/properties');
        return;
      }
      setInitialValues({
        ...data,
        images: data.images || [],
        features: data.features || [],
        features_extra: data.features_extra || [],
        nearby_services: data.nearby_services || [],
        destacada: !!data.destacada,
        lavabos: data.lavabos ?? 0,
        latitude: data.latitude,
        longitude: data.longitude,
        agency_id: data.agency_id || '', // Asegurar que agency_id se cargue
      });
      if (data.latitude && data.longitude) {
        setCoordinates({ lat: data.latitude, lng: data.longitude });
      }
    };
      fetchProperty();
  }, [id, navigate, toast]);

  // Obtener zonas únicas de la base de datos
  useEffect(() => {
    const fetchZonasUnicas = async () => {
      const { data, error } = await supabase.from('properties').select('zona');
      if (error) return;
      const zonasDB = Array.from(new Set((data || []).map((p: any) => (p.zona || '').trim()))).filter(z => z);
      // Unir zonas oficiales y de la base de datos, sin duplicados
      const zonas = Array.from(new Set([...ZONAS_OFICIALES, ...zonasDB]));
      setZonasUnicas(zonas);
    };
    fetchZonasUnicas();
  }, []);

  // Inicializar el formulario solo cuando initialValues está listo
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: initialValues || undefined,
  });

  // Hidratar el formulario solo una vez cuando initialValues cambia
  useEffect(() => {
    if (initialValues && !hydrated) {
      form.reset(initialValues);
      setHydrated(true);
    }
  }, [initialValues, hydrated, form]);

  // Añade esta función para obtener la URL pública de una imagen
  const getImageUrl = (img: string) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    // Si es solo el nombre de archivo, construye la URL pública:
    return `https://vpneiupvzsqzyrurcgmo.supabase.co/storage/v1/object/public/properties/${img}`;
  };

  // Modifica handleImageUpload para subir a Supabase Storage y guardar la URL pública
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const { error } = await supabase.storage.from('properties').upload(fileName, file);
      if (error) {
        toast({ title: 'Error', description: 'Error al subir imagen', variant: 'destructive' });
        continue;
      }
      const { data } = supabase.storage.from('properties').getPublicUrl(fileName);
      if (data?.publicUrl) uploadedUrls.push(data.publicUrl);
    }
    form.setValue('images', [...(form.getValues('images') || []), ...uploadedUrls]);
  };

  // Al seleccionar dirección en Google Places
  const handlePlaceSelect = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setCoordinates({ lat, lng });
        form.setValue('location', place.formatted_address);
        form.setValue('latitude', lat);
        form.setValue('longitude', lng);
      }
    }
  };

  const onSubmit = async (data: PropertyFormValues) => {
    try {
      if (!id) throw new Error('ID no proporcionado');
      const dataToSend = { ...data };
      [1,2,3,4].forEach(n => {
        if (dataToSend[`share${n}_status`] === 'disponible' || dataToSend[`share${n}_owner_id`] === null) {
          delete dataToSend[`share${n}_owner_id`];
        }
      });
      Object.keys(dataToSend).forEach(key => {
        if (key.endsWith('_id') && dataToSend[key] === "") {
          dataToSend[key] = null;
        }
      });
      const { error } = await supabase
        .from('properties')
        .update(dataToSend)
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Éxito', description: 'Propiedad actualizada correctamente' });
      setTimeout(() => {
        navigate('/dashboard/admin/properties');
      }, 1200);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Error al actualizar la propiedad', variant: 'destructive' });
    }
  };

  // Lógica para mover imágenes
  const moveImage = (fromIdx: number, toIdx: number) => {
    const images = [...form.getValues('images') || []];
    if (toIdx < 0 || toIdx >= images.length) return;
    const [moved] = images.splice(fromIdx, 1);
    images.splice(toIdx, 0, moved);
    form.setValue('images', images);
  };

  if (!initialValues || !hydrated) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Editar Propiedad</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Columna 1 */}
                <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                          <Input placeholder="Título de la propiedad" {...field} />
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
                          <Textarea placeholder="Descripción de la propiedad" {...field} rows={8} className="min-h-[180px]" />
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
                          <FormLabel>Precio (€)</FormLabel>
                      <FormControl>
                            <Input type="number" placeholder="Precio" {...field} />
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
                            <Input type="number" placeholder="Área" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
                  {/* Dormitorios, baños y aseo en la misma fila */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                          <FormLabel className="flex items-center gap-1"><Bed className="w-4 h-4" /> Dormitorios</FormLabel>
                      <FormControl>
                            <select {...field} className="w-full border rounded px-3 py-2 text-sm h-10">
                              <option value="">Dormitorios</option>
                              {[...Array(7).keys()].map(n => (
                                <option key={n+1} value={n+1}>{n+1}</option>
                              ))}
                            </select>
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
                          <FormLabel className="flex items-center gap-1"><Bath className="w-4 h-4" /> Baños</FormLabel>
                      <FormControl>
                            <select {...field} className="w-full border rounded px-3 py-2 text-sm h-10">
                              <option value="">Baños</option>
                              {[...Array(7).keys()].map(n => (
                                <option key={n+1} value={n+1}>{n+1}</option>
                              ))}
                            </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                      name="lavabos"
                  render={({ field }) => (
                    <FormItem>
                          <FormLabel className="flex items-center gap-1"><Toilet className="w-4 h-4" /> Aseo</FormLabel>
                      <FormControl>
                            <select {...field} className="w-full border rounded px-3 py-2 text-sm h-10">
                              <option value="">Aseo</option>
                              {[...Array(7).keys()].map(n => (
                                <option key={n+1} value={n+1}>{n+1}</option>
                              ))}
                            </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
                  {/* Ubicación con Google Places Autocomplete */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación</FormLabel>
                        <FormControl>
                          {isLoaded ? (
                            <Autocomplete
                              onLoad={ref => (autocompleteRef.current = ref)}
                              onPlaceChanged={handlePlaceSelect}
                            >
                              <Input
                                {...field}
                                className="w-full border-2 border-blue-400 text-lg py-3 px-4 font-semibold bg-blue-50"
                                placeholder="Busca una dirección..."
                                autoComplete="off"
                              />
                            </Autocomplete>
                          ) : (
                            <Input
                              {...field}
                              className="w-full border-2 border-blue-400 text-lg py-3 px-4 font-semibold bg-blue-50"
                              placeholder="Busca una dirección..."
                              autoComplete="off"
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Latitud/Longitud solo lectura */}
                  {coordinates && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">Latitud</label>
                        <Input value={coordinates.lat} readOnly className="bg-gray-100" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Longitud</label>
                        <Input value={coordinates.lng} readOnly className="bg-gray-100" />
                      </div>
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="tipo_vivienda"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de vivienda</FormLabel>
                        <FormControl>
                          <select {...field} className="w-full border rounded px-3 py-2 text-sm h-10">
                            <option value="">Selecciona un tipo</option>
                            {TIPO_VIVIENDA_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zona"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zona</FormLabel>
                        <FormControl>
                          <select {...field} className="w-full border rounded px-3 py-2 text-sm h-10">
                            <option value="">Selecciona una zona</option>
                            {zonasUnicas.length === 0 && <option disabled value="">No hay zonas disponibles</option>}
                            {zonasUnicas.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="url_externa_anuncio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL externa anuncio</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." type="url" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* Columna 2 */}
                <div className="space-y-6">
                  {/* Subida de imágenes */}
                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imágenes</FormLabel>
                        <FormControl>
                          <div>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              ref={fileInputRef}
                              style={{ display: 'none' }}
                              onChange={handleImageUpload}
                            />
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                              Subir imágenes
                            </Button>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {field.value?.map((img, idx) => (
                                <div key={idx} className="relative w-24 h-24 border rounded overflow-hidden flex flex-col items-center">
                                  <img src={getImageUrl(img)} alt={`img-${idx}`} className="object-cover w-full h-full" />
                                  <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      disabled={idx === 0}
                                      onClick={() => moveImage(idx, idx - 1)}
                                    >⬅️</Button>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      disabled={idx === field.value.length - 1}
                                      onClick={() => moveImage(idx, idx + 1)}
                                    >➡️</Button>
                                  </div>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="destructive"
                                    className="absolute top-1 right-1"
                                    onClick={() => {
                                      const arr = [...field.value];
                                      arr.splice(idx, 1);
                                      field.onChange(arr);
                                    }}
                                  >
                                    ×
                                  </Button>
                                  {idx === 0 && (
                                    <span className="absolute top-1 left-1 bg-yellow-400 text-xs px-1 rounded">Destacada</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Características (checkboxes con iconos) */}
                  <FormField
                    control={form.control}
                    name="features"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Características</FormLabel>
                        <FormControl>
                          <div className="flex flex-wrap gap-2">
                            {FEATURES_OPTIONS.map(opt => (
                              <label key={opt.value} className="flex items-center gap-1 cursor-pointer border rounded px-2 py-1">
                                <input
                                  type="checkbox"
                                  checked={field.value?.includes(opt.value) || false}
                                  onChange={e => {
                                    if (e.target.checked) {
                                      field.onChange([...(field.value || []), opt.value]);
                                    } else {
                                      field.onChange((field.value || []).filter(v => v !== opt.value));
                                    }
                                  }}
                                />
                                <span>{opt.icon}</span>
                                <span>{opt.value}</span>
                              </label>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Servicios cercanos (checkboxes con iconos) */}
                  <FormField
                    control={form.control}
                    name="nearby_services"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Servicios Cercanos</FormLabel>
                        <FormControl>
                          <div className="flex flex-wrap gap-2">
                            {NEARBY_SERVICES_OPTIONS.map(opt => (
                              <label key={opt.value} className="flex items-center gap-1 cursor-pointer border rounded px-2 py-1">
                                <input
                                  type="checkbox"
                                  checked={field.value?.includes(opt.value) || false}
                                  onChange={e => {
                                    if (e.target.checked) {
                                      field.onChange([...(field.value || []), opt.value]);
                                    } else {
                                      field.onChange((field.value || []).filter(v => v !== opt.value));
                                    }
                                  }}
                                />
                                <span>{opt.icon}</span>
                                <span>{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Estado de la propiedad */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <select {...field} className="w-full border rounded px-3 py-2 text-sm h-10">
                            <option value="">Selecciona un estado</option>
                            {STATUS_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Agencia y Agente */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="agency_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agencia</FormLabel>
                          <FormControl>
                            <select {...field} className="w-full border rounded px-3 py-2 text-sm h-10" onChange={(e) => {
                                field.onChange(e);
                                form.setValue('agent_id', ''); // Reset agent on agency change
                            }}>
                              <option value="">Selecciona una agencia</option>
                              {agencies.map(agency => (
                                <option key={agency.id} value={agency.id}>{agency.name}</option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="agent_id"
                      render={({ field }) => {
                         const selectedAgencyId = form.watch('agency_id');
                         const filteredAgents = selectedAgencyId 
                           ? agents.filter(a => a.agency_id === selectedAgencyId)
                           : agents;

                         return (
                          <FormItem>
                            <FormLabel>Agente</FormLabel>
                            <FormControl>
                              <select {...field} className="w-full border rounded px-3 py-2 text-sm h-10">
                                <option value="">Selecciona un agente</option>
                                {filteredAgents.length === 0 && <option disabled value="">No hay agentes disponibles {selectedAgencyId ? 'en esta agencia' : ''}</option>}
                                {filteredAgents.map(agent => (
                                  <option key={agent.id} value={agent.id}>{agent.name ? agent.name : 'Sin nombre'}</option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                         );
                      }}
                    />
                  </div>
                  {/* Copropiedades (4 fijas, solo lectura, precio calculado) */}
                  <div className="space-y-4">
                    {[1,2,3,4].map(n => (
                      <div key={n} className="border rounded p-2 bg-gray-50">
                        <div className="font-semibold mb-2">Copropiedad {n}</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500">Precio</label>
                            <Input value={form.getValues('price') ? (Number(form.getValues('price'))/4).toFixed(2) : ''} readOnly className="bg-gray-100" />
                          </div>
              <FormField
                control={form.control}
                            name={`share${n}_status` as any}
                render={({ field }) => (
                  <FormItem>
                                <FormLabel>Estado</FormLabel>
                    <FormControl>
                                  <select {...field} className="w-full border rounded px-3 py-2 text-sm h-10">
                                    <option value="">Selecciona estado</option>
                                    {SHARE_STATUS_OPTIONS.map(opt => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                          <FormField
                            control={form.control}
                            name={`share${n}_owner_id` as any}
                            render={({ field }) => {
                              const status = form.getValues(`share${n}_status` as any);
                              // Si el valor es null o el estado es disponible, forzamos string vacío y deshabilitamos
                              const value = status === 'disponible' || field.value == null ? '' : field.value;
                              return (
                                <FormItem>
                                  <FormLabel>Propietario</FormLabel>
                                  <FormControl>
                                    <select
                                      {...field}
                                      className="w-full border rounded px-3 py-2 text-sm h-10"
                                      disabled={status === 'disponible'}
                                      value={value}
                                      onChange={e => field.onChange(e.target.value)}
                                    >
                                      <option value="">Selecciona propietario</option>
                                      {owners.map(owner => (
                                        <option key={owner.id} value={owner.id}>{owner.name}</option>
                                      ))}
                                    </select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Destacada */}
                  <div className="flex items-center gap-6">
                  <FormField
                    control={form.control}
                    name="destacada"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <input
                            type="checkbox"
                            checked={field.value || false}
                            onChange={e => field.onChange(e.target.checked)}
                            className="mr-2"
                          />
                          Propiedad destacada
                        </FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                    <FormField
                      control={form.control}
                      name="features"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.value?.includes('Obra nueva') || false}
                              onChange={e => {
                                if (e.target.checked) {
                                  field.onChange([...(field.value || []), 'Obra nueva']);
                                } else {
                                  field.onChange((field.value || []).filter((v: string) => v !== 'Obra nueva'));
                                }
                              }}
                              className="mr-2"
                            />
                            <Building2 className="w-5 h-5 text-orange-400 mr-1" /> Obra nueva
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard/properties')}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProperty; 