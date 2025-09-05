import { createClient } from '@supabase/supabase-js'
import { API_CONFIG } from './config'

const supabaseUrl = API_CONFIG.SUPABASE_URL
const supabaseAnonKey = API_CONFIG.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type ShareStatus = 'disponible' | 'reservada' | 'vendida'
export type FeatureCategory = 'exterior' | 'interior' | 'servicios'

export type NearbyService = 
  | 'playa_cercana'
  | 'supermercados'
  | 'vida_nocturna'
  | 'parques_naturales'
  | 'deportes_nauticos'
  | 'puerto_deportivo'
  | 'farmacias'

export type Agent = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  photo_url?: string
  agency_id?: string
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
  nearby_services: NearbyService[]
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
  latitude: number
  longitude: number
}

export interface PropertyFilters {
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  features?: string[];
  nearby_services?: NearbyService[];
  isSharedProperty?: boolean;
}

export async function getProperties(filters?: PropertyFilters): Promise<Property[]> {
  try {
    // Primero intentamos obtener los datos de la API externa
    const response = await fetch(API_CONFIG.PROPERTIES_API_URL);
    if (response.ok) {
      const externalData = await response.json();
      // Aquí podrías transformar los datos si el formato es diferente
      return externalData;
    }
  } catch (error) {
    console.error('Error fetching from external API:', error);
    // Si falla la API externa, usamos Supabase como respaldo
  }

  // Supabase como respaldo
  let query = supabase
    .from('properties')
    .select(`
      *,
      agent:agents(*),
      features:property_features(features(*))
    `)

  // Aplicar filtros si existen
  if (filters) {
    if (filters.bedrooms) {
      query = query.eq('bedrooms', filters.bedrooms)
    }
    if (filters.bathrooms) {
      query = query.eq('bathrooms', filters.bathrooms)
    }
    if (filters.minArea) {
      query = query.gte('area', filters.minArea)
    }
    if (filters.maxArea) {
      query = query.lte('area', filters.maxArea)
    }
    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice)
    }
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice)
    }
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }
    if (filters.isSharedProperty) {
      query = query.not('share1_price', 'is', null)
    }
    if (filters.nearby_services && filters.nearby_services.length > 0) {
      query = query.contains('nearby_services', filters.nearby_services)
    }
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching properties from Supabase:', error)
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