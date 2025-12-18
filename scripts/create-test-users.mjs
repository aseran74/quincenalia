// Script para crear usuarios de prueba en Supabase Auth
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer variables de entorno desde .env si existe
let supabaseUrl, supabaseServiceKey;

// Primero intentar leer desde config.ts
try {
  const configPath = join(__dirname, '..', 'src', 'lib', 'config.ts');
  const configContent = readFileSync(configPath, 'utf-8');
  
  // Extraer SUPABASE_URL
  const urlMatch = configContent.match(/SUPABASE_URL:\s*['"]([^'"]+)['"]/);
  if (urlMatch) {
    supabaseUrl = urlMatch[1];
    console.log(`✅ URL de Supabase encontrada: ${supabaseUrl}`);
  }
} catch (error) {
  console.log('⚠️  No se pudo leer config.ts');
}

// Intentar leer desde .env
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
  // Si no hay .env, usar variables de entorno del sistema
  supabaseUrl = supabaseUrl || process.env.VITE_SUPABASE_URL;
  supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
}

// Permitir pasar SERVICE_ROLE_KEY como argumento de línea de comandos
if (process.argv.length > 2) {
  supabaseServiceKey = process.argv[2];
  console.log('✅ SERVICE_ROLE_KEY proporcionada como argumento');
}

if (!supabaseUrl) {
  console.error('❌ Error: Falta VITE_SUPABASE_URL');
  console.error('Necesitas configurar la URL de Supabase en .env o config.ts');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('⚠️  Advertencia: No se encontró SUPABASE_SERVICE_ROLE_KEY');
  console.error('Este script necesita la SERVICE_ROLE_KEY para crear usuarios.');
  console.error('Puedes obtenerla desde: https://app.supabase.com/project/[tu-proyecto]/settings/api');
  console.error('\nAgrega en tu archivo .env:');
  console.error('SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Usuarios de prueba a crear
const testUsers = [
  {
    email: 'admin@example.com',
    password: 'password',
    role: 'admin',
    first_name: 'Admin',
    last_name: 'User',
    phone: '+34 600 000 000'
  },
  {
    email: 'agency@example.com',
    password: 'password',
    role: 'agency',
    first_name: 'Real Estate',
    last_name: 'Agency',
    phone: '+34 600 000 001'
  },
  {
    email: 'agent@example.com',
    password: 'password',
    role: 'agent',
    first_name: 'John',
    last_name: 'Agent',
    phone: '+34 600 000 002'
  },
  {
    email: 'owner@example.com',
    password: 'password',
    role: 'owner',
    first_name: 'María',
    last_name: 'Propietaria',
    phone: '+34 600 000 003'
  },
  {
    email: 'interested@example.com',
    password: 'password',
    role: 'interested',
    first_name: 'Pedro',
    last_name: 'Interesado',
    phone: '+34 600 000 004'
  }
];

async function createTestUsers() {
  console.log('🚀 Iniciando creación de usuarios de prueba...\n');

  for (const userData of testUsers) {
    try {
      console.log(`📝 Creando usuario: ${userData.email}...`);

      // 1. Verificar si el usuario ya existe
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === userData.email);

      let userId;

      if (existingUser) {
        console.log(`   ⚠️  Usuario ${userData.email} ya existe, actualizando...`);
        userId = existingUser.id;

        // Actualizar contraseña si es necesario
        await supabase.auth.admin.updateUserById(userId, {
          password: userData.password,
          email_confirm: true
        });
      } else {
        // 2. Crear usuario en Auth
        const { data: userDataResult, error: userError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true, // Confirmar email automáticamente
          user_metadata: {
            role: userData.role
          }
        });

        if (userError) {
          throw userError;
        }

        userId = userDataResult.user.id;
        console.log(`   ✅ Usuario creado en Auth con ID: ${userId}`);
      }

      // 3. Verificar si el perfil ya existe
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        console.log(`   ⚠️  Perfil ya existe, actualizando...`);
        
        // Actualizar perfil existente
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role
          })
          .eq('id', userId);

        if (updateError) {
          throw updateError;
        }
        console.log(`   ✅ Perfil actualizado correctamente`);
      } else {
        // 4. Crear perfil en la tabla profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role
          }]);

        if (profileError) {
          throw profileError;
        }
        console.log(`   ✅ Perfil creado correctamente`);
      }

      console.log(`   ✨ ${userData.email} listo para usar (contraseña: ${userData.password})\n`);

    } catch (error) {
      console.error(`   ❌ Error al crear/actualizar ${userData.email}:`, error.message);
      console.error(`   Detalles:`, error);
      console.log('');
    }
  }

  console.log('🎉 Proceso completado!');
  console.log('\n📋 Resumen de usuarios de prueba:');
  testUsers.forEach(user => {
    console.log(`   - ${user.email} (${user.role}) - Contraseña: password`);
  });
}

// Ejecutar el script
createTestUsers().catch(console.error);
