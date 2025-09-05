import { useAuth } from '@/context/AuthContext';

export default function AgentProfilePage() {
  const { user } = useAuth();
  const isAgent = user?.role === 'agent';
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className={`text-2xl font-bold mb-4 ${isAgent ? 'text-right sm:text-left' : 'text-center'}`}>Mi perfil</h1>
      <p className="text-gray-600">Aquí podrás ver y editar los datos de tu perfil próximamente.</p>
    </div>
  );
} 