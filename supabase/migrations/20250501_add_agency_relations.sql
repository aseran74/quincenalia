-- Add agency_id to profiles to link agents to agencies
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES real_estate_agencies(id);

-- Add agency_id to properties to link properties to agencies
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES real_estate_agencies(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_agency_id ON profiles(agency_id);
CREATE INDEX IF NOT EXISTS idx_properties_agency_id ON properties(agency_id);

