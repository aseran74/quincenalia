
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import AgencyDashboard from '../components/dashboards/AgencyDashboard';
import AgentDashboard from '../components/dashboards/AgentDashboard';
import OwnerDashboard from '../components/dashboards/OwnerDashboard';
import InterestedDashboard from '../components/dashboards/InterestedDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'agency':
        return <AgencyDashboard />;
      case 'agent':
        return <AgentDashboard />;
      case 'owner':
        return <OwnerDashboard />;
      case 'interested':
        return <InterestedDashboard />;
      default:
        return <div>Dashboard no encontrado</div>;
    }
  };

  return (
    <AppLayout>
      {renderDashboard()}
    </AppLayout>
  );
};

export default Dashboard;
