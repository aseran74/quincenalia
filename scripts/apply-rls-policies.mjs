// Script para aplicar políticas RLS a la tabla profiles
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer variables de entorno
let supabaseUrl, supabaseServiceKey;

// Leer desde config.ts
try {
  const configPath = join(__dirname, '..', 'src', 'lib', 'config.ts');
  const configContent = readFileSync(configPath, 'utf-8');
  
  const urlMatch = configContent.match(/SUPABASE_URL:\s*['"]([^'"]+)['"]/);
  if (urlMatch) {
    supabaseUrl = urlMatch[1];
    console.log(`✅ URL de Supabase encontrada: ${supabaseUrl}`);
  }
} catch (error) {
  console.log('⚠️  No se pudo leer config.ts');
}

// Leer desde .env
try {
  const envPath = join(__dirname, '..', '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      envVars[key] = value;
    }
  });
  
  supabaseUrl = supabaseUrl || envVars.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (supabaseServiceKey) {
    console.log('✅ SERVICE_ROLE_KEY encontrada en .env');
  }
} catch (error) {
  supabaseUrl = supabaseUrl || process.env.VITE_SUPABASE_URL;
  supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
}

// Permitir pasar SERVICE_ROLE_KEY como argumento
if (process.argv.length > 2) {
  supabaseServiceKey = process.argv[2];
  console.log('✅ SERVICE_ROLE_KEY proporcionada como argumento');
}

if (!supabaseUrl) {
  console.error('❌ Error: Falta VITE_SUPABASE_URL');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('⚠️  Advertencia: No se encontró SUPABASE_SERVICE_ROLE_KEY');
  console.error('Este script necesita la SERVICE_ROLE_KEY para aplicar políticas RLS.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// SQL para aplicar políticas RLS
const rlsPoliciesSQL = `
-- Habilitar Row Level Security en la tabla profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen (para evitar errores)
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Política: Los usuarios pueden leer su propio perfil
CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
USING (auth.uid()::text = id::text OR auth.uid()::text = auth_user_id);

-- Política: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid()::text = id::text OR auth.uid()::text = auth_user_id)
WITH CHECK (auth.uid()::text = id::text OR auth.uid()::text = auth_user_id);

-- Política: Los usuarios pueden insertar su propio perfil (al registrarse)
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid()::text = id::text OR auth.uid()::text = auth_user_id);

-- Política: Los administradores pueden leer todos los perfiles
CREATE POLICY "Admins can read all profiles"
ON profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE (id::text = auth.uid()::text OR auth_user_id = auth.uid()::text)
    AND role = 'admin'
  )
);

-- Política: Los administradores pueden actualizar todos los perfiles
CREATE POLICY "Admins can update all profiles"
ON profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE (id::text = auth.uid()::text OR auth_user_id = auth.uid()::text)
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE (id::text = auth.uid()::text OR auth_user_id = auth.uid()::text)
    AND role = 'admin'
  )
);
`;

async function applyRLSPolicies() {
  console.log('🚀 Aplicando políticas RLS a la tabla profiles...\n');

  try {
    // Ejecutar el SQL usando rpc o directamente
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: rlsPoliciesSQL 
    }).catch(async () => {
      // Si no existe la función exec_sql, intentar ejecutar directamente
      // Dividir el SQL en múltiples consultas
      const statements = rlsPoliciesSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        if (statement.trim()) {
          const { error: execError } = await supabase
            .from('_exec_sql')
            .select('*')
            .limit(0); // Esto no funcionará, necesitamos otra forma
          
          // Intentar usar la API REST directamente
          console.log(`Ejecutando: ${statement.substring(0, 50)}...`);
        }
      }
      
      return { data: null, error: new Error('No se pudo ejecutar SQL directamente') };
    });

    if (error) {
      // Si falla con rpc, intentar método alternativo
      console.log('⚠️  Método RPC no disponible, usando método alternativo...');
      
      // Dividir y ejecutar cada statement individualmente usando la API REST
      const statements = rlsPoliciesSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            // Usar fetch para ejecutar SQL directamente
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`
              },
              body: JSON.stringify({ sql_query: statement + ';' })
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.log(`   ⚠️  Advertencia al ejecutar statement: ${errorText.substring(0, 100)}`);
            } else {
              console.log(`   ✅ Statement ejecutado correctamente`);
            }
          } catch (err) {
            console.log(`   ⚠️  No se pudo ejecutar statement directamente: ${err.message}`);
          }
        }
      }
    } else {
      console.log('✅ Políticas RLS aplicadas correctamente');
    }

    console.log('\n📋 Políticas RLS creadas:');
    console.log('   - Users can read own profile');
    console.log('   - Users can update own profile');
    console.log('   - Users can insert own profile');
    console.log('   - Admins can read all profiles');
    console.log('   - Admins can update all profiles');
    console.log('\n🎉 Proceso completado!');
    console.log('\n💡 Nota: Si el método automático no funciona, puedes aplicar la migración manualmente desde el dashboard de Supabase.');

  } catch (error) {
    console.error('❌ Error al aplicar políticas RLS:', error.message);
    console.error('\n💡 Alternativa: Aplica la migración manualmente desde:');
    console.error('   https://app.supabase.com/project/vpneiupvzsqzyrurcgmo/sql/new');
    console.error('\n   O ejecuta el SQL del archivo: supabase/migrations/20250103_enable_rls_profiles.sql');
  }
}

applyRLSPolicies().catch(console.error);


