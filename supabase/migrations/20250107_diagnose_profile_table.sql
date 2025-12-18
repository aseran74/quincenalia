-- Script de diagnóstico para la tabla profiles
-- Ejecuta esto para ver la estructura completa de la tabla y posibles problemas

-- 1. Ver estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Ver constraints (restricciones)
SELECT
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass;

-- 3. Ver triggers
SELECT
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'profiles';

-- 4. Ver índices
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'profiles';

-- 5. Verificar si RLS está habilitado
SELECT
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- 6. Ver todas las políticas RLS (si están habilitadas)
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles';

