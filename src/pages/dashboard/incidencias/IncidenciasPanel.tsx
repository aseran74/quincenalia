import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Plus, Clock, CheckCircle, XCircle, Home, MessageSquare } from 'lucide-react';

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

interface Incident {
  id: string;
  property_id: string;
  owner_id: string;
  subject: string;
  cause: string;
  description: string;
  status: 'pendiente' | 'revisada' | 'resuelta';
  created_at: string;
  property_title?: string;
  owner_name?: string;
}

const IncidenciasPanel = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [owners, setOwners] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [userProperties, setUserProperties] = useState<any[]>([]);
  const [form, setForm] = useState({
    property_id: '',
    owner_id: '',
    subject: '',
    cause: 'limpieza',
    description: '',
    status: 'recibida',
    attachments: [] as string[],
  });
  const [filter, setFilter] = useState({ estado: '', propiedad: '', propietario: '', causa: '' });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [detalleIncidencia, setDetalleIncidencia] = useState<any | null>(null);

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
      } else if (user?.role === 'owner') {
        const { data: ownerProperties } = await supabase
          .from('properties')
          .select('id, title')
          .or(`share1_owner_id.eq.${user.id},share2_owner_id.eq.${user.id},share3_owner_id.eq.${user.id},share4_owner_id.eq.${user.id}`);
        setUserProperties(ownerProperties || []);
        setProperties(ownerProperties || []);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('incidents')
        .select('*, properties(title), property_owners(first_name, last_name)')
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      const formattedIncidents = data?.map(incident => ({
        ...incident,
        property_title: incident.properties?.title,
        owner_name: incident.property_owners ? 
          `${incident.property_owners.first_name} ${incident.property_owners.last_name}` : 
          'Desconocido'
      })) || [];

      setIncidents(formattedIncidents);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las incidencias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
    if (user?.role !== 'admin' && !userProperties.some(p => p.id === form.property_id)) {
      toast({ title: 'Error', description: 'No tienes permiso para crear incidencias en esta propiedad', variant: 'destructive' });
      return;
    }
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
      fetchIncidents();
    } else {
      toast({ title: 'Error', description: 'Error al crear la incidencia', variant: 'destructive' });
    }
  };

  const handleEstadoChange = async (incidenciaId: string, nuevoEstado: string) => {
    await supabase.from('incidents').update({ status: nuevoEstado }).eq('id', incidenciaId);
    fetchIncidents();
    toast({ title: 'Estado actualizado', variant: 'default' });
  };

  const handleEliminarIncidencia = async (incidenciaId: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta incidencia?')) return;
    const { error } = await supabase.from('incidents').delete().eq('id', incidenciaId);
    if (!error) {
      toast({ title: 'Incidencia eliminada', variant: 'default' });
      fetchIncidents();
      if (detalleIncidencia && detalleIncidencia.id === incidenciaId) setDetalleIncidencia(null);
    } else {
      toast({ title: 'Error al eliminar', variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resuelta':
        return 'bg-green-500';
      case 'revisada':
        return 'bg-yellow-500';
      case 'pendiente':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resuelta':
        return <CheckCircle className="h-8 w-8" />;
      case 'revisada':
        return <Clock className="h-8 w-8" />;
      case 'pendiente':
        return <AlertTriangle className="h-8 w-8" />;
      default:
        return <AlertTriangle className="h-8 w-8" />;
    }
  };

  const getCauseLabel = (cause: string) => {
    return CAUSAS.find(c => c.value === cause)?.label || cause;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Incidencias</h1>
        <Button onClick={() => navigate('/dashboard/admin/incidents/new')}>
          <Plus className="h-5 w-5 mr-2" />
          Nueva Incidencia
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {incidents.map((incident) => (
          <Card 
            key={incident.id}
            className="group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => navigate(`/dashboard/admin/incidents/${incident.id}`)}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`p-4 rounded-full ${getStatusColor(incident.status)} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300`}>
                  <div className={`${getStatusColor(incident.status)} text-white rounded-full p-3`}>
                    {getStatusIcon(incident.status)}
                  </div>
                </div>

                <div>
                  <CardTitle className="text-xl font-bold mb-2">
                    {incident.subject}
                  </CardTitle>
                  
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center justify-center gap-2">
                      <Home className="h-4 w-4" />
                      <p className="text-sm">{incident.property_title}</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <p className="text-sm truncate">{getCauseLabel(incident.cause)}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(incident.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className={`mt-3 inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(incident.status)} bg-opacity-10 text-gray-700`}>
                    {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                  </div>
                </div>

                <div className="text-sm text-gray-500 line-clamp-2">
                  {incident.description}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IncidenciasPanel; 