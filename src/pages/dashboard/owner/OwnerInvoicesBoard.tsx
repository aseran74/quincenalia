import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Eye, Paperclip } from 'lucide-react';

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

const OwnerInvoicesBoard: React.FC = () => {
  const { user } = useAuth();
  const [facturas, setFacturas] = useState<any[]>([]);
  const [detalleFactura, setDetalleFactura] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacturas = async () => {
      setLoading(true);
      if (!user) return;
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      if (!error) setFacturas(data || []);
      setLoading(false);
    };
    if (user) fetchFacturas();
  }, [user]);

  const getStatusStyle = (status: string) => {
    const styles = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      enviado_banco: 'bg-blue-100 text-blue-800',
      pagada: 'bg-green-100 text-green-800',
      devuelta: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-50 text-gray-800';
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Mis Facturas</h1>
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">Cargando...</div>
      ) : facturas.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">No tienes facturas disponibles.</Card>
      ) : (
        <div className="space-y-4">
          {facturas.map(f => (
            <Card key={f.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(f.status)}`}>{ESTADOS.find(e => e.value === f.status)?.label}</span>
                  <span className="text-sm font-semibold text-gray-800">{Number(f.amount).toFixed(2)} €</span>
                </div>
                <div className="text-sm text-gray-700 mb-1">
                  {TIPOS.find(t => t.value === f.type)?.label || f.type} - {meses[f.month]} {f.year}
                </div>
                <div className="text-xs text-gray-500">Creada: {new Date(f.created_at).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-3 mt-2 md:mt-0">
                {Array.isArray(f.attachments) && f.attachments.length > 0 && (
                  <Paperclip className="h-4 w-4 text-gray-500" />
                )}
                <button
                  title="Ver Detalles"
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => setDetalleFactura(f)}
                >
                  <Eye size={18} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {/* Modal de detalles */}
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
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusStyle(detalleFactura.status)}`}>
                    {ESTADOS.find(e => e.value === detalleFactura.status)?.label}
                  </span>
                </dd>
              </div>
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
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerInvoicesBoard; 