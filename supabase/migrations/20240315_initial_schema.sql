-- Create custom types
CREATE TYPE share_status AS ENUM ('disponible', 'reservada', 'vendida');

-- Create feature categories
CREATE TYPE feature_category AS ENUM ('exterior', 'interior', 'servicios');

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create features table
CREATE TABLE IF NOT EXISTS features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category feature_category NOT NULL,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    area DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    
    -- Agente que gestiona la propiedad
    agent_id UUID REFERENCES agents(id),
    
    -- Shares y sus estados
    share1_price DECIMAL(12,2),
    share1_status share_status DEFAULT 'disponible',
    
    share2_price DECIMAL(12,2),
    share2_status share_status DEFAULT 'disponible',
    
    share3_price DECIMAL(12,2),
    share3_status share_status DEFAULT 'disponible',
    
    share4_price DECIMAL(12,2),
    share4_status share_status DEFAULT 'disponible',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create property_features junction table
CREATE TABLE IF NOT EXISTS property_features (
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
    PRIMARY KEY (property_id, feature_id)
);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample agents
INSERT INTO agents (name, email, phone) VALUES
    ('Ana García', 'ana.garcia@example.com', '+34 666 111 222'),
    ('Carlos Rodríguez', 'carlos.rodriguez@example.com', '+34 666 333 444');

-- Insert sample features
INSERT INTO features (name, category, icon) VALUES
    -- Características exteriores
    ('Piscina', 'exterior', '🏊‍♂️'),
    ('Jardín', 'exterior', '🌳'),
    ('Barbacoa', 'exterior', '🍖'),
    ('Terraza', 'exterior', '🏡'),
    ('Garaje', 'exterior', '🚗'),
    
    -- Características interiores
    ('Aire Acondicionado', 'interior', '❄️'),
    ('Calefacción', 'interior', '🔥'),
    ('Lavavajillas', 'interior', '🍽️'),
    ('Lavadora', 'interior', '👕'),
    ('Secadora', 'interior', '👚'),
    ('Armarios Empotrados', 'interior', '🗄️'),
    
    -- Servicios
    ('Internet Fibra', 'servicios', '📡'),
    ('Seguridad 24h', 'servicios', '👮'),
    ('Ascensor', 'servicios', '🔝'),
    ('Trastero', 'servicios', '📦');

-- Insert sample properties
INSERT INTO properties (
    title,
    description,
    price,
    location,
    bedrooms,
    bathrooms,
    area,
    image_url,
    agent_id,
    share1_price,
    share1_status,
    share2_price,
    share2_status,
    share3_price,
    share3_status,
    share4_price,
    share4_status
) 
SELECT
    'Apartamento Moderno ' || g,
    'Hermoso apartamento con vistas panorámicas y acabados de lujo. Ubicado en una zona tranquila pero cerca de todos los servicios.',
    300000 + (random() * 200000)::int,
    CASE (random() * 3)::int
        WHEN 0 THEN 'Madrid Centro'
        WHEN 1 THEN 'Barcelona Eixample'
        WHEN 2 THEN 'Valencia Ciudad'
        ELSE 'Sevilla Centro'
    END,
    (random() * 3 + 1)::int,
    (random() * 2 + 1)::int,
    60 + (random() * 100)::int,
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3',
    (SELECT id FROM agents ORDER BY random() LIMIT 1),
    75000 + (random() * 50000)::int,
    'disponible'::share_status,
    75000 + (random() * 50000)::int,
    'disponible'::share_status,
    75000 + (random() * 50000)::int,
    'disponible'::share_status,
    75000 + (random() * 50000)::int,
    'disponible'::share_status
FROM generate_series(1, 10) g;

-- Insert sample property features
INSERT INTO property_features (property_id, feature_id)
SELECT 
    p.id,
    f.id
FROM properties p
CROSS JOIN features f
WHERE random() > 0.5; 