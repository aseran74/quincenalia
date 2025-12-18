# Diagnóstico: Problema de Login con agency@example.com

## Problema Detectado

El usuario `agency@example.com` no puede iniciar sesión porque **el usuario no existe en Supabase Auth**.

## Análisis

1. **El código de login** (`src/pages/Login.tsx`) intenta autenticar usuarios usando `supabase.auth.signInWithPassword()`
2. **Los usuarios de prueba** están definidos en `src/data/mockData.ts` pero solo son datos mock para el frontend
3. **No hay migración o script** que cree estos usuarios en Supabase Auth
4. **El proyecto ID** es: `vpneiupvzsqzyrurcgmo`

## Solución

Se ha creado un script (`scripts/create-test-users.mjs`) que crea todos los usuarios de prueba necesarios.

### Pasos para crear los usuarios:

1. **Obtener la SERVICE_ROLE_KEY de Supabase:**
   - Ve a: https://app.supabase.com/project/vpneiupvzsqzyrurcgmo/settings/api
   - Copia la "service_role" key (⚠️ **NUNCA** la compartas públicamente)

2. **Ejecutar el script:**

   Opción A - Con archivo .env:
   ```bash
   # Crear/editar .env en la raíz del proyecto
   VITE_SUPABASE_URL=https://vpneiupvzsqzyrurcgmo.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
   
   # Ejecutar el script
   node scripts/create-test-users.mjs
   ```

   Opción B - Pasar la key como argumento:
   ```bash
   node scripts/create-test-users.mjs "tu-service-role-key-aqui"
   ```

3. **Verificar que los usuarios se crearon:**
   - El script mostrará un resumen de los usuarios creados
   - Intenta iniciar sesión con: `agency@example.com` / `password`

## Usuarios que se crearán:

- `admin@example.com` (rol: admin) - Contraseña: `password`
- `agency@example.com` (rol: agency) - Contraseña: `password`
- `agent@example.com` (rol: agent) - Contraseña: `password`
- `owner@example.com` (rol: owner) - Contraseña: `password`
- `interested@example.com` (rol: interested) - Contraseña: `password`

## Notas Importantes

- ⚠️ La SERVICE_ROLE_KEY tiene permisos completos, **nunca** la subas a Git
- ✅ El script verifica si los usuarios ya existen antes de crearlos
- ✅ Si un usuario ya existe, el script lo actualiza (cambia la contraseña si es necesario)
- ✅ El script crea tanto el usuario en Auth como el perfil en la tabla `profiles`

## Estructura de la tabla profiles

El script crea perfiles con los siguientes campos:
- `id`: UUID del usuario de Auth
- `first_name`: Nombre
- `last_name`: Apellido
- `email`: Email
- `phone`: Teléfono
- `role`: Rol del usuario (admin, agency, agent, owner, interested)

## Error: "database error granting user"

Si después de crear los usuarios recibes el error **"database error granting user"**, esto se debe a que faltan políticas RLS (Row Level Security) en la tabla `profiles`.

### Solución para el error RLS:

**Opción 1: Aplicar migración manualmente (Recomendado)**

1. Ve al SQL Editor de Supabase: https://app.supabase.com/project/vpneiupvzsqzyrurcgmo/sql/new
2. Copia y pega el contenido del archivo `supabase/migrations/20250103_enable_rls_profiles.sql`
3. Ejecuta el SQL

**Opción 2: Usar el script automático**

```bash
node scripts/apply-rls-policies.mjs
```

O si prefieres pasar la SERVICE_ROLE_KEY como argumento:
```bash
node scripts/apply-rls-policies.mjs "tu-service-role-key"
```

### ¿Qué hacen estas políticas?

- ✅ Permiten a los usuarios leer su propio perfil
- ✅ Permiten a los usuarios actualizar su propio perfil
- ✅ Permiten a los usuarios insertar su propio perfil al registrarse
- ✅ Permiten a los administradores leer y actualizar todos los perfiles

## Si el problema persiste

1. Verifica que la SERVICE_ROLE_KEY sea correcta
2. Verifica que la URL de Supabase sea correcta
3. Revisa los logs del script para ver errores específicos
4. Verifica en el dashboard de Supabase que los usuarios se crearon en Auth > Users
5. Verifica que las políticas RLS estén aplicadas en: Authentication > Policies > profiles

