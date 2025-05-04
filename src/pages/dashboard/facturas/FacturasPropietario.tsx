import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { ChevronDown, Paperclip, Eye, Trash2 } from 'lucide-react';

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
          .from('profiles')
          .select('id, first_name, last_name')
          .eq('role', 'owner');
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
        .select('*')
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

  const getStatusStyle = (status: string) => {
    const styles = {
      pendiente: { color: 'bg-yellow-100 text-yellow-800', borderColor: 'border-yellow-200' },
      enviado_banco: { color: 'bg-blue-100 text-blue-800', borderColor: 'border-blue-200' },
      pagada: { color: 'bg-green-100 text-green-800', borderColor: 'border-green-200' },
      devuelta: { color: 'bg-red-100 text-red-800', borderColor: 'border-red-200' },
    };
    return styles[status as keyof typeof styles] || { color: 'bg-gray-50 text-gray-800', borderColor: 'border-gray-200' };
  };

  return (
    <div className="p-2 md:p-6 max-w-7xl mx-auto font-sans">
      <h1 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">
        {user?.role === 'admin' ? 'Facturación a Propietarios' : 'Mis Facturas'}
      </h1>
      
      {/* Selector de Propietario para Admin */}
      {user?.role === 'admin' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <label htmlFor="ownerSelect" className="block mb-2 font-medium text-gray-700">Selecciona un Propietario</label>
          <div className="relative">
          <select
              id="ownerSelect"
              className="w-full md:w-48 border border-gray-300 rounded-md px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={ownerId}
            onChange={e => setOwnerId(e.target.value)}
          >
              <option value="">-- Todos los propietarios --</option>
            {owners.map(o => (
              <option key={o.id} value={o.id}>{o.first_name} {o.last_name}</option>
            ))}
          </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
            {!ownerId && <p className="text-xs text-gray-500 mt-1">Selecciona un propietario para ver o crear facturas.</p>}
        </div>
      )}

      {/* Contenido Principal: Lista y Formulario */}
      {(user?.role === 'owner' || (user?.role === 'admin' && ownerId)) && (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* Columna 1: Histórico de Facturas */}
          <div className="flex-1 bg-white rounded-lg shadow p-2 md:p-6 border border-gray-200 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 md:gap-3 mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">Histórico de facturas</h2>
              <div className="relative w-full sm:w-48">
              <select
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={filterEstado}
                onChange={e => setFilterEstado(e.target.value)}
                  aria-label="Filtrar por estado"
              >
                <option value="">Todos los estados</option>
                {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
                <ChevronDown className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Resumen de facturas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {(['Total', 'Pendiente', 'Pagada', 'Devuelta'] as const).map((statusType) => {
                 const count = statusType === 'Total' ? facturas.length : facturas.filter(f => f.status === statusType.toLowerCase()).length;
                 const amount = statusType === 'Total' ? facturas.reduce((acc, f) => acc + Number(f.amount), 0) : facturas.filter(f => f.status === statusType.toLowerCase()).reduce((acc, f) => acc + Number(f.amount), 0);
                 const styles = statusType === 'Pendiente' ? getStatusStyle('pendiente') : statusType === 'Pagada' ? getStatusStyle('pagada') : statusType === 'Devuelta' ? getStatusStyle('devuelta') : { color: 'bg-blue-50 text-blue-800', borderColor: 'border-blue-200'};

                 return (
                    <div key={statusType} className={`rounded-md p-3 text-center border ${styles.borderColor} ${styles.color.split(' ')[0]}`}>
                      <div className="text-xs text-gray-600 mb-1">{statusType === 'Total' ? 'Total Emitidas' : statusType}</div>
                      <div className="text-lg font-bold text-gray-900">{count}</div>
                      {statusType !== 'Total' && (
                          <div className="text-xs text-gray-700 mt-0.5">
                            {amount.toFixed(2)} €
              </div>
                      )}
                  </div>
                 );
              })}
                </div>

            {/* Lista de facturas responsiva - Cards en móvil, tabla en desktop */}
            <div className="mt-4">
              {facturas.length === 0 ? (
                  <p className="text-center text-gray-500 py-6">No hay facturas para mostrar.</p>
              ) : (
                  <>
                    <div className="space-y-4 md:hidden"> {/* Vista Móvil (Cards) */}
                      {facturas.map(f => {
                        const statusStyle = getStatusStyle(f.status);
                        return (
                          <div key={f.id} className={`border rounded-lg p-4 shadow-sm relative ${statusStyle.borderColor} bg-white hover:bg-gray-50`}> {/* Card móvil */}
                            <div className="flex justify-between items-start mb-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.color}`}>
                                    {ESTADOS.find(e => e.value === f.status)?.label}
                                </span>
                                <span className="text-sm font-semibold text-gray-800">{Number(f.amount).toFixed(2)} €</span>
              </div>
                            <p className="text-sm font-medium text-gray-700 mb-1">
                                {TIPOS.find(t => t.value === f.type)?.label || f.type} - {meses[f.month]} {f.year}
                            </p>
                            <p className="text-xs text-gray-500 mb-3">
                                Creada: {new Date(f.created_at).toLocaleDateString()}
                            </p>
                            <div className="flex items-center justify-between border-t border-gray-200 pt-3 mt-3">
                                <div className="flex items-center gap-2">
                                    {Array.isArray(f.attachments) && f.attachments.length > 0 && (
                                        <Paperclip className="h-4 w-4 text-gray-500" />
                                    )}
                                    {user?.role === 'admin' && (
                                         <div className="relative">
                                            <select
                                                value={f.status}
                                                onChange={e => handleEstadoChange(f.id, e.target.value)}
                                                className={`border rounded-md px-2 py-0.5 text-xs appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 ${statusStyle.borderColor} ${statusStyle.color.split(' ')[0]}`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-1.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                  </div>
                                    )}
                </div>
                                <div className="flex gap-3">
                                    <button
                                        title="Ver Detalles"
                                        className="text-blue-600 hover:text-blue-800"
                                        onClick={() => setDetalleFactura(f)}
                                    >
                                        <Eye size={18} />
                                    </button>
                                    {canDeleteInvoice(f) && (
                                        <button
                                            title="Eliminar Factura"
                                            className="text-red-600 hover:text-red-800"
                                            onClick={() => handleEliminarFactura(f.id)}
                                            disabled={loading}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                  </div>
                </div>
              </div>
                        );
                      })}
            </div>

                    <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg"> {/* Vista Desktop (Tabla) */}
                      <table className="min-w-full text-xs md:text-sm divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                            <th scope="col" className="px-3 py-2 md:px-4 md:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th scope="col" className="px-3 py-2 md:px-4 md:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Mes/Año</th>
                            <th scope="col" className="px-3 py-2 md:px-4 md:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Importe</th>
                            <th scope="col" className="px-3 py-2 md:px-4 md:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Adjuntos</th>
                            <th scope="col" className="px-3 py-2 md:px-4 md:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th scope="col" className="px-3 py-2 md:px-4 md:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Creada</th>
                            {(user?.role === 'admin') && <th scope="col" className="px-3 py-2 md:px-4 md:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Acciones</th>}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                          {facturas.map(f => {
                              const statusStyle = getStatusStyle(f.status);
                              return (
                        <tr key={f.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap text-gray-700">{TIPOS.find(t => t.value === f.type)?.label || f.type}</td>
                                <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap text-gray-700">{meses[f.month]} {f.year}</td>
                                <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap font-medium text-gray-900">{Number(f.amount).toFixed(2)} €</td>
                                <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap text-gray-500 text-center">
                            {Array.isArray(f.attachments) && f.attachments.length > 0 ? (
                                      <Paperclip className="h-4 w-4 inline-block text-blue-600" />
                            ) : (
                                      <span>-</span>
                            )}
                          </td>
                                <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap">
                            {canEditInvoice(f) ? (
                                      <div className="relative min-w-[120px]">
                              <select
                                value={f.status}
                                onChange={e => handleEstadoChange(f.id, e.target.value)}
                                          className={`w-full border rounded-md px-2 py-1 text-xs appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 ${statusStyle.borderColor} ${statusStyle.color.split(' ')[0]}`}
                              >
                                {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                              </select>
                                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                                      </div>
                            ) : (
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.color}`}>
                                {ESTADOS.find(e => e.value === f.status)?.label}
                              </span>
                            )}
                          </td>
                                <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap text-gray-500">{new Date(f.created_at).toLocaleDateString()}</td>
                                {(user?.role === 'admin') && (
                                  <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                <button
                                        title="Ver Detalles"
                                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-100 rounded"
                                  onClick={() => setDetalleFactura(f)}
                                >
                                        <Eye size={16} />
                                </button>
                                {canDeleteInvoice(f) && (
                                  <button
                                          title="Eliminar Factura"
                                          className="text-red-600 hover:text-red-800 p-1 hover:bg-red-100 rounded"
                                    onClick={() => handleEliminarFactura(f.id)}
                                          disabled={loading}
                                  >
                                          <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                              );
                          })}
                    </tbody>
                  </table>
                </div>
                  </>
              )}
            </div>

            {/* Modal de detalles (ya bastante responsivo) */}
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

      {user?.role === 'admin' && facturas.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Últimas 10 facturas emitidas</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-1 text-left">Tipo</th>
                  <th className="px-2 py-1 text-left">Importe</th>
                  <th className="px-2 py-1 text-left">Estado</th>
                  <th className="px-2 py-1 text-left">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {facturas.slice(0, 10).map(f => (
                  <tr key={f.id} className="border-b hover:bg-gray-50">
                    <td className="px-2 py-1">{TIPOS.find(t => t.value === f.type)?.label || f.type}</td>
                    <td className="px-2 py-1">{Number(f.amount).toFixed(2)} €</td>
                    <td className="px-2 py-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                        ${f.status === 'pagada' ? 'bg-green-100 text-green-800' : ''}
                        ${f.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${f.status === 'devuelta' ? 'bg-red-100 text-red-800' : ''}
                        ${f.status === 'enviado_banco' ? 'bg-blue-100 text-blue-800' : ''}
                      `}>
                        {ESTADOS.find(e => e.value === f.status)?.label}
                      </span>
                    </td>
                    <td className="px-2 py-1">{new Date(f.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacturasPropietario; 