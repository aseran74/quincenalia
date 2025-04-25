
export interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  ownerId: string;
  agentId?: string;
  available: boolean;
  availableDates?: DateRange[];
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
