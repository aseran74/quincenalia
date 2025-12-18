-- Crear o ajustar tabla favorites para soportar user_id como TEXT
-- Esto evita errores 400 cuando el user.id proviene de Firebase (no UUID)

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Si existe con tipos/constraints distintos, intentar normalizar
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_property_id_key;

-- Asegurar user_id TEXT
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'favorites'
      AND column_name = 'user_id'
      AND data_type <> 'text'
  ) THEN
    ALTER TABLE favorites ALTER COLUMN user_id TYPE TEXT USING user_id::text;
  END IF;
END $$;

-- Asegurar property_id UUID (si venía como TEXT, lo convertimos)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'favorites'
      AND column_name = 'property_id'
      AND data_type <> 'uuid'
  ) THEN
    ALTER TABLE favorites ALTER COLUMN property_id TYPE UUID USING property_id::uuid;
  END IF;
END $$;

-- Índices/unique
CREATE UNIQUE INDEX IF NOT EXISTS favorites_user_property_unique ON favorites(user_id, property_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON favorites(property_id);
