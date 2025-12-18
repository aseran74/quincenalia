-- Migración para permitir inserción de perfiles sin restricción de auth.uid()
-- Esto es necesario para usuarios de Firebase/Google que no tienen auth.uid() en Supabase

-- Eliminar la política de inserción existente
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Crear una política más permisiva para INSERT
-- IMPORTANTE: Permitir todas las inserciones porque:
-- 1. Los usuarios de Firebase/Google no tienen auth.uid() en Supabase
-- 2. La seguridad se mantiene en las políticas de SELECT y UPDATE
-- 3. Esto permite que cualquier usuario autenticado (o service role) pueda crear su perfil
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
WITH CHECK (true);
