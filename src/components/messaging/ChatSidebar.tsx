import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Agent } from '@/pages/dashboard/mensajes/MessagesBoard';
import { useAuth } from '@/context/AuthContext';

interface ChatSidebarProps {
  onSelectAgent: (agent: Agent | null) => void;
  selectedAgent: Agent | null;
  unreadCount: { [key: string]: number };
  searchTerm: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onSelectAgent, selectedAgent, unreadCount, searchTerm }) => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('real_estate_agents')
        .select('id, user_id, first_name, last_name, photo_url, email');

      if (error) {
        console.error('Error fetching agents:', error);
        setAgents([]);
      } else {
        setAgents(data || []);
      }
      setLoading(false);
    };

    fetchAgents();
  }, []);

  const filteredAgents = agents.filter(agent => {
    const fullName = `${agent.first_name} ${agent.last_name}`.toLowerCase();
    const email = agent.email?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Cargando agentes...</div>;
  }

  return (
    <div className="h-full overflow-y-auto">
      {filteredAgents.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          {agents.length === 0 ? 'No hay agentes disponibles.' : 'No se encontraron agentes con ese criterio de búsqueda.'}
        </div>
      ) : (
        <div className="space-y-2 p-2">
          {filteredAgents.map((agent) => (
            <button
              key={agent.id}
              className={`w-full flex items-center gap-3 p-3 rounded hover:bg-gray-100 transition-colors ${
                selectedAgent?.id === agent.id ? 'bg-gray-100' : ''
              }`}
              onClick={() => onSelectAgent(agent)}
            >
              <img
                src={agent.photo_url || 'https://randomuser.me/api/portraits/men/32.jpg'}
                alt={`${agent.first_name} ${agent.last_name}`}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 text-left">
                <div className="font-medium">
                  {agent.first_name} {agent.last_name}
                </div>
                <div className="text-sm text-gray-500">{agent.email}</div>
              </div>
              {unreadCount[agent.user_id] > 0 && (
                <div className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount[agent.user_id]}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatSidebar; 