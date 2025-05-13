import { useAuth } from '@/context/AuthContext';
import ComisionesPanel from '@/pages/dashboard/commissions/ComisionesPanel';

export default function AgentComisionesPage() {
  const { user } = useAuth();
  // ComisionesPanel ya filtra por agente si el usuario es agente, pero si no, podrías pasar una prop extra
  return (
    <div className="max-w-6xl mx-auto py-8">
      <ComisionesPanel agentId={user?.id} />
    </div>
  );
} 