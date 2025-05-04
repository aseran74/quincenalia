import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, Home, MessageSquare } from 'lucide-react';

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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'resuelta':
      return <CheckCircle className="h-8 w-8 text-green-600" />;
    case 'revisada':
      return <Clock className="h-8 w-8 text-yellow-600" />;
    case 'pendiente':
      return <AlertTriangle className="h-8 w-8 text-red-600" />;
    default:
      return <AlertTriangle className="h-8 w-8 text-gray-400" />;
  }
};

const IncidentDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncident = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('incidents')
        .select('*, properties(title), profiles!incidents_owner_id_fkey(first_name, last_name)')
        .eq('id', id)
        .single();
      if (error) {
        toast({ title: 'Error', description: 'No se pudo cargar la incidencia', variant: 'destructive' });
        setLoading(false);
        return;
      }
      setIncident({
        ...data,
        property_title: data.properties?.title,
        owner_name: data.profiles ? `${data.profiles.first_name} ${data.profiles.last_name}` : 'Desconocido',
      });
      setLoading(false);
    };
    fetchIncident();
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]">Cargando...</div>;
  }
  if (!incident) {
    return <div className="text-center text-gray-500">No se encontró la incidencia.</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button variant="outline" className="mb-4" onClick={() => navigate(-1)}>
        Volver
      </Button>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            {getStatusIcon(incident.status)}
            <div>
              <CardTitle className="text-2xl font-bold mb-1">{incident.subject}</CardTitle>
              <div className="text-sm text-gray-500">{CAUSAS.find(c => c.value === incident.cause)?.label || incident.cause}</div>
            </div>
          </div>
          <div className="mb-4">
            <span className="font-semibold">Propiedad:</span> {incident.property_title || '-'}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Propietario:</span> {incident.owner_name || '-'}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Estado:</span> {ESTADOS.find(e => e.value === incident.status)?.label || incident.status}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Fecha:</span> {new Date(incident.created_at).toLocaleString()}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Descripción:</span>
            <div className="mt-1 text-gray-700 whitespace-pre-line">{incident.description}</div>
          </div>
          <div className="mb-4">
            <span className="font-semibold">Adjuntos:</span>
            <div className="mt-1">
              {Array.isArray(incident.attachments) && incident.attachments.length > 0 ? (
                <ul className="space-y-1">
                  {incident.attachments.map((url: string, idx: number) => (
                    <li key={idx}>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Adjunto {idx + 1}</a>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-400">Sin adjuntos</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncidentDetail; 