
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Users, Calendar } from 'lucide-react';
import { mockProperties, mockUsers, mockAppointments } from '../../data/mockData';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Agency } from '@/types/user';

const AgencyDashboard: React.FC = () => {
  const { user } = useAuth();
  const agency = user as Agency;
  
  const agencyAgents = mockUsers.filter(user => 
    user.role === 'agent' && (user as any).agencyId === agency.id
  );
  
  const agentIds = agencyAgents.map(agent => agent.id);
  
  const agencyProperties = mockProperties.filter(property => 
    agentIds.includes(property.agentId || '')
  );
  
  const agencyAppointments = mockAppointments.filter(appointment => 
    agentIds.includes(appointment.agentId)
  );
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard de Agencia</h1>
        <p className="text-muted-foreground">Gestión de agentes y propiedades</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Agentes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agencyAgents.length}</div>
            <p className="text-xs text-muted-foreground">
              agentes en la agencia
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/agents">Ver agentes</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Propiedades</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agencyProperties.length}</div>
            <p className="text-xs text-muted-foreground">
              propiedades gestionadas
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
            <div className="text-2xl font-bold">{agencyAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              citas programadas
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/appointments">Ver citas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mis Agentes</CardTitle>
            <CardDescription>Agentes registrados en la agencia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agencyAgents.map(agent => (
                <div key={agent.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-muted-foreground">{agent.email}</div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/agents/${agent.id}`}>Ver</Link>
                  </Button>
                </div>
              ))}
              <Button className="w-full mt-2" variant="outline">
                Añadir Agente
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Propiedades Destacadas</CardTitle>
            <CardDescription>Propiedades gestionadas por la agencia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agencyProperties.slice(0, 3).map(property => (
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
                <Link to="/properties">Ver todas</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgencyDashboard;
