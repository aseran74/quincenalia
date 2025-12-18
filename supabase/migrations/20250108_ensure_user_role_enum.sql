-- Asegurar que el enum user_role incluya 'interested'
-- Primero verificar si el enum existe y qué valores tiene

-- Ver valores actuales del enum
SELECT unnest(enum_range(NULL::user_role)) AS role_value;

-- Si 'interested' no está en el enum, agregarlo
DO $$ 
BEGIN
    -- Intentar agregar 'interested' al enum si no existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'interested' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        ALTER TYPE user_role ADD VALUE 'interested';
    END IF;
END $$;

-- Verificar que todos los valores necesarios estén presentes
SELECT unnest(enum_range(NULL::user_role)) AS role_value;

