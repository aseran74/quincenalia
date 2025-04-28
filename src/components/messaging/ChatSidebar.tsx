import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Agent } from '@/pages/dashboard/mensajes/MessagesBoard';

interface ChatSidebarProps {
  onSelectAgent: (agent: Agent | null) => void;
  selectedAgent: Agent | null;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onSelectAgent, selectedAgent }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchAgents = async () => {
      const { data } = await supabase
        .from('real_estate_agents')
        .select('id, user_id, first_name, last_name, photo_url, email');
      setAgents(data || []);
    };
    fetchAgents();
  }, []);

  const filteredAgents = agents.filter(agent =>
    `${agent.first_name} ${agent.last_name}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <aside className="w-64 bg-gray-50 border-r h-full flex flex-col">
      <div className="sticky top-0 z-10 bg-gray-50 p-4 font-bold text-lg border-b flex items-center gap-2">
        <span className="flex-1 text-center">Agentes</span>
      </div>
      <div className="sticky top-[56px] z-10 bg-gray-50 p-2 border-b">
        <input
          type="text"
          className="w-full px-2 py-1 rounded border text-sm"
          placeholder="Buscar agente..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {filteredAgents.length === 0 && (
          <div className="text-gray-400 text-center mt-4">No hay agentes</div>
        )}
        {filteredAgents.map(agent => (
          <div
            key={agent.user_id}
            className={`flex flex-col items-center cursor-pointer rounded p-2 transition-all ${selectedAgent?.user_id === agent.user_id ? 'bg-blue-100 border border-blue-400' : 'hover:bg-gray-200'}`}
            onClick={() => onSelectAgent(agent)}
          >
            <img src={agent.photo_url || 'https://randomuser.me/api/portraits/men/32.jpg'} alt={agent.first_name} className="w-10 h-10 rounded-full" />
            <span className="text-xs mt-1 text-center">{agent.first_name} {agent.last_name}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default ChatSidebar; 