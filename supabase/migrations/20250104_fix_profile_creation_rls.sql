-- Migración para corregir políticas RLS y permitir creación de perfiles
-- Esta migración elimina y recrea las políticas para evitar conflictos

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Política: Los usuarios pueden leer su propio perfil
-- Permite leer si el id coincide con auth.uid() o si auth_user_id coincide
CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
USING (
  auth.uid()::text = id::text 
  OR auth.uid()::text = auth_user_id
  OR (auth_user_id IS NOT NULL AND auth.uid()::text = auth_user_id::text)
);

-- Política: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (
  auth.uid()::text = id::text 
  OR auth.uid()::text = auth_user_id
  OR (auth_user_id IS NOT NULL AND auth.uid()::text = auth_user_id::text)
)
WITH CHECK (
  auth.uid()::text = id::text 
  OR auth.uid()::text = auth_user_id
  OR (auth_user_id IS NOT NULL AND auth.uid()::text = auth_user_id::text)
);

-- Política: Los usuarios pueden insertar su propio perfil
-- IMPORTANTE: Permitir inserción si el id o auth_user_id coincide con auth.uid()
-- También permitir si no hay autenticación (para casos especiales con service role)
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
WITH CHECK (
  auth.uid()::text = id::text 
  OR auth.uid()::text = auth_user_id
  OR (auth_user_id IS NOT NULL AND auth.uid()::text = auth_user_id::text)
  OR auth.uid() IS NULL  -- Permitir inserción cuando se usa service role
);

-- Política: Los administradores pueden leer todos los perfiles
CREATE POLICY "Admins can read all profiles"
ON profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE (p.id::text = auth.uid()::text OR p.auth_user_id = auth.uid()::text)
    AND p.role = 'admin'
  )
);

-- Política: Los administradores pueden actualizar todos los perfiles
CREATE POLICY "Admins can update all profiles"
ON profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE (p.id::text = auth.uid()::text OR p.auth_user_id = auth.uid()::text)
    AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE (p.id::text = auth.uid()::text OR p.auth_user_id = auth.uid()::text)
    AND p.role = 'admin'
  )
);

