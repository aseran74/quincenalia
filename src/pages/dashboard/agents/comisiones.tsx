import { useAuth } from '@/context/AuthContext';
import ComisionesPanel from '@/pages/dashboard/commissions/ComisionesPanel';

export default function AgentComisionesPage() {
  const { user } = useAuth();
  const isAgent = user?.role === 'agent';
  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className={`text-2xl font-bold mb-4 ${isAgent ? 'text-right sm:text-left' : 'text-center'}`}>Comisiones</h1>
      <ComisionesPanel agentId={user?.id} />
    </div>
  );
} 