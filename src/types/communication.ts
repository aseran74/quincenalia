
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Appointment {
  id: string;
  propertyId: string;
  agentId: string;
  interestedId: string;
  date: Date;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Invoice {
  id: string;
  ownerId: string;
  propertyId: string;
  amount: number;
  description: string;
  dueDate: Date;
  isPaid: boolean;
  issuedAt: Date;
  paidAt?: Date;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  amount: number;
  quantity: number;
}
