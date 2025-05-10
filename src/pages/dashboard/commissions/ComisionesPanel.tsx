import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const ESTADOS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'pagada', label: 'Pagada' },
];

const ComisionesPanel: React.FC = () => {
  const [comisiones, setComisiones] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [filter, setFilter] = useState({ estado: '', agente: '', propiedad: '' });
  const [detalle, setDetalle] = useState<any | null>(null);
  const [edit, setEdit] = useState(false);
  const [editData, setEditData] = useState({ percentage: 3, amount: 0, status: 'pendiente' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('profiles').select('id, first_name, last_name').eq('role', 'agent').then(({ data }) => setAgents(data || []));
    supabase.from('properties').select('id, title').then(({ data }) => setProperties(data || []));
  }, []);

  useEffect(() => {
    fetchComisiones();
    // eslint-disable-next-line
  }, [filter]);

  const fetchComisiones = async () => {
    setLoading(true);
    let query = supabase.from('commissions').select('*').order('created_at', { ascending: false });
    if (filter.estado) query = query.eq('status', filter.estado);
    if (filter.agente) query = query.eq('agent_id', filter.agente);
    if (filter.propiedad) query = query.eq('property_id', filter.propiedad);
    const { data } = await query;
    setComisiones(data || []);
    setLoading(false);
  };

  const handleEstadoChange = async (id: string, nuevoEstado: string) => {
    await supabase.from('commissions').update({ status: nuevoEstado }).eq('id', id);
    fetchComisiones();
    toast({ title: 'Estado actualizado', variant: 'default' });
    if (detalle && detalle.id === id) setDetalle({ ...detalle, status: nuevoEstado });
  };

  const handleEdit = (com) => {
    setEdit(true);
    setEditData({ percentage: com.percentage, amount: com.amount, status: com.status });
  };

  const handleEditSave = async () => {
    if (!detalle) return;
    await supabase.from('commissions').update({ percentage: editData.percentage, amount: editData.amount, status: editData.status }).eq('id', detalle.id);
    toast({ title: 'Comisión actualizada', variant: 'default' });
    setEdit(false);
    fetchComisiones();
    setDetalle({ ...detalle, ...editData });
  };

  const handleDelete = async () => {
    if (!detalle) return;
    if (!window.confirm('¿Seguro que deseas eliminar esta comisión? Esta acción no se puede deshacer.')) return;
    await supabase.from('commissions').delete().eq('id', detalle.id);
    toast({ title: 'Comisión eliminada', variant: 'destructive' });
    setDetalle(null);
    fetchComisiones();
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto font-poppins">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Comisiones</h1>
      </div>
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select className="border rounded px-3 py-2 text-sm" value={filter.estado} onChange={e => setFilter(f => ({ ...f, estado: e.target.value }))}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
        <select className="border rounded px-3 py-2 text-sm" value={filter.agente} onChange={e => setFilter(f => ({ ...f, agente: e.target.value }))}>
          <option value="">Todos los agentes</option>
          {agents.map(a => <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>)}
        </select>
        <select className="border rounded px-3 py-2 text-sm" value={filter.propiedad} onChange={e => setFilter(f => ({ ...f, propiedad: e.target.value }))}>
          <option value="">Todas las propiedades</option>
          {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Histórico */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4 border min-h-[300px]">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">Histórico de comisiones</h2>
          {loading ? (
            <div className="flex items-center justify-center min-h-[120px]">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className='ml-2'>Cargando comisiones...</p>
            </div>
          ) : comisiones.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay comisiones para mostrar.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">Propiedad</th>
                    <th className="p-2">Agente</th>
                    <th className="p-2">Porcentaje</th>
                    <th className="p-2">Importe</th>
                    <th className="p-2">Estado</th>
                    <th className="p-2">Creada</th>
                    <th className="p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {comisiones.map(com => (
                    <tr key={com.id} className="border-t hover:bg-gray-50 transition">
                      <td className="p-2">{properties.find(p => p.id === com.property_id)?.title || '-'}</td>
                      <td className="p-2">{agents.find(a => a.id === com.agent_id) ? `${agents.find(a => a.id === com.agent_id).first_name} ${agents.find(a => a.id === com.agent_id).last_name}` : '-'}</td>
                      <td className="p-2">{com.percentage}%</td>
                      <td className="p-2">{Number(com.amount).toFixed(2)} €</td>
                      <td className="p-2">
                        <select
                          value={com.status}
                          onChange={e => handleEstadoChange(com.id, e.target.value)}
                          className="border rounded px-2 py-1 text-xs"
                        >
                          {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                        </select>
                      </td>
                      <td className="p-2">{new Date(com.created_at).toLocaleDateString()}</td>
                      <td className="p-2">
                        <button
                          className="text-blue-600 underline text-xs"
                          onClick={() => { setDetalle(com); setEdit(false); }}
                          title="Ver detalles"
                        >
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Detalle/edición */}
        <div className="bg-white rounded-lg shadow p-4 border min-h-[300px] flex flex-col">
          {detalle ? (
            <>
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">Detalle de comisión</h2>
              {!edit ? (
                <>
                  <div className="mb-2"><b>Propiedad:</b> {properties.find(p => p.id === detalle.property_id)?.title || '-'}</div>
                  <div className="mb-2"><b>Agente:</b> {agents.find(a => a.id === detalle.agent_id) ? `${agents.find(a => a.id === detalle.agent_id).first_name} ${agents.find(a => a.id === detalle.agent_id).last_name}` : '-'}</div>
                  <div className="mb-2"><b>Porcentaje:</b> {detalle.percentage}%</div>
                  <div className="mb-2"><b>Importe:</b> {Number(detalle.amount).toFixed(2)} €</div>
                  <div className="mb-2"><b>Estado:</b> {ESTADOS.find(e => e.value === detalle.status)?.label || detalle.status}</div>
                  <div className="mb-2"><b>Fecha de creación:</b> {new Date(detalle.created_at).toLocaleString()}</div>
                  <Button size="sm" className="bg-blue-600 text-white px-3 py-1 rounded mt-2 mr-2" onClick={() => handleEdit(detalle)}>Editar</Button>
                  <Button size="sm" variant="outline" className="bg-gray-100 px-3 py-1 rounded mt-2 mr-2" onClick={() => setDetalle(null)}>Cerrar</Button>
                  <Button size="sm" variant="destructive" className="bg-red-600 text-white px-3 py-1 rounded mt-2" onClick={handleDelete}>Eliminar</Button>
                </>
              ) : (
                <>
                  <div className="mb-2">
                    <label className="block mb-1 font-medium">Porcentaje</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      step={0.1}
                      value={editData.percentage}
                      onChange={e => setEditData(d => ({ ...d, percentage: Number(e.target.value) }))}
                      className="border rounded px-2 py-1 w-24"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block mb-1 font-medium">Importe</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={editData.amount}
                      onChange={e => setEditData(d => ({ ...d, amount: Number(e.target.value) }))}
                      className="border rounded px-2 py-1 w-32"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block mb-1 font-medium">Estado</label>
                    <select
                      value={editData.status}
                      onChange={e => setEditData(d => ({ ...d, status: e.target.value }))}
                      className="border rounded px-2 py-1"
                    >
                      {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                    </select>
                  </div>
                  <Button size="sm" className="bg-green-600 text-white px-3 py-1 rounded mt-2 mr-2" onClick={handleEditSave}>Guardar</Button>
                  <Button size="sm" variant="outline" className="bg-gray-100 px-3 py-1 rounded mt-2" onClick={() => setEdit(false)}>Cancelar</Button>
                </>
              )}
            </>
          ) : (
            <div className="text-gray-500 text-center mt-12">Selecciona una comisión para ver el detalle</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComisionesPanel; 