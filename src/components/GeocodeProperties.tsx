import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export const GeocodeProperties = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleGeocode = async () => {
    try {
      setLoading(true);
      setResult('');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setResult('No hay sesión activa');
        return;
      }

      const response = await fetch('/functions/v1/geocode-properties', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();
      setResult(data.message);
    } catch (error) {
      console.error('Error geocodificando propiedades:', error);
      setResult('Error al geocodificar las propiedades');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      <h2 className="text-lg font-semibold">Geocodificar Propiedades</h2>
      <p className="text-sm text-gray-600">
        Este proceso actualizará las coordenadas de todas las propiedades que no las tengan,
        utilizando sus direcciones.
      </p>
      <div className="flex items-center gap-4">
        <Button
          onClick={handleGeocode}
          disabled={loading}
        >
          {loading ? 'Geocodificando...' : 'Geocodificar Propiedades'}
        </Button>
        {result && (
          <p className="text-sm">
            {result}
          </p>
        )}
      </div>
    </div>
  );
}; 