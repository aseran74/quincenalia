import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vpneiupvzsqzyrurcgmo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbmVpdXB2enNxenlydXJjZ21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1Nzk3MjUsImV4cCI6MjA2MTE1NTcyNX0.MwM55HG_n-j6YpDBoe-NqFsHhqp6o5IgeYniM6fn4nM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type ShareStatus = 'disponible' | 'reservada' | 'vendida'
export type FeatureCategory = 'exterior' | 'interior' | 'servicios'

export type Agent = {
  id: string
  name: string
  email: string
  phone: string
  created_at: string
}

export type Feature = {
  id: string
  name: string
  category: FeatureCategory
  icon: string
  created_at: string
}

export type Property = {
  id: string
  title: string
  description: string
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  area: number
  image_url: string
  agent_id: string
  agent?: Agent
  features?: Feature[]
  share1_price: number | null
  share1_status: ShareStatus
  share2_price: number | null
  share2_status: ShareStatus
  share3_price: number | null
  share3_status: ShareStatus
  share4_price: number | null
  share4_status: ShareStatus
  created_at: string
  updated_at: string
}

export async function getProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      agent:agents(*),
      features:property_features(features(*))
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching properties:', error)
    return []
  }

  // Transform the features array to match our type
  return (data || []).map(property => ({
    ...property,
    features: property.features?.map(f => f.features)
  }))
}

export async function getFeatures(): Promise<Feature[]> {
  const { data, error } = await supabase
    .from('features')
    .select('*')
    .order('category', { ascending: true })

  if (error) {
    console.error('Error fetching features:', error)
    return []
  }

  return data || []
} 