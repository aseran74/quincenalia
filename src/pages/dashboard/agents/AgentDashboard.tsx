import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  property_title: string;
  message: string;
  agent_id: string;
  created_at: string;
}

// Puedes obtener el usuario autenticado desde contexto o props
// Aquí lo dejamos como prop para flexibilidad
function AgentDashboard({ user }: { user: { id: string } }) {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_requests')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });
      setRequests(data || []);
      setLoading(false);
    };
    if (user?.id) fetchRequests();
  }, [user?.id]);

  if (loading) return <div className="p-8 text-center">Cargando solicitudes...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Solicitudes de contacto</h1>
      {requests.length === 0 ? (
        <div className="text-gray-500">No tienes solicitudes de contacto.</div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{req.name}</span>
                <span className="text-xs text-gray-400">{new Date(req.created_at).toLocaleString()}</span>
              </div>
              <div className="text-sm text-gray-600 mb-1">Email: {req.email}</div>
              <div className="text-sm text-gray-600 mb-1">Propiedad: {req.property_title}</div>
              <div className="text-gray-800 mt-2 whitespace-pre-line">{req.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AgentDashboard; 