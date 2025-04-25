
import { User, Admin, Agency, Agent, Owner, Interested } from '../types/user';
import { Property, Incident } from '../types/property';
import { Message, Appointment, Invoice } from '../types/communication';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
  },
  {
    id: '2',
    name: 'Real Estate Agency',
    email: 'agency@example.com',
    role: 'agency',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=agency'
  } as Agency,
  {
    id: '3',
    name: 'John Agent',
    email: 'agent@example.com',
    role: 'agent',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=agent',
    agencyId: '2',
    properties: ['1', '2'],
    appointments: ['1', '2']
  } as Agent,
  {
    id: '4',
    name: 'María Propietaria',
    email: 'owner@example.com',
    role: 'owner',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=owner',
    properties: ['1'],
    invoices: ['1']
  } as Owner,
  {
    id: '5',
    name: 'Pedro Interesado',
    email: 'interested@example.com',
    role: 'interested',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=interested',
    interestedProperties: ['1'],
    appointments: ['1']
  } as Interested
];

// Mock Properties
export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Apartamento Luminoso',
    description: 'Hermoso apartamento con mucha luz natural y vistas increíbles.',
    address: 'Calle Principal 123',
    city: 'Madrid',
    price: 250000,
    bedrooms: 2,
    bathrooms: 1,
    area: 85,
    images: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e'
    ],
    ownerId: '4',
    agentId: '3',
    available: true
  },
  {
    id: '2',
    title: 'Casa con Jardín',
    description: 'Espaciosa casa familiar con amplio jardín y piscina.',
    address: 'Avenida Secundaria 456',
    city: 'Barcelona',
    price: 450000,
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    images: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a'
    ],
    ownerId: '4',
    agentId: '3',
    available: true
  }
];

// Mock Incidents
export const mockIncidents: Incident[] = [
  {
    id: '1',
    propertyId: '1',
    reportedBy: '4',
    title: 'Piscina Sucia',
    description: 'La piscina comunitaria está sucia y requiere limpieza.',
    status: 'open',
    createdAt: new Date('2023-04-10'),
    updatedAt: new Date('2023-04-10')
  }
];

// Mock Messages
export const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '5',
    receiverId: '3',
    content: 'Estoy interesado en el apartamento. ¿Podemos agendar una visita?',
    timestamp: new Date('2023-04-08T10:30:00'),
    read: true
  },
  {
    id: '2',
    senderId: '3',
    receiverId: '5',
    content: 'Claro, podemos programar una visita para este fin de semana. ¿Le parece bien el sábado?',
    timestamp: new Date('2023-04-08T11:15:00'),
    read: false
  }
];

// Mock Appointments
export const mockAppointments: Appointment[] = [
  {
    id: '1',
    propertyId: '1',
    agentId: '3',
    interestedId: '5',
    date: new Date('2023-04-15T15:00:00'),
    status: 'scheduled',
    notes: 'Mostrar todas las habitaciones y áreas comunes.'
  },
  {
    id: '2',
    propertyId: '2',
    agentId: '3',
    interestedId: '5',
    date: new Date('2023-04-16T16:30:00'),
    status: 'confirmed',
    notes: 'Cliente muy interesado en el jardín y la piscina.'
  }
];

// Mock Invoices
export const mockInvoices: Invoice[] = [
  {
    id: '1',
    ownerId: '4',
    propertyId: '1',
    amount: 350,
    description: 'Factura mensual de mantenimiento',
    dueDate: new Date('2023-04-30'),
    isPaid: false,
    issuedAt: new Date('2023-04-01'),
    items: [
      {
        description: 'Mantenimiento de áreas comunes',
        amount: 200,
        quantity: 1
      },
      {
        description: 'Servicio de seguridad',
        amount: 150,
        quantity: 1
      }
    ]
  }
];
