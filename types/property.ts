export type Property = {
  id: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images?: string[];
  status?: 'disponible' | 'reservada' | 'vendida';
  latitude?: number;
  longitude?: number;
  agent_id?: string;
  created_at?: string;
  updated_at?: string;
}; 