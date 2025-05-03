import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, AlertTriangle, FileText, Calendar } from 'lucide-react';
import { mockProperties, mockIncidents, mockInvoices } from '../../data/mockData';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Owner } from '@/types/user';

const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const owner = user as Owner;
  
  const ownerProperties = mockProperties.filter(property => 
    (property.share1_owner_id === owner.id && property.share1_status === 'vendida') ||
    (property.share2_owner_id === owner.id && property.share2_status === 'vendida') ||
    (property.share3_owner_id === owner.id && property.share3_status === 'vendida') ||
    (property.share4_owner_id === owner.id && property.share4_status === 'vendida')
  );
  
  const ownerIncidents = mockIncidents.filter(incident => 
    ownerProperties.some(property => property.id === incident.propertyId)
  );
  
  const ownerInvoices = mockInvoices.filter(invoice => 
    invoice.ownerId === owner.id
  );
  
  const unpaidInvoices = ownerInvoices.filter(invoice => !invoice.isPaid);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard de Propietario</h1>
        <p className="text-muted-foreground">Gestión de mis propiedades</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Propiedades</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ownerProperties.length}</div>
            <p className="text-xs text-muted-foreground">
              propiedades registradas
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/properties">Ver propiedades</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Incidencias</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ownerIncidents.length}</div>
            <p className="text-xs text-muted-foreground">
              incidencias abiertas
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/incidents">Ver incidencias</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Facturas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unpaidInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              facturas pendientes
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/invoices">Ver facturas</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              reservas activas
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/reservations">Ver reservas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mis Propiedades</CardTitle>
            <CardDescription>Lista de propiedades registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ownerProperties.map(property => (
                <div key={property.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{property.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {property.address}, {property.city}
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/properties/${property.id}`}>Ver</Link>
                  </Button>
                </div>
              ))}
              <Button className="w-full mt-2" variant="outline">
                Añadir Propiedad
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Facturas Pendientes</CardTitle>
            <CardDescription>Facturas por pagar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unpaidInvoices.map(invoice => {
                const property = mockProperties.find(p => p.id === invoice.propertyId);
                return (
                  <div key={invoice.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{invoice.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {property?.title} - {invoice.amount.toLocaleString('es-ES')}€
                      </div>
                      <div className="text-xs text-red-500">
                        Vence: {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/invoices/${invoice.id}`}>Ver</Link>
                    </Button>
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

export default OwnerDashboard;
