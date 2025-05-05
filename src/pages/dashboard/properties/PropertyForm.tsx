import React, { useState, useEffect, FC } from 'react';
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
import { HiOutlineArrowLeft, HiOutlinePhoto, HiOutlineTrash, HiOutlineHome, HiOutlineUser, HiOutlineDocumentText, HiOutlineSparkles, HiOutlineCake, HiOutlineKey } from "react-icons/hi2";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from '@/components/ui/command';
import { FaSwimmingPool, FaHotTub, FaChild, FaGamepad, FaUmbrellaBeach, FaParking, FaShoppingCart, FaGlassCheers, FaTree, FaWater, FaShip, FaPrescriptionBottleAlt } from 'react-icons/fa';
import { GoogleMap, Marker, useLoadScript, Autocomplete } from '@react-google-maps/api';
import { geocodeAddress } from '@/utils/geocoding';
import { Checkbox } from '@/components/ui/checkbox';
import { addDays, format } from 'date-fns';

type ShareStatus = 'disponible' | 'reservada' | 'vendida';

const NEARBY_SERVICES = [
  { key: 'playa_cercana', label: 'Playa cercana', icon: <FaUmbrellaBeach className="w-6 h-6 text-cyan-500" /> },
  { key: 'supermercados', label: 'Supermercados', icon: <FaShoppingCart className="w-6 h-6 text-green-500" /> },
  { key: 'vida_nocturna', label: 'Vida nocturna', icon: <FaGlassCheers className="w-6 h-6 text-purple-500" /> },
  { key: 'parques_naturales', label: 'Parques naturales', icon: <FaTree className="w-6 h-6 text-green-600" /> },
  { key: 'deportes_nauticos', label: 'Deportes náuticos', icon: <FaWater className="w-6 h-6 text-blue-500" /> },
  { key: 'puerto_deportivo', label: 'Puerto deportivo', icon: <FaShip className="w-6 h-6 text-blue-600" /> },
  { key: 'farmacias', label: 'Farmacias', icon: <FaPrescriptionBottleAlt className="w-6 h-6 text-red-500" /> },
];

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
  latitude?: number;
  longitude?: number;
  user_id: string | null;
  agent_id?: string | null;
  features?: string[];
  // Share 1: 1ª quincena Julio + 10 sem
  share1_status: ShareStatus;
  share1_owner_id: string | null;
  share1_price: number;
  // Share 2: 2ª quincena Julio + 10 sem
  share2_status: ShareStatus;
  share2_owner_id: string | null;
  share2_price: number;
  // Share 3: 1ª quincena Agosto + 10 sem
  share3_status: ShareStatus;
  share3_owner_id: string | null;
  share3_price: number;
  // Share 4: 2ª quincena Agosto + 10 sem
  share4_status: ShareStatus;
  share4_owner_id: string | null;
  share4_price: number;
  nearby_services?: string[];
  tipo_vivienda?: string;
  features_extra?: string[];
  destacada?: boolean;
}

const FEATURES = [
  { key: 'piscina_privada', label: 'Piscina privada', icon: <FaSwimmingPool className="w-6 h-6 text-blue-500" /> },
  { key: 'jacuzzi', label: 'Jacuzzi', icon: <FaHotTub className="w-6 h-6 text-pink-500" /> },
  { key: 'juegos_ninos', label: 'Juegos para niños', icon: <FaChild className="w-6 h-6 text-yellow-500" /> },
  { key: 'videoconsolas', label: 'Videoconsolas', icon: <FaGamepad className="w-6 h-6 text-green-500" /> },
  { key: 'acceso_playa', label: 'Acceso playa', icon: <FaUmbrellaBeach className="w-6 h-6 text-cyan-500" /> },
  { key: 'parking_gratuito', label: 'Parking gratuito', icon: <FaParking className="w-6 h-6 text-gray-700" /> },
];

const TIPO_VIVIENDA_OPTIONS = [
  { value: 'Piso', label: 'Piso' },
  { value: 'Ático', label: 'Ático' },
  { value: 'Dúplex', label: 'Dúplex' },
  { value: 'Casa independiente', label: 'Casa independiente' },
  { value: 'Casa pareada', label: 'Casa pareada' },
  { value: 'Casa adosada', label: 'Casa adosada' },
  { value: 'Casa rústica', label: 'Casa rústica' },
];

const FEATURES_EXTRA = [
  'Aire acondicionado',
  'Armarios empotrados',
  'Ascensor',
  'Balcón',
  'Terraza',
  'Exterior',
  'Garaje',
  'Jardín',
  'Piscina',
  'Trastero',
  'Vivienda accesible',
  'Vistas al mar',
  'Vivienda de lujo',
];

const GOOGLE_MAPS_API_KEY = "AIzaSyBy4MuV_fOnPJF-WoxQbBlnKj8dMF6KuxM";
const GOOGLE_MAPS_LIBRARIES: ["places"] = ["places"];

interface PropertyFormProps {
  isEditing?: boolean;
}

// Función auxiliar para obtener las fechas fijas de cada quincena
const QUINCENAS = [
  // share1: 1ª quincena Julio
  { share: 1, start: (year: number) => `${year}-07-01`, end: (year: number) => `${year}-07-15` },
  // share2: 2ª quincena Julio
  { share: 2, start: (year: number) => `${year}-07-16`, end: (year: number) => `${year}-07-31` },
  // share3: 1ª quincena Agosto
  { share: 3, start: (year: number) => `${year}-08-01`, end: (year: number) => `${year}-08-15` },
  // share4: 2ª quincena Agosto
  { share: 4, start: (year: number) => `${year}-08-16`, end: (year: number) => `${year}-08-31` },
];

// Función para validar UUID
function isValidUUID(uuid: string | null | undefined) {
  return typeof uuid === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uuid);
}

const PropertyForm: FC<PropertyFormProps> = ({ isEditing = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [agents, setAgents] = useState<{ id: string; name: string; email: string; phone: string }[]>([]);
  const [agentQuery, setAgentQuery] = useState('');
  const [owners, setOwners] = useState<{ id: string; name: string; email: string; phone: string }[]>([]);
  const [ownerQuery1, setOwnerQuery1] = useState('');
  const [ownerQuery2, setOwnerQuery2] = useState('');
  const [ownerQuery3, setOwnerQuery3] = useState('');
  const [ownerQuery4, setOwnerQuery4] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const { isLoaded } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY, libraries: GOOGLE_MAPS_LIBRARIES });
  const autocompleteRef = React.useRef<any>(null);

  useEffect(() => {
    if (!authLoading && user && !isEditing) {
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
        agent_id: null,
        features: [],
        nearby_services: [],
        // Inicializar los shares
        share1_status: 'disponible',
        share1_owner_id: null,
        share1_price: 0,
        share2_status: 'disponible',
        share2_owner_id: null,
        share2_price: 0,
        share3_status: 'disponible',
        share3_owner_id: null,
        share3_price: 0,
        share4_status: 'disponible',
        share4_owner_id: null,
        share4_price: 0,
        tipo_vivienda: '',
        features_extra: [],
        destacada: false,
      });
    }
  }, [user, authLoading, isEditing]);

  useEffect(() => {
    if (isEditing && id && !authLoading) {
      fetchProperty();
    }
  }, [id, isEditing, authLoading]);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    fetchOwners();
  }, []);

  useEffect(() => {
    if (property?.location && !coordinates && isLoaded) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: property.location }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setCoordinates({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
        }
      });
    }
  }, [property?.location, isLoaded]);

  const fetchProperty = async () => {
    try {
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (propertyError) throw propertyError;
      if (propertyData) {
        setProperty({
          ...propertyData,
          user_id: user?.id || null
        });
        if (propertyData.images) {
          setPreviewImages(propertyData.images);
        }
        
        // Inicializar coordenadas si existen
        if (propertyData.latitude && propertyData.longitude) {
          setCoordinates({
            lat: propertyData.latitude,
            lng: propertyData.longitude
          });
        }
        
        // Inicializar los campos de búsqueda con los nombres de los propietarios
        if (propertyData.share1_owner_id) {
          const owner = owners.find(o => o.id === propertyData.share1_owner_id);
          if (owner) setOwnerQuery1(owner.name);
        }
        if (propertyData.share2_owner_id) {
          const owner = owners.find(o => o.id === propertyData.share2_owner_id);
          if (owner) setOwnerQuery2(owner.name);
        }
        if (propertyData.share3_owner_id) {
          const owner = owners.find(o => o.id === propertyData.share3_owner_id);
          if (owner) setOwnerQuery3(owner.name);
        }
        if (propertyData.share4_owner_id) {
          const owner = owners.find(o => o.id === propertyData.share4_owner_id);
          if (owner) setOwnerQuery4(owner.name);
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

  const fetchAgents = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, phone, name, role')
      .eq('role', 'agent')
      .order('first_name');
    if (!error && data) {
      setAgents(data.map(agent => ({
        id: agent.id,
        name: agent.first_name && agent.last_name ? `${agent.first_name} ${agent.last_name}` : (agent.name || ''),
        email: agent.email,
        phone: agent.phone || ''
      })));
    }
  };

  const fetchOwners = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, phone')
      .eq('role', 'owner')
      .order('first_name');
    if (!error && data) {
      setOwners(data.map(owner => ({
        id: owner.id,
        name: `${owner.first_name} ${owner.last_name}`,
        email: owner.email,
        phone: owner.phone || ''
      })));
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

  const handlePlaceSelect = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setCoordinates({ lat, lng });
        setProperty(prev => prev ? {
          ...prev,
          location: place.formatted_address,
          latitude: lat,
          longitude: lng
        } : null);
      }
    }
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setCoordinates({ lat, lng });
      setProperty(prev => prev ? {
        ...prev,
        latitude: lat,
        longitude: lng
      } : null);
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

    if (!property.agent_id) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un agente inmobiliario',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Intentar geocodificar la dirección si no tenemos coordenadas
      if (property.location && (!property.latitude || !property.longitude)) {
        const coords = await geocodeAddress(property.location);
        if (coords) {
          property.latitude = coords.latitude;
          property.longitude = coords.longitude;
          setCoordinates({ lat: coords.latitude, lng: coords.longitude });
        }
      }

      // LOGS de los propietarios
      console.log('share1_owner_id:', property.share1_owner_id);
      console.log('share2_owner_id:', property.share2_owner_id);
      console.log('share3_owner_id:', property.share3_owner_id);
      console.log('share4_owner_id:', property.share4_owner_id);
      // Proteger los campos: si no es UUID válido, poner null
      const propertyData = {
        ...property,
        share1_owner_id: isValidUUID(property.share1_owner_id) ? property.share1_owner_id : null,
        share2_owner_id: isValidUUID(property.share2_owner_id) ? property.share2_owner_id : null,
        share3_owner_id: isValidUUID(property.share3_owner_id) ? property.share3_owner_id : null,
        share4_owner_id: isValidUUID(property.share4_owner_id) ? property.share4_owner_id : null,
        updated_at: new Date().toISOString(),
        destacada: !!property.destacada,
      };

      // Calculamos los precios de los shares basados en el precio total
      const propertyToSave = {
        ...propertyData,
        tipo_vivienda: propertyData.tipo_vivienda || null,
        features_extra: propertyData.features_extra || [],
        share1_price: propertyData.price * 0.25,
        share2_price: propertyData.price * 0.25,
        share3_price: propertyData.price * 0.25,
        share4_price: propertyData.price * 0.25,
        features: propertyData.features && propertyData.features.length > 0 ? propertyData.features : [],
        nearby_services: propertyData.nearby_services && propertyData.nearby_services.length > 0 ? propertyData.nearby_services : []
      };

      if (isEditing && id) {
        const { error } = await supabase
          .from('properties')
          .update(propertyToSave)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('properties')
          .insert([propertyToSave]);

        if (error) throw error;
      }

      // Después de guardar la propiedad y asignar los owners:
      const reservasFijas = [];
      const currentYear = new Date().getFullYear();
      for (let offset = 0; offset < 5; offset++) {
        const year = currentYear + offset;
        if (property.share1_owner_id) {
          reservasFijas.push({
            property_id: property.id,
            owner_id: property.share1_owner_id,
            start_date: QUINCENAS[0].start(year),
            end_date: QUINCENAS[0].end(year),
            status: 'fija',
          });
        }
        if (property.share2_owner_id) {
          reservasFijas.push({
            property_id: property.id,
            owner_id: property.share2_owner_id,
            start_date: QUINCENAS[1].start(year),
            end_date: QUINCENAS[1].end(year),
            status: 'fija',
          });
        }
        if (property.share3_owner_id) {
          reservasFijas.push({
            property_id: property.id,
            owner_id: property.share3_owner_id,
            start_date: QUINCENAS[2].start(year),
            end_date: QUINCENAS[2].end(year),
            status: 'fija',
          });
        }
        if (property.share4_owner_id) {
          reservasFijas.push({
            property_id: property.id,
            owner_id: property.share4_owner_id,
            start_date: QUINCENAS[3].start(year),
            end_date: QUINCENAS[3].end(year),
            status: 'fija',
          });
        }
      }
      if (reservasFijas.length > 0) {
        await supabase.from('property_reservations').upsert(reservasFijas, { onConflict: 'property_id,owner_id,start_date' });
      }

      toast({
        title: 'Éxito',
        description: isEditing ? 'Propiedad actualizada correctamente' : 'Propiedad creada correctamente'
      });
      navigate('/dashboard/admin/properties');
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
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard/admin/properties')}
            >
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
                      value={property.title || ''}
                      onChange={(e) => setProperty({ ...property, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={property.description || ''}
                      onChange={(e) => setProperty({ ...property, description: e.target.value })}
                      className="h-32"
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Precio (€)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={property.price || ''}
                      onChange={(e) => setProperty({ ...property, price: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={property.status || ''}
                      onValueChange={(value) => setProperty({ ...property, status: value as Property['status'] })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disponible">Disponible</SelectItem>
                        <SelectItem value="reservada">Reservada</SelectItem>
                        <SelectItem value="vendida">Vendida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Estado de Copropiedades</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="share1">1º quincena Julio + 10 sem</Label>
                        <Select
                          value={property.share1_status}
                          onValueChange={(value) => setProperty({ 
                            ...property, 
                            share1_status: value as ShareStatus,
                            share1_price: property.price * 0.25,
                            share1_owner_id: value === 'disponible' ? null : property.share1_owner_id
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="disponible">Disponible</SelectItem>
                            <SelectItem value="reservada">Reservada</SelectItem>
                            <SelectItem value="vendida">Vendida</SelectItem>
                          </SelectContent>
                        </Select>
                        {(property.share1_status === 'reservada' || property.share1_status === 'vendida') && (
                          <div className="mt-2">
                            <Label>Propietario</Label>
                            <Command>
                              <CommandInput
                                placeholder="Buscar propietario..."
                                value={ownerQuery1}
                                onValueChange={setOwnerQuery1}
                              />
                              <CommandList>
                                {owners.filter(o =>
                                  o.name.toLowerCase().includes(ownerQuery1.toLowerCase())
                                ).length === 0 && (
                                  <CommandEmpty>No hay propietarios</CommandEmpty>
                                )}
                                {owners.filter(o =>
                                  o.name.toLowerCase().includes(ownerQuery1.toLowerCase())
                                ).map(owner => (
                                  <CommandItem
                                    key={owner.id}
                                    onSelect={() => {
                                      setProperty({ ...property, share1_owner_id: owner.id });
                                      setOwnerQuery1(owner.name);
                                    }}
                                    value={owner.id}
                                  >
                                    {owner.name}
                                  </CommandItem>
                                ))}
                              </CommandList>
                            </Command>
                            {property.share1_owner_id && (
                              <div className="text-sm text-gray-500 mt-1">
                                Propietario seleccionado: {owners.find(o => o.id === property.share1_owner_id)?.name}
                                <Button type="button" size="sm" variant="ghost" onClick={() => {
                                  setProperty({ ...property, share1_owner_id: null });
                                  setOwnerQuery1('');
                                }}>
                                  Quitar
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="share2">2ª quincena Julio + 10 sem</Label>
                        <Select
                          value={property.share2_status}
                          onValueChange={(value) => setProperty({ 
                            ...property, 
                            share2_status: value as ShareStatus,
                            share2_price: property.price * 0.25,
                            share2_owner_id: value === 'disponible' ? null : property.share2_owner_id
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="disponible">Disponible</SelectItem>
                            <SelectItem value="reservada">Reservada</SelectItem>
                            <SelectItem value="vendida">Vendida</SelectItem>
                          </SelectContent>
                        </Select>
                        {(property.share2_status === 'reservada' || property.share2_status === 'vendida') && (
                          <div className="mt-2">
                            <Label>Propietario</Label>
                            <Command>
                              <CommandInput
                                placeholder="Buscar propietario..."
                                value={ownerQuery2}
                                onValueChange={setOwnerQuery2}
                              />
                              <CommandList>
                                {owners.filter(o =>
                                  o.name.toLowerCase().includes(ownerQuery2.toLowerCase())
                                ).length === 0 && (
                                  <CommandEmpty>No hay propietarios</CommandEmpty>
                                )}
                                {owners.filter(o =>
                                  o.name.toLowerCase().includes(ownerQuery2.toLowerCase())
                                ).map(owner => (
                                  <CommandItem
                                    key={owner.id}
                                    onSelect={() => {
                                      setProperty({ ...property, share2_owner_id: owner.id });
                                      setOwnerQuery2(owner.name);
                                    }}
                                    value={owner.id}
                                  >
                                    {owner.name}
                                  </CommandItem>
                                ))}
                              </CommandList>
                            </Command>
                            {property.share2_owner_id && (
                              <div className="text-sm text-gray-500 mt-1">
                                Propietario seleccionado: {owners.find(o => o.id === property.share2_owner_id)?.name}
                                <Button type="button" size="sm" variant="ghost" onClick={() => {
                                  setProperty({ ...property, share2_owner_id: null });
                                  setOwnerQuery2('');
                                }}>
                                  Quitar
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="share3">1º quincena Agosto + 10 sem</Label>
                        <Select
                          value={property.share3_status}
                          onValueChange={(value) => setProperty({ 
                            ...property, 
                            share3_status: value as ShareStatus,
                            share3_price: property.price * 0.25,
                            share3_owner_id: value === 'disponible' ? null : property.share3_owner_id
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="disponible">Disponible</SelectItem>
                            <SelectItem value="reservada">Reservada</SelectItem>
                            <SelectItem value="vendida">Vendida</SelectItem>
                          </SelectContent>
                        </Select>
                        {(property.share3_status === 'reservada' || property.share3_status === 'vendida') && (
                          <div className="mt-2">
                            <Label>Propietario</Label>
                            <Command>
                              <CommandInput
                                placeholder="Buscar propietario..."
                                value={ownerQuery3}
                                onValueChange={setOwnerQuery3}
                              />
                              <CommandList>
                                {owners.filter(o =>
                                  o.name.toLowerCase().includes(ownerQuery3.toLowerCase())
                                ).length === 0 && (
                                  <CommandEmpty>No hay propietarios</CommandEmpty>
                                )}
                                {owners.filter(o =>
                                  o.name.toLowerCase().includes(ownerQuery3.toLowerCase())
                                ).map(owner => (
                                  <CommandItem
                                    key={owner.id}
                                    onSelect={() => {
                                      setProperty({ ...property, share3_owner_id: owner.id });
                                      setOwnerQuery3(owner.name);
                                    }}
                                    value={owner.id}
                                  >
                                    {owner.name}
                                  </CommandItem>
                                ))}
                              </CommandList>
                            </Command>
                            {property.share3_owner_id && (
                              <div className="text-sm text-gray-500 mt-1">
                                Propietario seleccionado: {owners.find(o => o.id === property.share3_owner_id)?.name}
                                <Button type="button" size="sm" variant="ghost" onClick={() => {
                                  setProperty({ ...property, share3_owner_id: null });
                                  setOwnerQuery3('');
                                }}>
                                  Quitar
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="share4">2ª quincena Agosto + 10 sem</Label>
                        <Select
                          value={property.share4_status}
                          onValueChange={(value) => setProperty({ 
                            ...property, 
                            share4_status: value as ShareStatus,
                            share4_price: property.price * 0.25,
                            share4_owner_id: value === 'disponible' ? null : property.share4_owner_id
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="disponible">Disponible</SelectItem>
                            <SelectItem value="reservada">Reservada</SelectItem>
                            <SelectItem value="vendida">Vendida</SelectItem>
                          </SelectContent>
                        </Select>
                        {(property.share4_status === 'reservada' || property.share4_status === 'vendida') && (
                          <div className="mt-2">
                            <Label>Propietario</Label>
                            <Command>
                              <CommandInput
                                placeholder="Buscar propietario..."
                                value={ownerQuery4}
                                onValueChange={setOwnerQuery4}
                              />
                              <CommandList>
                                {owners.filter(o =>
                                  o.name.toLowerCase().includes(ownerQuery4.toLowerCase())
                                ).length === 0 && (
                                  <CommandEmpty>No hay propietarios</CommandEmpty>
                                )}
                                {owners.filter(o =>
                                  o.name.toLowerCase().includes(ownerQuery4.toLowerCase())
                                ).map(owner => (
                                  <CommandItem
                                    key={owner.id}
                                    onSelect={() => {
                                      setProperty({ ...property, share4_owner_id: owner.id });
                                      setOwnerQuery4(owner.name);
                                    }}
                                    value={owner.id}
                                  >
                                    {owner.name}
                                  </CommandItem>
                                ))}
                              </CommandList>
                            </Command>
                            {property.share4_owner_id && (
                              <div className="text-sm text-gray-500 mt-1">
                                Propietario seleccionado: {owners.find(o => o.id === property.share4_owner_id)?.name}
                                <Button type="button" size="sm" variant="ghost" onClick={() => {
                                  setProperty({ ...property, share4_owner_id: null });
                                  setOwnerQuery4('');
                                }}>
                                  Quitar
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="agent_id">Agente asignado <span className="text-red-600">*</span></Label>
                    <Command>
                      <CommandInput
                        placeholder="Buscar agente por nombre..."
                        value={agentQuery}
                        onValueChange={setAgentQuery}
                      />
                      <CommandList>
                        {agents.filter(a =>
                          a.name.toLowerCase().includes(agentQuery.toLowerCase())
                        ).length === 0 && (
                          <CommandEmpty>No hay agentes</CommandEmpty>
                        )}
                        {agents.filter(a =>
                          a.name.toLowerCase().includes(agentQuery.toLowerCase())
                        ).map(agent => (
                          <CommandItem
                            key={agent.id}
                            onSelect={() => {
                              setProperty(prev => prev ? { ...prev, agent_id: agent.id } : null);
                              setAgentQuery(agent.name);
                            }}
                            value={agent.id}
                          >
                            {agent.name}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </Command>
                    {property.agent_id && (
                      <div className="text-sm text-gray-500 mt-1">
                        Agente seleccionado: {agents.find(a => a.id === property.agent_id)?.name}
                        {agents.length > 1 && (
                          <Button type="button" size="sm" variant="ghost" onClick={() => setProperty(prev => prev ? { ...prev, agent_id: null } : null)}>
                            Quitar
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="location">Dirección</Label>
                    {isLoaded ? (
                      <Autocomplete
                        onLoad={ref => (autocompleteRef.current = ref)}
                        onPlaceChanged={() => {
                          const place = autocompleteRef.current.getPlace();
                          if (place && place.geometry) {
                            const lat = place.geometry.location.lat();
                            const lng = place.geometry.location.lng();
                            setCoordinates({ lat, lng });
                            setProperty(prev => prev ? { ...prev, location: place.formatted_address } : prev);
                          }
                        }}
                      >
                        <Input
                          id="location"
                          value={property.location || ''}
                          onChange={e => setProperty({ ...property, location: e.target.value })}
                          placeholder="Busca una dirección..."
                          autoComplete="off"
                        />
                      </Autocomplete>
                    ) : (
                      <Input
                        id="location"
                        value={property.location || ''}
                        onChange={e => setProperty({ ...property, location: e.target.value })}
                        placeholder="Busca una dirección..."
                        autoComplete="off"
                      />
                    )}
                    {isLoaded && coordinates && (
                      <div className="mt-4">
                        <GoogleMap
                          mapContainerStyle={{ width: '100%', height: '250px', borderRadius: '8px' }}
                          center={coordinates}
                          zoom={16}
                          onClick={e => {
                            if (e.latLng) {
                              const lat = e.latLng.lat();
                              const lng = e.latLng.lng();
                              setCoordinates({ lat, lng });
                              setProperty(prev => prev ? {
                                ...prev,
                                latitude: lat,
                                longitude: lng
                              } : null);
                            }
                          }}
                        >
                          <Marker 
                            position={coordinates} 
                            draggable={true} 
                            onDragEnd={handleMarkerDragEnd}
                          />
                        </GoogleMap>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="bedrooms">Habitaciones</Label>
                      <div className="relative">
                        <Input
                          id="bedrooms"
                          type="number"
                          value={property.bedrooms || ''}
                          onChange={(e) => setProperty({ ...property, bedrooms: Number(e.target.value) })}
                          className="pl-10"
                        />
                        <HiOutlineHome className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bathrooms">Baños</Label>
                      <div className="relative">
                        <Input
                          id="bathrooms"
                          type="number"
                          value={property.bathrooms || ''}
                          onChange={(e) => setProperty({ ...property, bathrooms: Number(e.target.value) })}
                          className="pl-10"
                        />
                        <HiOutlineUser className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="area">Área (m²)</Label>
                      <div className="relative">
                        <Input
                          id="area"
                          type="number"
                          value={property.area || ''}
                          onChange={(e) => setProperty({ ...property, area: Number(e.target.value) })}
                          className="pl-10"
                        />
                        <HiOutlineDocumentText className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tipo_vivienda">Tipo de vivienda</Label>
                    <Select
                      value={property.tipo_vivienda || ''}
                      onValueChange={(value) => setProperty({ ...property, tipo_vivienda: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo de vivienda" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPO_VIVIENDA_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 mt-4">
                    <h3 className="text-xl font-semibold mb-4">Características ampliadas</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {FEATURES_EXTRA.map((feature) => (
                        <label
                          key={feature}
                          className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors ${
                            property?.features_extra?.includes(feature)
                              ? 'bg-blue-50 border-blue-500 border'
                              : 'bg-white border hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={property?.features_extra?.includes(feature) || false}
                            onChange={(e) => {
                              if (!property) return;
                              const updated = e.target.checked
                                ? [...(property.features_extra || []), feature]
                                : (property.features_extra || []).filter((f) => f !== feature);
                              setProperty({ ...property, features_extra: updated });
                            }}
                          />
                          <span className="font-medium">{feature}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Servicios Cercanos</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {NEARBY_SERVICES.map((service) => (
                        <label
                          key={service.key}
                          className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors ${
                            property?.nearby_services?.includes(service.key)
                              ? 'bg-blue-50 border-blue-500 border'
                              : 'bg-white border hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={property?.nearby_services?.includes(service.key)}
                            onChange={(e) => {
                              if (!property) return;
                              const updatedServices = e.target.checked
                                ? [...(property.nearby_services || []), service.key]
                                : (property.nearby_services || []).filter((f) => f !== service.key);
                              setProperty({ ...property, nearby_services: updatedServices });
                            }}
                          />
                          {service.icon}
                          <span className="font-medium">{service.label}</span>
                        </label>
                      ))}
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

                  <div>
                    <Label htmlFor="destacada">Propiedad destacada</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Checkbox
                        id="destacada"
                        checked={!!property.destacada}
                        onCheckedChange={(checked) => setProperty({ ...property, destacada: !!checked })}
                      />
                      <span className="text-sm text-muted-foreground">Si está marcado, la propiedad aparecerá en la home</span>
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