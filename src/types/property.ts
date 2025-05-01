import type { Database } from './database.types';

export type Property = Database['public']['Tables']['properties']['Row'] & {
  images?: string[];
  latitude?: number;
  longitude?: number;
  agent?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
};

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
