export interface Agent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  photo_url?: string;
  bio?: string;
  specialization?: string;
  license_number?: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images?: string[];
  features?: string[];
  nearby_services?: string[];
  latitude?: number;
  longitude?: number;
  agent?: Agent;
  share1_price?: number;
  share2_price?: number;
  share3_price?: number;
  share4_price?: number;
  share1_owner_id?: string;
  share2_owner_id?: string;
  share3_owner_id?: string;
  share4_owner_id?: string;
  share1_status?: string;
  share2_status?: string;
  share3_status?: string;
  share4_status?: string;
  address?: string;
  city?: string;
  type?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface Incident {
  id: string;
  propertyId: string;
  reportedBy: string; // User ID
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
  images?: string[];
}
