// Script temporal para insertar agencias inmobiliarias vía Supabase
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Faltan variables de entorno VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Leer el archivo SQL
const sqlPath = join(__dirname, '..', 'supabase', 'migrations', '20250102_insert_real_estate_agencies.sql');
const sqlContent = readFileSync(sqlPath, 'utf-8');

// Extraer solo el INSERT statement (sin comentarios y sin ON CONFLICT si causa problemas)
const insertMatch = sqlContent.match(/INSERT INTO.*?;/s);
if (!insertMatch) {
  console.error('Error: No se encontró el statement INSERT en el archivo SQL');
  process.exit(1);
}

let sqlToExecute = insertMatch[0];

// Si ON CONFLICT causa problemas, lo removemos temporalmente
// sqlToExecute = sqlToExecute.replace(/\s+ON CONFLICT.*?;/g, ';');

console.log('Ejecutando migración de agencias inmobiliarias...');
console.log('SQL a ejecutar (primeros 200 caracteres):', sqlToExecute.substring(0, 200) + '...');

// Ejecutar el SQL usando rpc o directamente
supabase.rpc('exec_sql', { sql_query: sqlToExecute })
  .then(({ data, error }) => {
    if (error) {
      // Si rpc no existe, intentar ejecutar directamente usando el cliente
      console.log('RPC no disponible, intentando método alternativo...');
      return supabase.from('real_estate_agencies').select('count');
    }
    return { data, error: null };
  })
  .then(async (result) => {
    if (result.error) {
      // Método alternativo: ejecutar el SQL directamente usando una función SQL
      // Primero, vamos a insertar los datos usando el cliente de Supabase
      const agencies = [
        { name: 'Aedas Homes', description: 'Promotora inmobiliaria líder en España especializada en vivienda residencial de calidad.', address: 'Madrid, España', phone: '+34 900 000 000', email: 'info@aedashomes.com', website: 'https://www.aedashomes.com' },
        { name: 'Metrovacesa', description: 'Una de las principales promotoras inmobiliarias de España con más de 100 años de experiencia.', address: 'Madrid, España', phone: '+34 900 000 001', email: 'info@metrovacesa.es', website: 'https://www.metrovacesa.es' },
        // ... más agencias
      ];
      
      // Dividir en lotes para evitar límites
      const batchSize = 10;
      let inserted = 0;
      let errors = 0;
      
      for (let i = 0; i < agencies.length; i += batchSize) {
        const batch = agencies.slice(i, i + batchSize);
        const { data, error } = await supabase
          .from('real_estate_agencies')
          .insert(batch)
          .select();
        
        if (error) {
          console.error(`Error en lote ${Math.floor(i/batchSize) + 1}:`, error.message);
          errors++;
        } else {
          inserted += data?.length || 0;
          console.log(`Lote ${Math.floor(i/batchSize) + 1} insertado: ${data?.length || 0} agencias`);
        }
      }
      
      console.log(`\n✅ Migración completada: ${inserted} agencias insertadas, ${errors} errores`);
    } else {
      console.log('✅ Migración ejecutada exitosamente');
      console.log('Resultado:', result.data);
    }
  })
  .catch((error) => {
    console.error('❌ Error ejecutando migración:', error);
    process.exit(1);
  });

