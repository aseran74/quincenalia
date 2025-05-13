import { useAuth } from '@/context/AuthContext';

export default function AgentErpPage() {
  const { user } = useAuth();
  const isAgent = user?.role === 'agent';
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className={`text-2xl font-bold mb-4 ${isAgent ? 'text-right sm:text-left' : 'text-center'}`}>ERP</h1>
      <p className="text-gray-600">Esta sección estará disponible próximamente.</p>
    </div>
  );
} 