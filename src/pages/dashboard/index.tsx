import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Properties from './properties/Properties';
import PropertyForm from './properties/PropertyForm';
import PropertyDetail from './properties/PropertyDetail';
import AgenciesList from './agencies/AgenciesList';
import AgencyForm from './agencies/AgencyForm';
import AgentsList from './agents/AgentsList';
import AgentForm from './agents/AgentForm';
import DashboardHome from './DashboardHome';
import AddProperty2 from './AddProperty2';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        {/* Ruta principal del dashboard */}
        <Route index element={<DashboardHome />} />

        {/* Rutas de Propiedades */}
        <Route path="properties">
          <Route index element={<Properties />} />
          <Route path="new" element={<PropertyForm />} />
          <Route path="edit/:id" element={<PropertyForm isEditing />} />
          <Route path=":id" element={<PropertyDetail />} />
        </Route>

        {/* Rutas de Agencias */}
        <Route path="agencies">
          <Route index element={<AgenciesList />} />
          <Route path="new" element={<AgencyForm />} />
          <Route path="edit/:id" element={<AgencyForm isEditing />} />
        </Route>

        {/* Rutas de Agentes */}
        <Route path="agents">
          <Route index element={<AgentsList />} />
          <Route path="new" element={<AgentForm />} />
          <Route path="edit/:id" element={<AgentForm isEditing />} />
        </Route>
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard; 