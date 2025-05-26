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
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select('id, title, share1_owner_id, share2_owner_id, share3_owner_id, share4_owner_id')
          .or(`share1_owner_id.eq.${user.id},share2_owner_id.eq.${user.id},share3_owner_id.eq.${user.id},share4_owner_id.eq.${user.id}`);

        if (propertyError) {
          console.error('Error al obtener propiedades:', propertyError);
          throw propertyError;
        }

        if (propertyData && propertyData.length > 0) {
          const property = propertyData[0];
          let shareNumber = 0;
          if (property.share1_owner_id === user.id) shareNumber = 1;
          else if (property.share2_owner_id === user.id) shareNumber = 2;
          else if (property.share3_owner_id === user.id) shareNumber = 3;
          else if (property.share4_owner_id === user.id) shareNumber = 4;

          setMyProperty({
            id: property.id,
            title: property.title,
            share_number: shareNumber
          });

          // Obtener incidencias de la propiedad creadas por el propietario
          const { data: incidentsData, error: incidentsError } = await supabase
            .from('incidents')
            .select('*')
            .eq('property_id', property.id)
            .eq('owner_id', user.id)
            .order('created_at', { ascending: false });

          if (incidentsError) {
            console.error('Error al obtener incidencias:', incidentsError);
            throw incidentsError;
          }

          setIncidents(incidentsData || []);
        } else {
          console.log('No se encontraron propiedades para el usuario:', user.id);
          setMyProperty(null);
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Incidencias de mi Propiedad</h1>
      <p className="mb-4 text-gray-600">
        Propiedad: {myProperty.title} (Share #{myProperty.share_number})
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de nueva incidencia */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Crear nueva incidencia</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Asunto</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.subject}
                onChange={e => setForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Describe brevemente la incidencia"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Causa</label>
              <select
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.cause}
                onChange={e => setForm(prev => ({ ...prev, cause: e.target.value }))}
              >
                {CAUSAS.map(causa => (
                  <option key={causa.value} value={causa.value}>{causa.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe con detalle la incidencia..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Adjuntos</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Subir archivos</span>
                      <input
                        id="file-upload"
                        type="file"
                        ref={fileInputRef}
                        className="sr-only"
                        onChange={handleFileChange}
                        multiple
                        disabled={uploading}
                      />
                    </label>
                    <p className="pl-1">o arrastrar y soltar</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF hasta 10MB
                  </p>
                </div>
              </div>
              {uploading && (
                <div className="mt-2 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-sm text-gray-500">Subiendo archivos...</span>
                </div>
              )}
              {form.attachments.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Archivos adjuntos:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {form.attachments.map((url, idx) => (
                      <div key={idx} className="flex items-center p-2 bg-gray-50 rounded-md">
                        <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 truncate"
                        >
                          Archivo {idx + 1}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={loading || uploading}
              className="w-full sm:w-auto"
            >
              {loading ? 'Creando...' : 'Crear Incidencia'}
            </Button>
          </form>
        </Card>

        {/* Lista de incidencias */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Historial de incidencias</h2>
          
          <div className="space-y-4">
            {incidents.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-500">No tienes incidencias registradas</p>
              </div>
            ) : (
              incidents.map(incident => (
                <div key={incident.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{incident.subject}</h3>
                      <p className="text-sm text-gray-600">
                        {CAUSAS.find(c => c.value === incident.cause)?.label}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      incident.status === 'resuelta'
                        ? 'bg-green-100 text-green-800'
                        : incident.status === 'revisada'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {ESTADOS.find(e => e.value === incident.status)?.label}
                    </span>
                  </div>
                  
                  <p className="text-sm mt-2 text-gray-600">{incident.description}</p>
                  
                  {incident.attachments && incident.attachments.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">Adjuntos:</p>
                      <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {incident.attachments.map((url, idx) => (
                          <div key={idx} className="flex items-center p-2 bg-gray-50 rounded-md">
                            <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 truncate"
                            >
                              Archivo {idx + 1}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 text-xs text-gray-500">
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