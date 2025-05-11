import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
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
import HomePage from './pages/home/HomePage';
import DashboardHome from './pages/dashboard/DashboardHome';
import { PropertiesPage } from './pages/properties';
import { PropertyDetail as PublicPropertyDetail } from './pages/properties/PropertyDetail';
import OwnerDashboard from './pages/dashboard/owner/OwnerDashboard';
import OwnerIncidents from './pages/dashboard/owner/OwnerIncidents';
import OwnerReservations from './pages/dashboard/owner/OwnerReservations';
import OwnerInvoicesBoard from './pages/dashboard/owner/OwnerInvoicesBoard';
import OwnerHome from './pages/dashboard/owner/OwnerHome';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHome from './pages/admin/AdminHome';
import AgentRequests from './pages/admin/AgentRequests';
import AdminReservations from './pages/dashboard/admin/AdminReservations';
import IncidentDetail from './pages/dashboard/incidencias/IncidentDetail';
import DashboardRedirect from './pages/dashboard/DashboardRedirect';
import OwnerMessagesBoard from './pages/dashboard/owner/OwnerMessagesBoard';
import OwnerExchange from './pages/dashboard/owner/OwnerExchange';
import AdminExchange from './pages/dashboard/admin/AdminExchange';
import OwnerSoldProperties from './pages/dashboard/owner/OwnerSoldProperties';
import CoPropertiesCalendar from './pages/dashboard/owner/CoPropertiesCalendar';
import ExploreExchangeProperties from './pages/dashboard/owner/ExploreExchangeProperties';
import AddProperty2 from './pages/dashboard/AddProperty2';

const Profile = () => (
  <div style={{ padding: 32 }}>
    <h1>Perfil de usuario</h1>
    <p>Aquí irá la información del perfil.</p>
  </div>
);

function RedirectToProperties() {
  const { id } = useParams();
  return <Navigate to={`/properties/${id}`} replace />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PublicPropertyDetail />} />
          {/* Redirección de /propiedades a /properties */}
          <Route path="/propiedades" element={<Navigate to="/properties" replace />} />
          {/* Redirección de /propiedades/:id a /properties/:id */}
          <Route path="/propiedades/:id" element={<RedirectToProperties />} />
          
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
            <Route path="exchange" element={<OwnerExchange />} />
            <Route path="invoices" element={<OwnerInvoicesBoard />} />
            <Route path="messages" element={<OwnerMessagesBoard />} />
            <Route path="profile" element={<ProfilePanel />} />
            <Route path="sold-properties" element={<OwnerSoldProperties />} />
            <Route path="copropiedades" element={<CoPropertiesCalendar />} />
            <Route path="explorar" element={<ExploreExchangeProperties />} />
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
            <Route path="incidents/:id" element={<IncidentDetail />} />
            <Route path="exchange" element={<AdminExchange />} />
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