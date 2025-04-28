import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

const ESTADOS = [
  { value: 'recibida', label: 'Recibida' },
  { value: 'revisada', label: 'Revisada' },
  { value: 'resuelta', label: 'Resuelta' },
];

const CAUSAS = [
  { value: 'limpieza', label: 'Incidencia limpieza' },
  { value: 'piscina', label: 'Incidencia piscina' },
  { value: 'pagos', label: 'Incidencia pagos' },
  { value: 'otros', label: 'Otros' },
];

const IncidenciasPanel: React.FC = () => {
  const [incidencias, setIncidencias] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [form, setForm] = useState({
    property_id: '',
    owner_id: '',
    subject: '',
    cause: 'limpieza',
    description: '',
    status: 'recibida',
    attachments: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ estado: '', propiedad: '', propietario: '', causa: '' });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [detalleIncidencia, setDetalleIncidencia] = useState<any | null>(null);

  useEffect(() => {
    supabase.from('property_owners').select('id, first_name, last_name').then(({ data }) => setOwners(data || []));
    supabase.from('properties').select('id, title').then(({ data }) => setProperties(data || []));
  }, []);

  useEffect(() => {
    fetchIncidencias();
    // eslint-disable-next-line
  }, [filter]);

  const fetchIncidencias = async () => {
    let query = supabase.from('incidents').select('*').order('created_at', { ascending: false });
    if (filter.estado) query = query.eq('status', filter.estado);
    if (filter.propiedad) query = query.eq('property_id', filter.propiedad);
    if (filter.propietario) query = query.eq('owner_id', filter.propietario);
    if (filter.causa) query = query.eq('cause', filter.causa);
    const { data } = await query;
    setIncidencias(data || []);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop();
      const fileName = `incidencias/${form.owner_id || 'sin_owner'}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
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
    if (!form.subject) return toast({ title: 'Pon un asunto para la incidencia', variant: 'destructive' });
    setLoading(true);
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
    setLoading(false);
    if (!error) {
      setForm({ property_id: '', owner_id: '', subject: '', cause: 'limpieza', description: '', status: 'recibida', attachments: [] });
      toast({ title: 'Incidencia creada', description: 'La incidencia se ha creado correctamente', variant: 'default' });
      fetchIncidencias();
    } else {
      toast({ title: 'Error', description: 'Error al crear la incidencia', variant: 'destructive' });
    }
  };

  const handleEstadoChange = async (incidenciaId: string, nuevoEstado: string) => {
    await supabase.from('incidents').update({ status: nuevoEstado }).eq('id', incidenciaId);
    fetchIncidencias();
    toast({ title: 'Estado actualizado', variant: 'default' });
  };

  const handleEliminarIncidencia = async (incidenciaId: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta incidencia?')) return;
    const { error } = await supabase.from('incidents').delete().eq('id', incidenciaId);
    if (!error) {
      toast({ title: 'Incidencia eliminada', variant: 'default' });
      fetchIncidencias();
      if (detalleIncidencia && detalleIncidencia.id === incidenciaId) setDetalleIncidencia(null);
    } else {
      toast({ title: 'Error al eliminar', variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-poppins">
      <h1 className="text-2xl font-bold mb-4">Gestión de Incidencias</h1>
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Filtros */}
        <select className="border rounded px-2 py-1" value={filter.estado} onChange={e => setFilter(f => ({ ...f, estado: e.target.value }))}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
        <select className="border rounded px-2 py-1" value={filter.propiedad} onChange={e => setFilter(f => ({ ...f, propiedad: e.target.value }))}>
          <option value="">Todas las propiedades</option>
          {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <select className="border rounded px-2 py-1" value={filter.propietario} onChange={e => setFilter(f => ({ ...f, propietario: e.target.value }))}>
          <option value="">Todos los propietarios</option>
          {owners.map(o => <option key={o.id} value={o.id}>{o.first_name} {o.last_name}</option>)}
        </select>
        <select className="border rounded px-2 py-1" value={filter.causa} onChange={e => setFilter(f => ({ ...f, causa: e.target.value }))}>
          <option value="">Todas las causas</option>
          {CAUSAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Columna 1: Histórico */}
        <div className="flex-1 bg-white rounded shadow p-4 border">
          <h2 className="text-xl font-semibold mb-4">Histórico de incidencias</h2>
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Asunto</th>
                <th className="p-2">Propiedad</th>
                <th className="p-2">Propietario</th>
                <th className="p-2">Causa</th>
                <th className="p-2">Adjuntos</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Creada</th>
                <th className="p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {incidencias.map(inc => (
                <tr key={inc.id} className="border-t">
                  <td className="p-2">{inc.subject}</td>
                  <td className="p-2">{properties.find(p => p.id === inc.property_id)?.title || '-'}</td>
                  <td className="p-2">{owners.find(o => o.id === inc.owner_id) ? `${owners.find(o => o.id === inc.owner_id).first_name} ${owners.find(o => o.id === inc.owner_id).last_name}` : '-'}</td>
                  <td className="p-2">{CAUSAS.find(c => c.value === inc.cause)?.label || inc.cause}</td>
                  <td className="p-2">
                    {Array.isArray(inc.attachments) && inc.attachments.length > 0 ? (
                      <ul>
                        {inc.attachments.map((url: string, idx: number) => (
                          <li key={idx}>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Adjunto {idx + 1}</a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400">Sin adjuntos</span>
                    )}
                  </td>
                  <td className="p-2">
                    <select
                      value={inc.status}
                      onChange={e => handleEstadoChange(inc.id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                    </select>
                  </td>
                  <td className="p-2">{new Date(inc.created_at).toLocaleDateString()}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      className="text-blue-600 underline text-xs"
                      onClick={() => setDetalleIncidencia(inc)}
                      title="Ver detalles"
                    >
                      Ver detalles
                    </button>
                    <button
                      className="text-red-600 underline text-xs"
                      onClick={() => handleEliminarIncidencia(inc.id)}
                      title="Eliminar"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Modal de detalles */}
          {detalleIncidencia && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded shadow-lg p-6 max-w-lg w-full relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
                  onClick={() => setDetalleIncidencia(null)}
                >
                  ×
                </button>
                <h3 className="text-xl font-bold mb-2">Detalles de la incidencia</h3>
                <div className="mb-2"><b>Asunto:</b> {detalleIncidencia.subject}</div>
                <div className="mb-2"><b>Propiedad:</b> {properties.find(p => p.id === detalleIncidencia.property_id)?.title || '-'}</div>
                <div className="mb-2"><b>Propietario:</b> {owners.find(o => o.id === detalleIncidencia.owner_id) ? `${owners.find(o => o.id === detalleIncidencia.owner_id).first_name} ${owners.find(o => o.id === detalleIncidencia.owner_id).last_name}` : '-'}</div>
                <div className="mb-2"><b>Causa:</b> {CAUSAS.find(c => c.value === detalleIncidencia.cause)?.label || detalleIncidencia.cause}</div>
                <div className="mb-2"><b>Descripción:</b> {detalleIncidencia.description || '-'}</div>
                <div className="mb-2"><b>Estado:</b> {ESTADOS.find(e => e.value === detalleIncidencia.status)?.label || detalleIncidencia.status}</div>
                <div className="mb-2"><b>Fecha de creación:</b> {new Date(detalleIncidencia.created_at).toLocaleString()}</div>
                <div className="mb-2"><b>Adjuntos:</b> {Array.isArray(detalleIncidencia.attachments) && detalleIncidencia.attachments.length > 0 ? (
                  <ul>
                    {detalleIncidencia.attachments.map((url: string, idx: number) => (
                      <li key={idx}>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Adjunto {idx + 1}</a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-400">Sin adjuntos</span>
                )}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Columna 2: Crear incidencia */}
        <div className="flex-1 bg-white rounded shadow p-4 border">
          <h2 className="text-xl font-semibold mb-4">Crear nueva incidencia</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1 font-medium">Propiedad</label>
              <select name="property_id" className="w-full border rounded px-3 py-2" value={form.property_id} onChange={handleChange}>
                <option value="">Sin propiedad</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Propietario</label>
              <select name="owner_id" className="w-full border rounded px-3 py-2" value={form.owner_id} onChange={handleChange}>
                <option value="">Sin propietario</option>
                {owners.map(o => <option key={o.id} value={o.id}>{o.first_name} {o.last_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Asunto</label>
              <input
                type="text"
                name="subject"
                className="w-full border rounded px-3 py-2"
                value={form.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Causa</label>
              <select name="cause" className="w-full border rounded px-3 py-2" value={form.cause} onChange={handleChange}>
                {CAUSAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Descripción</label>
              <textarea
                name="description"
                className="w-full border rounded px-3 py-2"
                value={form.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Adjuntar archivos</label>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                className="w-full border rounded px-3 py-2"
                onChange={handleFileChange}
                disabled={uploading}
                accept=".pdf,image/*"
              />
              {form.attachments.length > 0 && (
                <ul className="mt-2">
                  {form.attachments.map((url, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Adjunto {idx + 1}</a>
                      <button type="button" className="text-red-600 text-xs" onClick={() => handleRemoveAttachment(url)}>Quitar</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
              {loading ? 'Creando...' : 'Crear incidencia'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IncidenciasPanel; 