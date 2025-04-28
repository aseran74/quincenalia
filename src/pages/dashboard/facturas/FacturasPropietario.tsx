import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

const ESTADOS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'enviado_banco', label: 'Enviado a banco' },
  { value: 'pagada', label: 'Pagada' },
  { value: 'devuelta', label: 'Devuelta' },
];

const TIPOS = [
  { value: 'gastos_generales', label: 'Gastos generales' },
  { value: 'gastos_gestion', label: 'Gastos de gestión' },
];

const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

const FacturasPropietario: React.FC = () => {
  const [owners, setOwners] = useState<any[]>([]);
  const [ownerId, setOwnerId] = useState<string>('');
  const [facturas, setFacturas] = useState<any[]>([]);
  const [form, setForm] = useState({
    type: 'gastos_generales',
    amount: '',
    month: new Date().getMonth(),
    year: currentYear,
    status: 'pendiente',
    attachments: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [filterEstado, setFilterEstado] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [detalleFactura, setDetalleFactura] = useState<any | null>(null);

  useEffect(() => {
    supabase.from('property_owners').select('id, first_name, last_name').then(({ data }) => setOwners(data || []));
  }, []);

  useEffect(() => {
    if (ownerId) {
      fetchFacturas();
    } else {
      setFacturas([]);
    }
    // eslint-disable-next-line
  }, [ownerId]);

  const fetchFacturas = async () => {
    let query = supabase
      .from('invoices')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    if (filterEstado) {
      query = query.eq('status', filterEstado);
    }
    const { data } = await query;
    setFacturas(data || []);
  };

  useEffect(() => {
    if (ownerId) fetchFacturas();
    // eslint-disable-next-line
  }, [filterEstado]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const fileName = `facturas/${ownerId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
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
    if (!ownerId) return toast({ title: 'Selecciona un propietario', variant: 'destructive' });
    setLoading(true);
    const { error } = await supabase.from('invoices').insert([
      {
        owner_id: ownerId,
        type: form.type,
        amount: parseFloat(form.amount),
        month: Number(form.month),
        year: Number(form.year),
        status: form.status,
        attachments: form.attachments,
      },
    ]);
    setLoading(false);
    if (!error) {
      setForm({ ...form, amount: '', attachments: [] });
      toast({ title: 'Factura creada', description: 'La factura se ha creado correctamente', variant: 'default' });
      fetchFacturas();
      // Aquí podrías integrar notificación por email si lo deseas
    } else {
      toast({ title: 'Error', description: 'Error al crear la factura', variant: 'destructive' });
    }
  };

  const handleEstadoChange = async (facturaId: string, nuevoEstado: string) => {
    await supabase.from('invoices').update({ status: nuevoEstado }).eq('id', facturaId);
    fetchFacturas();
    toast({ title: 'Estado actualizado', variant: 'default' });
  };

  const handleEliminarFactura = async (facturaId: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta factura?')) return;
    const { error } = await supabase.from('invoices').delete().eq('id', facturaId);
    if (!error) {
      toast({ title: 'Factura eliminada', variant: 'default' });
      fetchFacturas();
      if (detalleFactura && detalleFactura.id === facturaId) setDetalleFactura(null);
    } else {
      toast({ title: 'Error al eliminar', variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-poppins">
      <h1 className="text-2xl font-bold mb-4">Facturación a Propietarios</h1>
      <div className="mb-6">
        <label className="block mb-1 font-medium">Propietario</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={ownerId}
          onChange={e => setOwnerId(e.target.value)}
        >
          <option value="">Selecciona un propietario</option>
          {owners.map(o => (
            <option key={o.id} value={o.id}>{o.first_name} {o.last_name}</option>
          ))}
        </select>
      </div>
      {ownerId && (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Columna 1: Histórico */}
          <div className="flex-1 bg-white rounded shadow p-4 border">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">Histórico de facturas</h2>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={filterEstado}
                onChange={e => setFilterEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
            {/* Resumen de facturas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-50 rounded p-3 text-center">
                <div className="text-xs text-gray-500">Total emitidas</div>
                <div className="text-lg font-bold">{facturas.length}</div>
              </div>
              <div className="bg-yellow-50 rounded p-3 text-center">
                <div className="text-xs text-gray-500">Pendiente</div>
                <div className="text-lg font-bold">
                  {facturas.filter(f => f.status === 'pendiente').length}
                  {" / "}
                  {facturas.filter(f => f.status === 'pendiente').reduce((acc, f) => acc + Number(f.amount), 0).toFixed(2)} €
                </div>
              </div>
              <div className="bg-green-50 rounded p-3 text-center">
                <div className="text-xs text-gray-500">Pagadas</div>
                <div className="text-lg font-bold">
                  {facturas.filter(f => f.status === 'pagada').length}
                  {" / "}
                  {facturas.filter(f => f.status === 'pagada').reduce((acc, f) => acc + Number(f.amount), 0).toFixed(2)} €
                </div>
              </div>
              <div className="bg-red-50 rounded p-3 text-center">
                <div className="text-xs text-gray-500">Devueltas</div>
                <div className="text-lg font-bold">
                  {facturas.filter(f => f.status === 'devuelta').length}
                  {" / "}
                  {facturas.filter(f => f.status === 'devuelta').reduce((acc, f) => acc + Number(f.amount), 0).toFixed(2)} €
                </div>
              </div>
            </div>
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Mes/Año</th>
                  <th className="p-2">Importe</th>
                  <th className="p-2">Adjuntos</th>
                  <th className="p-2">Estado</th>
                  <th className="p-2">Creada</th>
                  <th className="p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturas.map(f => (
                  <tr key={f.id} className="border-t">
                    <td className="p-2">{TIPOS.find(t => t.value === f.type)?.label || f.type}</td>
                    <td className="p-2">{meses[f.month]} {f.year}</td>
                    <td className="p-2">{Number(f.amount).toFixed(2)} €</td>
                    <td className="p-2">
                      {Array.isArray(f.attachments) && f.attachments.length > 0 ? (
                        <ul>
                          {f.attachments.map((url: string, idx: number) => (
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
                        value={f.status}
                        onChange={e => handleEstadoChange(f.id, e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                      </select>
                    </td>
                    <td className="p-2">{new Date(f.created_at).toLocaleDateString()}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        className="text-blue-600 underline text-xs"
                        onClick={() => setDetalleFactura(f)}
                        title="Ver detalles"
                      >
                        Ver detalles
                      </button>
                      <button
                        className="text-red-600 underline text-xs"
                        onClick={() => handleEliminarFactura(f.id)}
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
            {detalleFactura && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded shadow-lg p-6 max-w-lg w-full relative">
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
                    onClick={() => setDetalleFactura(null)}
                  >
                    ×
                  </button>
                  <h3 className="text-xl font-bold mb-2">Detalles de la factura</h3>
                  <div className="mb-2"><b>Tipo:</b> {TIPOS.find(t => t.value === detalleFactura.type)?.label || detalleFactura.type}</div>
                  <div className="mb-2"><b>Mes/Año:</b> {meses[detalleFactura.month]} {detalleFactura.year}</div>
                  <div className="mb-2"><b>Importe:</b> {Number(detalleFactura.amount).toFixed(2)} €</div>
                  <div className="mb-2"><b>Estado:</b> {ESTADOS.find(e => e.value === detalleFactura.status)?.label || detalleFactura.status}</div>
                  <div className="mb-2"><b>Fecha de creación:</b> {new Date(detalleFactura.created_at).toLocaleString()}</div>
                  <div className="mb-2"><b>Adjuntos:</b> {Array.isArray(detalleFactura.attachments) && detalleFactura.attachments.length > 0 ? (
                    <ul>
                      {detalleFactura.attachments.map((url: string, idx: number) => (
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
          {/* Columna 2: Crear factura */}
          <div className="flex-1 bg-white rounded shadow p-4 border">
            <h2 className="text-xl font-semibold mb-4">Crear nueva factura</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block mb-1 font-medium">Tipo de factura</label>
                <select name="type" className="w-full border rounded px-3 py-2" value={form.type} onChange={handleChange}>
                  {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Mes</label>
                <select name="month" className="w-full border rounded px-3 py-2" value={form.month} onChange={handleChange}>
                  {meses.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Año</label>
                <select name="year" className="w-full border rounded px-3 py-2" value={form.year} onChange={handleChange}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Importe (€)</label>
                <input
                  type="number"
                  name="amount"
                  className="w-full border rounded px-3 py-2"
                  value={form.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Estado</label>
                <select name="status" className="w-full border rounded px-3 py-2" value={form.status} onChange={handleChange}>
                  {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>
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
                {loading ? 'Creando...' : 'Crear factura'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacturasPropietario; 