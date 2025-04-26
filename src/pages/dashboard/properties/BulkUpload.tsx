import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';

interface PropertyUpload {
  title: string;
  description: string;
  price: number;
  status: 'disponible' | 'reservado' | 'vendido';
  copropiedad: 'tipo1' | 'tipo2' | 'tipo3' | 'tipo4';
  features: string[];
  images: string[];
}

const BulkUpload: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  const processExcel = async (file: File): Promise<PropertyUpload[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          const properties: PropertyUpload[] = jsonData.map((row: any) => ({
            title: row.title || '',
            description: row.description || '',
            price: Number(row.price) || 0,
            status: row.status || 'disponible',
            copropiedad: row.copropiedad || 'tipo1',
            features: row.features ? row.features.split(',').map((f: string) => f.trim()) : [],
            images: row.images ? row.images.split(',').map((i: string) => i.trim()) : [],
          }));

          resolve(properties);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: 'Error',
        description: 'Por favor, selecciona un archivo',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const properties = await processExcel(file);
      
      const { error } = await supabase
        .from('properties')
        .insert(properties);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: `Se han importado ${properties.length} propiedades correctamente`,
      });

      navigate('/dashboard/properties');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Error al importar las propiedades',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        title: 'Ejemplo Propiedad',
        description: 'Descripción de ejemplo',
        price: 100000,
        status: 'disponible',
        copropiedad: 'tipo1',
        features: 'parking,pool,garden',
        images: 'url1,url2,url3'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'template_propiedades.xlsx');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/dashboard/properties')}>
          Volver
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Carga Masiva de Propiedades</h1>

        <div className="mb-6">
          <Button onClick={handleDownloadTemplate} variant="outline">
            Descargar Plantilla Excel
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="file">Archivo Excel</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-2">
              Sube un archivo Excel siguiendo el formato de la plantilla
            </p>
          </div>

          <Button type="submit" disabled={loading || !file}>
            {loading ? 'Importando...' : 'Importar Propiedades'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BulkUpload; 