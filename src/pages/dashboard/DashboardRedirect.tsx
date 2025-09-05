import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
    } else if (user.role === 'admin') {
      navigate('/dashboard/admin/reservations');
    } else if (user.role === 'owner') {
      navigate('/dashboard/owner/reservations');
    } else if (user.role === 'agency') {
      navigate('/dashboard/agencies');
    } else if (user.role === 'agent') {
      navigate('/dashboard/admin/agents');
    } else {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return null;
};

export default DashboardRedirect; 