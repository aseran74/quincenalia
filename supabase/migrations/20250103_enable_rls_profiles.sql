-- Habilitar Row Level Security en la tabla profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

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
-- Nota: Esto asume que hay un rol 'admin' en la tabla profiles
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
