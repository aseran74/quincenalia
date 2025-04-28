import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Properties from './pages/dashboard/properties/Properties';
import PropertyForm from './pages/dashboard/properties/PropertyForm';
import PropertyDetail from './pages/dashboard/properties/PropertyDetail';
import AgenciesList from './pages/dashboard/agencies/AgenciesList';
import AgencyForm from './pages/dashboard/agencies/AgencyForm';
import AgentsList from './pages/dashboard/agents/AgentsList';
import AgentForm from './pages/dashboard/agents/AgentForm';
import AgencyDetail from './pages/dashboard/agencies/AgencyDetail';
import AgentDetail from './pages/dashboard/agents/AgentDetail';
import { ProtectedRoute } from './components/ProtectedRoute';
import OwnersList from './pages/admin/owners/OwnersList';
import OwnerForm from './pages/admin/owners/OwnerForm';
import OwnerDetail from './pages/admin/owners/OwnerDetail';
import MessagesBoard from './pages/dashboard/mensajes/MessagesBoard';
import ReservationCalendar from './pages/dashboard/properties/ReservationCalendar';
import FacturasPropietario from './pages/dashboard/facturas/FacturasPropietario';
import IncidenciasPanel from './pages/dashboard/incidencias/IncidenciasPanel';
import ComisionesPanel from './pages/dashboard/commissions/ComisionesPanel';
import ProfilePanel from './pages/dashboard/profile/ProfilePanel';
import React from 'react';

const Profile = () => (
  <div style={{ padding: 32 }}>
    <h1>Perfil de usuario</h1>
    <p>Aquí irá la información del perfil.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
            <Route index element={<Properties />} />
            
            {/* Rutas de Propiedades */}
            <Route path="properties" element={<Properties />} />
            <Route path="properties/new" element={<PropertyForm />} />
            <Route path="properties/reservas" element={<ReservationCalendar />} />
            <Route path="properties/:id" element={<PropertyDetail />} />
            <Route path="properties/:id/edit" element={<PropertyForm isEditing />} />
            
            {/* Rutas de Agencias */}
            <Route path="agencies" element={<AgenciesList />} />
            <Route path="agencies/new" element={<AgencyForm />} />
            <Route path="agencies/:id/edit" element={<AgencyForm isEditing />} />
            <Route path="agencies/:id" element={<AgencyDetail />} />
            
            {/* Rutas de Agentes */}
            <Route path="agents" element={<AgentsList />} />
            <Route path="agents/new" element={<AgentForm />} />
            <Route path="agents/:id/edit" element={<AgentForm isEditing />} />
            <Route path="agents/:id" element={<AgentDetail />} />
            {/* Ruta de Mensajería */}
            <Route path="mensajes" element={<MessagesBoard />} />
            <Route path="messages" element={<MessagesBoard />} />
            <Route path="profile" element={<ProtectedRoute><ProfilePanel /></ProtectedRoute>} />
            <Route path="invoices" element={<FacturasPropietario />} />
            <Route path="incidents" element={<IncidenciasPanel />} />
            <Route path="commissions" element={<ComisionesPanel />} />
          </Route>
          {/* RUTAS DE PROPIETARIOS ADMIN CON LAYOUT DASHBOARD */}
          <Route path="/admin/owners" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
            <Route index element={<OwnersList />} />
            <Route path="new" element={<OwnerForm />} />
            <Route path=":id" element={<OwnerDetail />} />
            <Route path=":id/edit" element={<OwnerForm />} />
          </Route>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
            <Route index element={<Properties />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
