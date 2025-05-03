import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import ReservationCalendar from '../properties/ReservationCalendar';

interface Reservation {
  id: string;
  property_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
}

interface Property {
  id: string;
  title: string;
}

interface Owner {
  id: string;
  first_name: string;
  last_name: string;
}

const AdminReservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [filterProperty, setFilterProperty] = useState('all');
  const [filterOwner, setFilterOwner] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Traer reservas, propiedades y owners
    const { data: reservationsData } = await supabase.from('property_reservations').select('*');
    const { data: propertiesData } = await supabase.from('properties').select('id, title');
    const { data: ownersData } = await supabase.from('property_owners').select('id, first_name, last_name');
    setReservations(reservationsData || []);
    setProperties(propertiesData || []);
    setOwners(ownersData || []);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase.from('property_reservations').update({ status }).eq('id', id);
    if (!error) {
      toast({ title: 'Éxito', description: 'Estado actualizado' });
      fetchData();
    } else {
      toast({ title: 'Error', description: 'No se pudo actualizar el estado', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('property_reservations').delete().eq('id', id);
    if (!error) {
      toast({ title: 'Eliminada', description: 'Reserva eliminada' });
      fetchData();
    } else {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
    }
    setReservationToDelete(null);
  };

  // Filtros
  const filteredReservations = reservations.filter(r =>
    (filterProperty === 'all' || r.property_id === filterProperty) &&
    (filterOwner === 'all' || r.owner_id === filterOwner) &&
    (filterStatus === 'all' || r.status === filterStatus)
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Reservas</h1>
      <div className="flex gap-4 mb-4">
        <Select value={filterProperty} onValueChange={setFilterProperty}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Propiedad" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterOwner} onValueChange={setFilterOwner}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Propietario" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {owners.map(o => <SelectItem key={o.id} value={o.id}>{o.first_name} {o.last_name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="aprobada">Aprobada</SelectItem>
            <SelectItem value="rechazada">Rechazada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setShowCreateModal(true)}>Nueva Reserva</Button>
      </div>
      <table className="w-full border mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Propiedad</th>
            <th className="p-2">Propietario</th>
            <th className="p-2">Fecha inicio</th>
            <th className="p-2">Fecha fin</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredReservations.map(r => {
            const property = properties.find(p => p.id === r.property_id);
            const owner = owners.find(o => o.id === r.owner_id);
            return (
              <tr key={r.id} className="border-b">
                <td className="p-2">{property?.title || '-'}</td>
                <td className="p-2">{owner ? `${owner.first_name} ${owner.last_name}` : '-'}</td>
                <td className="p-2">{r.start_date}</td>
                <td className="p-2">{r.end_date}</td>
                <td className="p-2">
                  <Select value={r.status} onValueChange={status => handleStatusChange(r.id, status)}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="aprobada">Aprobada</SelectItem>
                      <SelectItem value="rechazada">Rechazada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2 flex gap-2">
                  <Button variant="destructive" size="sm" onClick={() => setReservationToDelete(r)}>Eliminar</Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Modal de confirmación para eliminar */}
      {reservationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-bold mb-4">¿Eliminar reserva?</h2>
            <p>Esta acción no se puede deshacer.</p>
            <div className="flex gap-4 mt-4">
              <Button variant="outline" onClick={() => setReservationToDelete(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={() => handleDelete(reservationToDelete.id)}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}
      {/* Modal para crear nueva reserva (estructura base, lógica a implementar) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-lg font-bold mb-4">Nueva Reserva</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const property_id = (form.elements.namedItem('property_id') as HTMLSelectElement).value;
                const owner_id = (form.elements.namedItem('owner_id') as HTMLSelectElement).value;
                const start_date = (form.elements.namedItem('start_date') as HTMLInputElement).value;
                const end_date = (form.elements.namedItem('end_date') as HTMLInputElement).value;
                const status = (form.elements.namedItem('status') as HTMLSelectElement).value;
                if (!property_id || !owner_id || !start_date || !end_date) {
                  toast({ title: 'Error', description: 'Todos los campos son obligatorios', variant: 'destructive' });
                  return;
                }
                const { error } = await supabase.from('property_reservations').insert({ property_id, owner_id, start_date, end_date, status });
                if (!error) {
                  toast({ title: 'Reserva creada' });
                  setShowCreateModal(false);
                  fetchData();
                } else {
                  toast({ title: 'Error', description: 'No se pudo crear la reserva', variant: 'destructive' });
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block mb-1">Propiedad</label>
                <select name="property_id" className="w-full border rounded p-2" required>
                  <option value="">Selecciona una propiedad</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1">Propietario</label>
                <select name="owner_id" className="w-full border rounded p-2" required>
                  <option value="">Selecciona un propietario</option>
                  {owners.map(o => <option key={o.id} value={o.id}>{o.first_name} {o.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1">Fecha inicio</label>
                <input name="start_date" type="date" className="w-full border rounded p-2" required />
              </div>
              <div>
                <label className="block mb-1">Fecha fin</label>
                <input name="end_date" type="date" className="w-full border rounded p-2" required />
              </div>
              <div>
                <label className="block mb-1">Estado</label>
                <select name="status" className="w-full border rounded p-2" defaultValue="pendiente">
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobada">Aprobada</option>
                  <option value="rechazada">Rechazada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
                <Button type="submit">Crear</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Mostrar calendario y resumen si hay una propiedad seleccionada */}
      {filterProperty !== 'all' && (
        <div className="mt-8">
          <ReservationCalendar key={filterProperty} />
        </div>
      )}
    </div>
  );
};

export default AdminReservations; 