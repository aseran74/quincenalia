import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ESTADOS = [
  { value: 'recibida', label: 'Recibida' },
  { value: 'revisada', label: 'En revisión' },
  { value: 'resuelta', label: 'Resuelta' },
];

const CAUSAS = [
  { value: 'limpieza', label: 'Incidencia limpieza' },
  { value: 'piscina', label: 'Incidencia piscina' },
  { value: 'pagos', label: 'Incidencia pagos' },
  { value: 'otros', label: 'Otros' },
];

interface Property {
  id: string;
  title: string;
  share_number?: number;
}

interface Incident {
  id: string;
  property_id: string;
  owner_id: string;
  subject: string;
  cause: string;
  description: string;
  status: string;
  attachments: string[];
  created_at: string;
}

const OwnerIncidents: React.FC = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [myProperty, setMyProperty] = useState<Property | null>(null);
  const [form, setForm] = useState({
    subject: '',
    cause: 'limpieza',
    description: '',
    attachments: [] as string[],
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        // Obtener la propiedad del propietario y su número de share
        const { data: propertyData } = await supabase
          .from('properties')
          .select('id, title, share1_owner_id, share2_owner_id, share3_owner_id, share4_owner_id')
          .or(`share1_owner_id.eq.${user.id},share2_owner_id.eq.${user.id},share3_owner_id.eq.${user.id},share4_owner_id.eq.${user.id}`)
          .single();

        if (propertyData) {
          let shareNumber = 0;
          if (propertyData.share1_owner_id === user.id) shareNumber = 1;
          else if (propertyData.share2_owner_id === user.id) shareNumber = 2;
          else if (propertyData.share3_owner_id === user.id) shareNumber = 3;
          else if (propertyData.share4_owner_id === user.id) shareNumber = 4;

          setMyProperty({
            id: propertyData.id,
            title: propertyData.title,
            share_number: shareNumber
          });

          // Obtener incidencias de la propiedad creadas por el propietario
          const { data: incidentsData } = await supabase
            .from('incidents')
            .select('*')
            .eq('property_id', propertyData.id)
            .eq('owner_id', user.id)
            .order('created_at', { ascending: false });

          setIncidents(incidentsData || []);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos',
          variant: 'destructive'
        });
      }
      setLoading(false);
    };

    fetchData();
  }, [user?.id]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !myProperty) return;
    
    setUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop();
        const fileName = `incidencias/${myProperty.id}/${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        
        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('attachments')
          .getPublicUrl(fileName);

        if (data?.publicUrl) {
          uploadedUrls.push(data.publicUrl);
        }
      }

      setForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...uploadedUrls]
      }));

      toast({
        title: 'Archivos subidos',
        description: 'Los archivos se han subido correctamente'
      });
    } catch (error) {
      console.error('Error al subir archivos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron subir los archivos',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !myProperty) return;
    
    if (!form.subject) {
      return toast({
        title: 'Error',
        description: 'Por favor, ingresa un asunto para la incidencia',
        variant: 'destructive'
      });
    }

    try {
      const { error } = await supabase.from('incidents').insert([
        {
          property_id: myProperty.id,
          owner_id: user.id,
          subject: form.subject,
          cause: form.cause,
          description: form.description,
          status: 'recibida',
          attachments: form.attachments,
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Incidencia creada',
        description: 'La incidencia se ha creado correctamente'
      });

      // Recargar incidencias
      const { data } = await supabase
        .from('incidents')
        .select('*')
        .eq('property_id', myProperty.id)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      setIncidents(data || []);

      // Limpiar formulario
      setForm({
        subject: '',
        cause: 'limpieza',
        description: '',
        attachments: [],
      });

    } catch (error) {
      console.error('Error al crear incidencia:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la incidencia',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div className="p-4">Cargando...</div>;
  }

  if (!myProperty) {
    return (
      <div className="p-6">
        <Card className="p-4">
          <h2 className="text-xl font-semibold text-red-600">No tienes ninguna propiedad asignada</h2>
          <p className="mt-2 text-gray-600">Contacta con el administrador si crees que esto es un error.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Incidencias de mi Propiedad</h1>
      <p className="mb-4 text-gray-600">
        Propiedad: {myProperty.title} (Share #{myProperty.share_number})
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulario de nueva incidencia */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Crear nueva incidencia</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Asunto</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={form.subject}
                onChange={e => setForm(prev => ({ ...prev, subject: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block mb-1">Causa</label>
              <select
                className="w-full p-2 border rounded"
                value={form.cause}
                onChange={e => setForm(prev => ({ ...prev, cause: e.target.value }))}
              >
                {CAUSAS.map(causa => (
                  <option key={causa.value} value={causa.value}>{causa.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">Descripción</label>
              <textarea
                className="w-full p-2 border rounded"
                rows={4}
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <label className="block mb-1">Adjuntos</label>
              <input
                type="file"
                ref={fileInputRef}
                className="w-full p-2 border rounded"
                onChange={handleFileChange}
                multiple
                disabled={uploading}
              />
              {uploading && <p className="text-sm text-gray-500">Subiendo archivos...</p>}
              {form.attachments.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Archivos adjuntos:</p>
                  <ul className="text-sm text-blue-600">
                    {form.attachments.map((url, idx) => (
                      <li key={idx}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          Archivo {idx + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading || uploading}>
              Crear Incidencia
            </Button>
          </form>
        </Card>

        {/* Lista de incidencias */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Historial de incidencias</h2>
          
          <div className="space-y-4">
            {incidents.length === 0 ? (
              <p className="text-gray-500">No tienes incidencias registradas</p>
            ) : (
              incidents.map(incident => (
                <div key={incident.id} className="p-4 border rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{incident.subject}</h3>
                      <p className="text-sm text-gray-600">
                        {CAUSAS.find(c => c.value === incident.cause)?.label}
                      </p>
                    </div>
                    <span className={`text-sm px-2 py-1 rounded ${
                      incident.status === 'resuelta'
                        ? 'bg-green-100 text-green-800'
                        : incident.status === 'revisada'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {ESTADOS.find(e => e.value === incident.status)?.label}
                    </span>
                  </div>
                  
                  <p className="text-sm mt-2">{incident.description}</p>
                  
                  {incident.attachments && incident.attachments.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Adjuntos:</p>
                      <div className="flex gap-2">
                        {incident.attachments.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Archivo {idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Creada el {new Date(incident.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OwnerIncidents; 