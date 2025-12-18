-- Migración completa para solucionar el problema de inserción de perfiles
-- Esta migración elimina todas las políticas y crea una nueva política permisiva para INSERT

-- Paso 1: Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Paso 2: Temporalmente deshabilitar RLS para verificar si ese es el problema
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Paso 3: Re-habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Paso 4: Crear política de INSERT completamente permisiva
-- Esto permite que cualquier usuario (o service role) pueda insertar un perfil
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
WITH CHECK (true);

-- Paso 5: Recrear las políticas de SELECT y UPDATE (más restrictivas)
CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
USING (
  auth.uid()::text = id::text 
  OR auth.uid()::text = auth_user_id
  OR (auth_user_id IS NOT NULL AND auth.uid()::text = auth_user_id::text)
);

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

-- Políticas de administrador
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

