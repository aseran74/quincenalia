
export type UserRole = 'admin' | 'agency' | 'agent' | 'owner' | 'interested';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
}

export interface Admin extends User {
  role: 'admin';
}

export interface Agency extends User {
  role: 'agency';
  agencyName: string;
  agents: string[]; // Agent IDs
}

export interface Agent extends User {
  role: 'agent';
  agencyId: string;
  properties: string[]; // Property IDs
  appointments: string[]; // Appointment IDs
}

export interface Owner extends User {
  role: 'owner';
  properties: string[]; // Property IDs
  invoices: string[]; // Invoice IDs
}

export interface Interested extends User {
  role: 'interested';
  interestedProperties: string[]; // Property IDs
  appointments: string[]; // Appointment IDs
}
