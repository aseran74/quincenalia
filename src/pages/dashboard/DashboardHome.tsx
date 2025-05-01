import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { HiOutlineHome, HiOutlineOfficeBuilding, HiOutlineUsers } from 'react-icons/hi';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DashboardHome = () => {
  const [activeView, setActiveView] = useState('kpis');

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Panel de Control</h1>
      
      <Tabs value={activeView} onValueChange={setActiveView} className="mb-6">
        <TabsList>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="messages">Mensajes e Incidencias</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="w-full flex flex-col lg:flex-row gap-6">
        {/* Panel principal: alterna entre KPIs y Mensajes/Incidencias */}
        {activeView === 'kpis' ? (
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map((i) => (
              <Card key={i} className="h-32 flex flex-col items-center justify-center">
                <CardHeader className="text-center w-full p-2 pb-0">
                  <h3 className="text-base font-semibold">KPI/Casilla {i}</h3>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center w-full">
                  <div className="text-3xl font-bold">--</div>
                  <p className="text-xs text-muted-foreground">Descripción</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Últimos Mensajes</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="border-b pb-3 last:border-0">
                      <p className="font-medium">Asunto del mensaje {i}</p>
                      <p className="text-sm text-muted-foreground">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                      <p className="text-xs text-muted-foreground mt-1">Hace {i} horas</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Últimas Incidencias</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="border-b pb-3 last:border-0">
                      <p className="font-medium">Incidencia #{i}</p>
                      <p className="text-sm text-muted-foreground">Descripción de la incidencia {i}</p>
                      <p className="text-xs text-muted-foreground mt-1">Estado: {i % 2 === 0 ? 'Pendiente' : 'En proceso'}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Panel lateral derecho: solo visible en desktop */}
        <div className="hidden lg:grid grid-cols-1 gap-4 w-[340px] min-w-[300px]">
          <Card>
            <CardHeader>
              <h3 className="text-base font-semibold">Últimos mensajes</h3>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>Mensaje 1 de ejemplo</li>
                <li>Mensaje 2 de ejemplo</li>
                <li>Mensaje 3 de ejemplo</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h3 className="text-base font-semibold">Últimas incidencias</h3>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>Incidencia 1 de ejemplo</li>
                <li>Incidencia 2 de ejemplo</li>
                <li>Incidencia 3 de ejemplo</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h3 className="text-base font-semibold">Simulación SEO / Clics</h3>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">1234</div>
              <p className="text-xs text-muted-foreground">Clics simulados este mes</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Actividad Reciente</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No hay actividad reciente para mostrar.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome; 