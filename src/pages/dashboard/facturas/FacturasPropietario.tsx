import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

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
  const { user } = useAuth();
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
    const fetchOwners = async () => {
      if (user?.role === 'admin') {
        const { data } = await supabase
          .from('property_owners')
          .select('id, first_name, last_name');
        setOwners(data || []);
      } else if (user?.role === 'owner') {
        setOwnerId(user.id);
      }
    };
    fetchOwners();
  }, [user]);

  const fetchFacturas = async () => {
    try {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          property_owners (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (user?.role === 'owner') {
        query = query.eq('owner_id', user.id);
      } else if (ownerId) {
        query = query.eq('owner_id', ownerId);
      }

      if (filterEstado) {
        query = query.eq('status', filterEstado);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setFacturas(data || []);
    } catch (error) {
      console.error('Error al cargar facturas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las facturas',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (user?.role === 'owner' || ownerId) {
      fetchFacturas();
    }
  }, [ownerId, filterEstado, user]);

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
    if (user?.role !== 'admin') return toast({ title: 'No tienes permisos para crear facturas', variant: 'destructive' });
    
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
    } else {
      toast({ title: 'Error', description: 'Error al crear la factura', variant: 'destructive' });
    }
  };

  const handleEstadoChange = async (facturaId: string, nuevoEstado: string) => {
    if (user?.role !== 'admin') return;
    await supabase.from('invoices').update({ status: nuevoEstado }).eq('id', facturaId);
    fetchFacturas();
    toast({ title: 'Estado actualizado', variant: 'default' });
  };

  const handleEliminarFactura = async (facturaId: string) => {
    if (user?.role !== 'admin') return;
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

  // Función para verificar si el usuario puede editar una factura
  const canEditInvoice = (factura: any) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return false;
  };

  // Función para verificar si el usuario puede eliminar una factura
  const canDeleteInvoice = (factura: any) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return false;
  };

  // Función para verificar si el usuario puede ver los detalles completos
  const canViewFullDetails = (factura: any) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'owner' && factura.owner_id === user.id) return true;
    return false;
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto font-poppins">
      <h1 className="text-2xl font-bold mb-4">
        {user?.role === 'admin' ? 'Facturación a Propietarios' : 'Mis Facturas'}
      </h1>
      
      {user?.role === 'admin' && (
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
      )}

      {(user?.role === 'owner' || ownerId) && (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Columna 1: Histórico */}
          <div className="flex-1 bg-white rounded shadow p-4 border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <h2 className="text-xl font-semibold">Histórico de facturas</h2>
              <select
                className="border rounded px-2 py-1 text-sm w-full sm:w-auto"
                value={filterEstado}
                onChange={e => setFilterEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>

            {/* Resumen de facturas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6">
              <div className="bg-blue-50 rounded p-2 sm:p-3 text-center">
                <div className="text-xs text-gray-500">Total emitidas</div>
                <div className="text-base sm:text-lg font-bold">{facturas.length}</div>
              </div>
              <div className="bg-yellow-50 rounded p-2 sm:p-3 text-center">
                <div className="text-xs text-gray-500">Pendiente</div>
                <div className="text-base sm:text-lg font-bold">
                  {facturas.filter(f => f.status === 'pendiente').length}
                  <div className="text-xs">
                    {facturas.filter(f => f.status === 'pendiente').reduce((acc, f) => acc + Number(f.amount), 0).toFixed(2)} €
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded p-2 sm:p-3 text-center">
                <div className="text-xs text-gray-500">Pagadas</div>
                <div className="text-base sm:text-lg font-bold">
                  {facturas.filter(f => f.status === 'pagada').length}
                  <div className="text-xs">
                    {facturas.filter(f => f.status === 'pagada').reduce((acc, f) => acc + Number(f.amount), 0).toFixed(2)} €
                  </div>
                </div>
              </div>
              <div className="bg-red-50 rounded p-2 sm:p-3 text-center">
                <div className="text-xs text-gray-500">Devueltas</div>
                <div className="text-base sm:text-lg font-bold">
                  {facturas.filter(f => f.status === 'devuelta').length}
                  <div className="text-xs">
                    {facturas.filter(f => f.status === 'devuelta').reduce((acc, f) => acc + Number(f.amount), 0).toFixed(2)} €
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de facturas responsiva */}
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mes/Año</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importe</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Adjuntos</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Creada</th>
                        {canEditInvoice(null) && <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {facturas.map(f => (
                        <tr key={f.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{TIPOS.find(t => t.value === f.type)?.label || f.type}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{meses[f.month]} {f.year}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">{Number(f.amount).toFixed(2)} €</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm hidden sm:table-cell">
                            {Array.isArray(f.attachments) && f.attachments.length > 0 ? (
                              <span className="text-blue-600">{f.attachments.length} adjunto(s)</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            {canEditInvoice(f) ? (
                              <select
                                value={f.status}
                                onChange={e => handleEstadoChange(f.id, e.target.value)}
                                className="border rounded px-2 py-1 text-sm w-full"
                              >
                                {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                              </select>
                            ) : (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                ${f.status === 'pagada' ? 'bg-green-100 text-green-800' : ''}
                                ${f.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${f.status === 'devuelta' ? 'bg-red-100 text-red-800' : ''}
                                ${f.status === 'enviado_banco' ? 'bg-blue-100 text-blue-800' : ''}
                              `}>
                                {ESTADOS.find(e => e.value === f.status)?.label}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm hidden sm:table-cell">{new Date(f.created_at).toLocaleDateString()}</td>
                          {canEditInvoice(f) && (
                            <td className="px-3 py-2 whitespace-nowrap text-sm">
                              <div className="flex gap-2">
                                <button
                                  className="text-blue-600 hover:text-blue-800 text-xs"
                                  onClick={() => setDetalleFactura(f)}
                                >
                                  Detalles
                                </button>
                                {canDeleteInvoice(f) && (
                                  <button
                                    className="text-red-600 hover:text-red-800 text-xs"
                                    onClick={() => handleEliminarFactura(f.id)}
                                  >
                                    Eliminar
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal de detalles mejorado */}
            {detalleFactura && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
                  <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    onClick={() => setDetalleFactura(null)}
                  >
                    <span className="sr-only">Cerrar</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <h3 className="text-lg font-bold mb-4">Detalles de la factura</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                      <dd className="mt-1 text-sm text-gray-900">{TIPOS.find(t => t.value === detalleFactura.type)?.label || detalleFactura.type}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Mes/Año</dt>
                      <dd className="mt-1 text-sm text-gray-900">{meses[detalleFactura.month]} {detalleFactura.year}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Importe</dt>
                      <dd className="mt-1 text-sm text-gray-900">{Number(detalleFactura.amount).toFixed(2)} €</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Estado</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                          ${detalleFactura.status === 'pagada' ? 'bg-green-100 text-green-800' : ''}
                          ${detalleFactura.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${detalleFactura.status === 'devuelta' ? 'bg-red-100 text-red-800' : ''}
                          ${detalleFactura.status === 'enviado_banco' ? 'bg-blue-100 text-blue-800' : ''}
                        `}>
                          {ESTADOS.find(e => e.value === detalleFactura.status)?.label}
                        </span>
                      </dd>
                    </div>
                    {canViewFullDetails(detalleFactura) && (
                      <>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Fecha de creación</dt>
                          <dd className="mt-1 text-sm text-gray-900">{new Date(detalleFactura.created_at).toLocaleString()}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Adjuntos</dt>
                          <dd className="mt-1">
                            {Array.isArray(detalleFactura.attachments) && detalleFactura.attachments.length > 0 ? (
                              <ul className="space-y-1">
                                {detalleFactura.attachments.map((url: string, idx: number) => (
                                  <li key={idx}>
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    >
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                      </svg>
                                      Adjunto {idx + 1}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-sm text-gray-400">Sin adjuntos</span>
                            )}
                          </dd>
                        </div>
                      </>
                    )}
                  </dl>
                </div>
              </div>
            )}
          </div>

          {/* Columna 2: Crear factura (solo para admin) */}
          {user?.role === 'admin' && (
            <div className="flex-1 bg-white rounded shadow p-4 border lg:max-w-md">
              <h2 className="text-xl font-semibold mb-4">Crear nueva factura</h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block mb-1 text-sm font-medium">Tipo de factura</label>
                  <select
                    name="type"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.type}
                    onChange={handleChange}
                  >
                    {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">Mes</label>
                    <select
                      name="month"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={form.month}
                      onChange={handleChange}
                    >
                      {meses.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">Año</label>
                    <select
                      name="year"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={form.year}
                      onChange={handleChange}
                    >
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">Importe (€)</label>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.amount}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">Estado</label>
                  <select
                    name="status"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.status}
                    onChange={handleChange}
                  >
                    {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">Adjuntos</label>
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

                <button
                  type="submit"
                  disabled={loading || !ownerId}
                  className="w-full bg-blue-600 text-white rounded py-2 px-4 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creando...' : 'Crear factura'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FacturasPropietario; 