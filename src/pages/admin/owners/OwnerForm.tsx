import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { HiOutlineUserCircle, HiOutlinePhoto } from 'react-icons/hi2';

const OwnerForm = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [owner, setOwner] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    photo_url: '',
  });
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [selectedShare, setSelectedShare] = useState<string>('');
  const [action, setAction] = useState<'reservar' | 'comprar' | ''>('');
  const [sharePrice, setSharePrice] = useState<number>(0);

  useEffect(() => {
    if (id) fetchOwner();
    fetchProperties();
  }, [id]);

  const fetchOwner = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('property_owners')
      .select('*')
      .eq('id', id)
      .single();
    if (data) setOwner(data);
    setLoading(false);
  };

  const fetchProperties = async () => {
    const { data } = await supabase
      .from('properties')
      .select('*');
    // Filtrar propiedades con al menos una copropiedad disponible
    const filtered = (data || []).filter((p: any) =>
      ['share1_status','share2_status','share3_status','share4_status'].some(s => p[s] === 'disponible')
    );
    setProperties(filtered);
  };

  // Cuando se selecciona una propiedad, limpiar selección de copropiedad y acción
  useEffect(() => {
    setSelectedShare('');
    setAction('');
    setSharePrice(0);
    if (selectedProperty && selectedProperty.id) {
      // Opcional: podrías cargar detalles si necesitas
    }
  }, [selectedProperty]);

  // Cuando se selecciona una copropiedad, calcular el precio
  useEffect(() => {
    if (!selectedProperty || !selectedShare) return;
    const idx = ['share1','share2','share3','share4'].findIndex(s => s === selectedShare);
    const price = selectedProperty[`${selectedShare}_price`] ?? (selectedProperty.price/4);
    setSharePrice(price);
  }, [selectedShare, selectedProperty]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOwner({ ...owner, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('owners').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('owners').getPublicUrl(fileName);
      setPhotoUrl(publicUrl);
      toast({ title: 'Éxito', description: 'Foto subida correctamente' });
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Error al subir la foto', variant: 'destructive' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!photoUrl) return;
    try {
      const fileName = photoUrl.split('/').pop();
      if (!fileName) throw new Error('No se pudo determinar el archivo');
      const { error } = await supabase.storage.from('owners').remove([fileName]);
      if (error) throw error;
      setPhotoUrl(undefined);
      toast({ title: 'Éxito', description: 'Foto eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar foto:', error);
      toast({ title: 'Error', description: 'No se pudo eliminar la foto', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const ownerData = { ...owner, photo_url: photoUrl || null };
      let result, ownerId;
      if (id) {
        result = await supabase
          .from('property_owners')
          .update(ownerData)
          .eq('id', id);
        ownerId = id;
      } else {
        result = await supabase
          .from('property_owners')
          .insert([ownerData])
          .select('id')
          .single();
        ownerId = result.data?.id;
      }
      if (!result.error && ownerId && selectedProperty && selectedShare && action) {
        // Insertar en shares
        const { error: shareError } = await supabase
          .from('shares')
          .insert([
            {
              owner_id: ownerId,
              property_id: selectedProperty.id,
              copropiedad_id: selectedShare, // Ajusta si el campo es diferente
              status: action === 'reservar' ? 'reservada' : 'vendida',
              price: sharePrice,
              percentage: 25 // O el valor correspondiente
            }
          ]);
        // Actualizar el estado de la copropiedad en properties
        const statusField = `${selectedShare}_status`;
        const { error: propertyError } = await supabase
          .from('properties')
          .update({ [statusField]: action === 'reservar' ? 'reservada' : 'vendida' })
          .eq('id', selectedProperty.id);
        if (shareError || propertyError) {
          toast({ title: 'Error', description: 'No se pudo asignar la copropiedad', variant: 'destructive' });
          setLoading(false);
          return;
        }
      }
      if (!result.error) {
        toast({ title: 'Éxito', description: 'Propietario guardado correctamente' });
        navigate('/admin/owners');
      } else {
        toast({ title: 'Error', description: 'No se pudo guardar', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 font-poppins max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">{id ? 'Editar Propietario' : 'Nuevo Propietario'}</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <Label className="block mb-1 font-medium">Propiedad</Label>
          <Select value={selectedProperty?.id || ''} onValueChange={val => {
            const prop = properties.find(p => p.id === val);
            setSelectedProperty(prop || null);
          }}>
            <SelectTrigger className="w-full border rounded px-3 py-2">
              <SelectValue placeholder="Selecciona una propiedad" />
            </SelectTrigger>
            <SelectContent>
              {properties.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedProperty && (
          <div>
            <Label className="block mb-1 font-medium">Copropiedad</Label>
            <Select value={selectedShare} onValueChange={setSelectedShare}>
              <SelectTrigger className="w-full border rounded px-3 py-2">
                <SelectValue placeholder="Selecciona una copropiedad" />
              </SelectTrigger>
              <SelectContent>
                {['share1','share2','share3','share4'].map((share, idx) => (
                  selectedProperty[`${share}_status`] === 'disponible' && (
                    <SelectItem key={share} value={share}>
                      {['1º quincena Julio + 10 sem','2ª quincena Julio + 10 sem','1º quincena Agosto + 10 sem','2ª quincena Agosto + 10 sem'][idx]}
                    </SelectItem>
                  )
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {selectedShare && (
          <div>
            <Label className="block mb-1 font-medium">Acción</Label>
            <Select value={action} onValueChange={val => setAction(val as 'reservar' | 'comprar')}>
              <SelectTrigger className="w-full border rounded px-3 py-2">
                <SelectValue placeholder="Reservar o Comprar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reservar">Reservar (10%)</SelectItem>
                <SelectItem value="comprar">Comprar (100%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {action && (
          <div>
            <Label className="block mb-1 font-medium">Importe</Label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 bg-gray-100"
              value={action === 'reservar' ? Math.round(sharePrice * 0.1) : sharePrice}
              readOnly
            />
          </div>
        )}
        <div>
          <label className="block mb-1 font-medium">Nombre</label>
          <input type="text" name="first_name" value={owner.first_name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Apellido</label>
          <input type="text" name="last_name" value={owner.last_name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input type="email" name="email" value={owner.email} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Teléfono</label>
          <input type="tel" name="phone" value={owner.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div className="flex flex-col items-center mb-4">
          <div className="relative">
            {photoUrl ? (
              <>
                <img
                  src={photoUrl}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-0 right-0 z-10"
                  onClick={handleRemovePhoto}
                >
                  ×
                </Button>
              </>
            ) : (
              <HiOutlineUserCircle className="w-24 h-24 text-gray-300" />
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-2"
            disabled={uploadingPhoto}
            onClick={() => fileInputRef.current?.click()}
          >
            <HiOutlinePhoto className="h-5 w-5 mr-2" />
            {uploadingPhoto ? 'Subiendo...' : 'Subir Foto'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
            disabled={uploadingPhoto}
          />
        </div>
        <Button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </form>
    </div>
  );
};

export default OwnerForm; 