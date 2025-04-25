
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Calendar, MessageSquare } from 'lucide-react';
import { mockProperties, mockAppointments, mockMessages } from '../../data/mockData';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Interested } from '@/types/user';

const InterestedDashboard: React.FC = () => {
  const { user } = useAuth();
  const interested = user as Interested;
  
  const interestedProperties = mockProperties.filter(property => 
    interested.interestedProperties?.includes(property.id)
  );
  
  const interestedAppointments = mockAppointments.filter(appointment => 
    appointment.interestedId === interested.id
  );
  
  const interestedMessages = mockMessages.filter(message => 
    message.senderId === interested.id || message.receiverId === interested.id
  );
  
  const unreadMessages = mockMessages.filter(message => 
    message.receiverId === interested.id && !message.read
  );
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard de Interesado</h1>
        <p className="text-muted-foreground">Encuentra tu propiedad ideal</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interestedProperties.length}</div>
            <p className="text-xs text-muted-foreground">
              propiedades guardadas
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/favorites">Ver favoritos</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Citas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interestedAppointments.length}</div>
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
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Citas</CardTitle>
            <CardDescription>Visitas programadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {interestedAppointments.map(appointment => {
                const property = mockProperties.find(p => p.id === appointment.propertyId);
                return (
                  <div key={appointment.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{property?.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(appointment.date).toLocaleDateString()} - {new Date(appointment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
              <Button asChild className="w-full mt-2" variant="outline">
                <Link to="/appointments">Ver todas</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Propiedades Destacadas</CardTitle>
            <CardDescription>Basado en tus intereses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProperties.slice(0, 3).map(property => (
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
              <Button asChild className="w-full mt-2" variant="outline">
                <Link to="/properties">Explorar más</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InterestedDashboard;
