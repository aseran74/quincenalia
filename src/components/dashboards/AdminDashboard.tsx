import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Users, FileText, MessageSquare, AlertTriangle } from 'lucide-react';
import { mockProperties, mockUsers, mockInvoices, mockAppointments, mockIncidents } from '../../data/mockData';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const agentUsers = mockUsers.filter(user => user.role === 'agent');
  const ownerUsers = mockUsers.filter(user => user.role === 'owner');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard de Administrador</h1>
        <p className="text-muted-foreground">Gestión del sistema Casa Comunitaria Digital</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Propiedades</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProperties.length}</div>
            <p className="text-xs text-muted-foreground">
              propiedades registradas
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/dashboard/properties">Ver propiedades</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Agentes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              agentes activos
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/dashboard/agents">Ver agentes</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Facturas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              facturas emitidas
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/dashboard/invoices">Ver facturas</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Incidencias</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockIncidents.length}</div>
            <p className="text-xs text-muted-foreground">
              incidencias abiertas
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/dashboard/incidents">Ver incidencias</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Propietarios</CardTitle>
            <CardDescription>Lista de propietarios registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ownerUsers.map(owner => (
                <div key={owner.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="font-medium">{owner.name}</div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/dashboard/owners/${owner.id}`}>Ver</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Citas Programadas</CardTitle>
            <CardDescription>Próximas citas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAppointments.map(appointment => {
                const property = mockProperties.find(p => p.id === appointment.propertyId);
                const agent = mockUsers.find(u => u.id === appointment.agentId);
                return (
                  <div key={appointment.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{property?.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(appointment.date).toLocaleDateString()} - {agent?.name}
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
      </div>
    </div>
  );
};

export default AdminDashboard;
