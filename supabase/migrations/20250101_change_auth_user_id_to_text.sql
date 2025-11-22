-- Cambiar auth_user_id de UUID a TEXT para soportar UIDs de Firebase
-- Primero eliminar la constraint de foreign key si existe
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_auth_user_id_fkey;

-- Cambiar el tipo de columna de UUID a TEXT
ALTER TABLE profiles ALTER COLUMN auth_user_id TYPE TEXT USING auth_user_id::TEXT;

-- Crear un índice para mejorar las búsquedas
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON profiles(auth_user_id);

