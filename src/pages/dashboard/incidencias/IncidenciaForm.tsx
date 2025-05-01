import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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

const IncidenciaForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [owners, setOwners] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    property_id: '',
    owner_id: '',
    subject: '',
    cause: 'limpieza',
    description: '',
    status: 'recibida',
    attachments: [] as string[],
  });

  useEffect(() => {
    const fetchData = async () => {
      if (user?.role === 'admin') {
        const { data: ownersData } = await supabase
          .from('property_owners')
          .select('id, first_name, last_name');
        setOwners(ownersData || []);

        const { data: propertiesData } = await supabase
          .from('properties')
          .select('id, title');
        setProperties(propertiesData || []);
      }
    };
    fetchData();
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileName = `incidencias/${form.owner_id || 'sin_owner'}/${timestamp}-${randomString}.${ext}`;
      const { error } = await supabase.storage.from('attachments').upload(fileName, file);
      if (error) {
        toast({ title: 'Error', description: 'Error al subir archivo', variant: 'destructive' });
        continue;
      }
      const { data } = supabase.storage.from('attachments').getPublicUrl(fileName);
      if (data?.publicUrl) uploadedUrls.push(data.publicUrl);
    }
    setForm(prev => ({ ...prev, attachments: [...prev.attachments, ...uploadedUrls] }));
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAttachment = (url: string) => {
    setForm(prev => ({ ...prev, attachments: prev.attachments.filter(a => a !== url) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject) {
      return toast({ 
        title: 'Error', 
        description: 'Por favor, ingresa un asunto para la incidencia', 
        variant: 'destructive' 
      });
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('incidents').insert([
        {
          property_id: form.property_id || null,
          owner_id: form.owner_id || null,
          subject: form.subject,
          cause: form.cause,
          description: form.description,
          status: form.status,
          attachments: form.attachments,
        },
      ]);

      if (error) throw error;

      toast({ 
        title: 'Incidencia creada', 
        description: 'La incidencia se ha creado correctamente' 
      });
      navigate('/dashboard/admin/incidents');
    } catch (error) {
      console.error('Error al crear incidencia:', error);
      toast({ 
        title: 'Error', 
        description: 'No se pudo crear la incidencia', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Nueva Incidencia</h1>
        <Button variant="outline" onClick={() => navigate('/dashboard/admin/incidents')}>
          Volver
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {user?.role === 'admin' && (
            <>
              <div>
                <label className="block mb-1 font-medium">Propietario</label>
                <select
                  name="owner_id"
                  className="w-full border rounded px-3 py-2"
                  value={form.owner_id}
                  onChange={e => setForm(prev => ({ ...prev, owner_id: e.target.value }))}
                >
                  <option value="">Selecciona un propietario</option>
                  {owners.map(owner => (
                    <option key={owner.id} value={owner.id}>
                      {owner.first_name} {owner.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">Propiedad</label>
                <select
                  name="property_id"
                  className="w-full border rounded px-3 py-2"
                  value={form.property_id}
                  onChange={e => setForm(prev => ({ ...prev, property_id: e.target.value }))}
                >
                  <option value="">Selecciona una propiedad</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.title}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block mb-1 font-medium">Asunto</label>
            <input
              type="text"
              name="subject"
              className="w-full border rounded px-3 py-2"
              value={form.subject}
              onChange={e => setForm(prev => ({ ...prev, subject: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Causa</label>
            <select
              name="cause"
              className="w-full border rounded px-3 py-2"
              value={form.cause}
              onChange={e => setForm(prev => ({ ...prev, cause: e.target.value }))}
            >
              {CAUSAS.map(causa => (
                <option key={causa.value} value={causa.value}>
                  {causa.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Descripción</label>
            <textarea
              name="description"
              className="w-full border rounded px-3 py-2"
              rows={4}
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Estado</label>
            <select
              name="status"
              className="w-full border rounded px-3 py-2"
              value={form.status}
              onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
            >
              {ESTADOS.map(estado => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Adjuntos</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploading && <div className="mt-2 text-sm text-blue-600">Subiendo archivos...</div>}
            {form.attachments.length > 0 && (
              <ul className="mt-2 space-y-1">
                {form.attachments.map((url, idx) => (
                  <li key={idx} className="flex items-center justify-between text-sm">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      Adjunto {idx + 1}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(url)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/admin/incidents')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || uploading}
            >
              {loading ? 'Creando...' : 'Crear Incidencia'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default IncidenciaForm; 