import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import IncidenciaForm from './pages/dashboard/incidencias/IncidenciaForm';
import ComisionesPanel from './pages/dashboard/commissions/ComisionesPanel';
import ProfilePanel from './pages/dashboard/profile/ProfilePanel';
import React from 'react';
import HomePage from './pages/home/HomePage';
import DashboardHome from './pages/dashboard/DashboardHome';
import { PropertiesPage } from './pages/properties';
import { PropertyDetail as PublicPropertyDetail } from './pages/properties/PropertyDetail';
import OwnerDashboard from './pages/dashboard/owner/OwnerDashboard';
import OwnerIncidents from './pages/dashboard/owner/OwnerIncidents';
import OwnerReservations from './pages/dashboard/owner/OwnerReservations';
import { OwnerInvoices, OwnerMessages } from './pages/dashboard/owner/OwnerDashboard';
import OwnerHome from './pages/dashboard/owner/OwnerHome';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHome from './pages/admin/AdminHome';
import AgentRequests from './pages/admin/AgentRequests';
import AdminReservations from './pages/dashboard/admin/AdminReservations';

const Profile = () => (
  <div style={{ padding: 32 }}>
    <h1>Perfil de usuario</h1>
    <p>Aquí irá la información del perfil.</p>
  </div>
);

// Componente para redirigir según el rol
const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  switch (user.role) {
    case 'admin':
      return <Navigate to="/dashboard/admin/agencies" replace />;
    case 'owner':
      return <Navigate to="/dashboard/owner" replace />;
    case 'agency':
      return <Navigate to="/dashboard/agencies" replace />;
    case 'agent':
      return <Navigate to="/dashboard/admin/agents" replace />;
    default:
      return <Navigate to="/dashboard" replace />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/propiedades" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PublicPropertyDetail />} />
          
          {/* Ruta por defecto del dashboard que redirige según el rol */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            } 
          />

          {/* Dashboard de Propietarios */}
          <Route path="/dashboard/owner" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>}>
            <Route index element={<OwnerHome />} />
            <Route path="incidents" element={<OwnerIncidents />} />
            <Route path="reservations" element={<OwnerReservations />} />
            <Route path="invoices" element={<OwnerInvoices />} />
            <Route path="messages" element={<OwnerMessages />} />
            <Route path="profile" element={<ProfilePanel />} />
          </Route>

          {/* Dashboard General */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
            <Route path="invoices" element={<FacturasPropietario />} />
            <Route path="reservations" element={<ReservationCalendar />} />
            <Route path="properties/:id/reservations" element={<ReservationCalendar />} />
            <Route path="properties/reservas" element={<ReservationCalendar />} />
          </Route>

          {/* Dashboard de Administración */}
          <Route path="/dashboard/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
            <Route index element={<AdminHome />} />
            <Route path="owners" element={<OwnersList />} />
            <Route path="owners/new" element={<OwnerForm />} />
            <Route path="owners/:id" element={<OwnerDetail />} />
            <Route path="owners/:id/edit" element={<OwnerForm isEditing />} />
            <Route path="properties" element={<Properties />} />
            <Route path="properties/new" element={<PropertyForm />} />
            <Route path="properties/:id" element={<PropertyDetail />} />
            <Route path="properties/:id/edit" element={<PropertyForm isEditing />} />
            <Route path="properties/:id/reservations" element={<ReservationCalendar />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="invoices" element={<FacturasPropietario />} />
            <Route path="incidents" element={<IncidenciasPanel />} />
            <Route path="incidents/new" element={<IncidenciaForm />} />
            <Route path="messages" element={<MessagesBoard />} />
            <Route path="commissions" element={<ComisionesPanel />} />
            <Route path="profile" element={<ProfilePanel />} />
            <Route path="agencies" element={<AgenciesList adminMode />} />
            <Route path="agencies/new" element={<AgencyForm />} />
            <Route path="agencies/:id" element={<AgencyDetail />} />
            <Route path="agencies/:id/edit" element={<AgencyForm isEditing />} />
            <Route path="agents" element={<AgentsList adminMode />} />
            <Route path="agents/new" element={<AgentForm />} />
            <Route path="agents/:id" element={<AgentDetail />} />
            <Route path="agents/:id/edit" element={<AgentForm isEditing />} />
            <Route path="contact-requests" element={<AgentRequests />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;