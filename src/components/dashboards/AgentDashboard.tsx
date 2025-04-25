
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Calendar, MessageSquare, Users } from 'lucide-react';
import { mockProperties, mockUsers, mockAppointments, mockMessages } from '../../data/mockData';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Agent } from '@/types/user';

const AgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const agent = user as Agent;
  
  const agentProperties = mockProperties.filter(property => 
    property.agentId === agent.id
  );
  
  const agentAppointments = mockAppointments.filter(appointment => 
    appointment.agentId === agent.id
  );
  
  const agentMessages = mockMessages.filter(message => 
    message.senderId === agent.id || message.receiverId === agent.id
  );
  
  const unreadMessages = mockMessages.filter(message => 
    message.receiverId === agent.id && !message.read
  );
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard de Agente</h1>
        <p className="text-muted-foreground">Gestión de propiedades y citas</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Propiedades</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentProperties.length}</div>
            <p className="text-xs text-muted-foreground">
              propiedades asignadas
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/properties">Ver propiedades</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Citas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              citas programadas
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/appointments">Ver citas</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadMessages.length}</div>
            <p className="text-xs text-muted-foreground">
              mensajes sin leer
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/messages">Ver mensajes</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Interesados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(agentAppointments.map(a => a.interestedId)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              personas interesadas
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Citas</CardTitle>
            <CardDescription>Citas programadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentAppointments.map(appointment => {
                const property = mockProperties.find(p => p.id === appointment.propertyId);
                const interested = mockUsers.find(u => u.id === appointment.interestedId);
                return (
                  <div key={appointment.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{property?.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(appointment.date).toLocaleDateString()} - {interested?.name}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      appointment.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {appointment.status === 'scheduled' ? 'Agendada' :
                       appointment.status === 'confirmed' ? 'Confirmada' :
                       appointment.status === 'completed' ? 'Completada' :
                       'Cancelada'}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Mis Propiedades</CardTitle>
            <CardDescription>Propiedades asignadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentProperties.map(property => (
                <div key={property.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{property.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {property.city} - {property.price.toLocaleString('es-ES')}€
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/properties/${property.id}`}>Ver</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentDashboard;
