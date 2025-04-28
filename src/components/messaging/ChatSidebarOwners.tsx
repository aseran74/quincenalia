import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Owner {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  photo_url?: string;
  email?: string;
}

interface ChatSidebarOwnersProps {
  onSelectOwner: (owner: Owner | null) => void;
  selectedOwner: Owner | null;
}

const ChatSidebarOwners: React.FC<ChatSidebarOwnersProps> = ({ onSelectOwner, selectedOwner }) => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchOwners = async () => {
      const { data } = await supabase
        .from('property_owners')
        .select('id, user_id, first_name, last_name, photo_url, email');
      setOwners(data || []);
    };
    fetchOwners();
  }, []);

  const filteredOwners = owners.filter(owner =>
    `${owner.first_name} ${owner.last_name}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <aside className="w-64 bg-gray-50 border-r h-full flex flex-col">
      <div className="sticky top-0 z-10 bg-gray-50 p-4 font-bold text-lg border-b flex items-center gap-2">
        <span className="flex-1 text-center">Propietarios</span>
      </div>
      <div className="sticky top-[56px] z-10 bg-gray-50 p-2 border-b">
        <input
          type="text"
          className="w-full px-2 py-1 rounded border text-sm"
          placeholder="Buscar propietario..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {filteredOwners.length === 0 && (
          <div className="text-gray-400 text-center mt-4">No hay propietarios</div>
        )}
        {filteredOwners.map(owner => (
          <div
            key={owner.user_id}
            className={`flex flex-col items-center cursor-pointer rounded p-2 transition-all ${selectedOwner?.user_id === owner.user_id ? 'bg-blue-100 border border-blue-400' : 'hover:bg-gray-200'}`}
            onClick={() => onSelectOwner(owner)}
          >
            <img src={owner.photo_url || 'https://randomuser.me/api/portraits/men/33.jpg'} alt={owner.first_name} className="w-10 h-10 rounded-full" />
            <span className="text-xs mt-1 text-center">{owner.first_name} {owner.last_name}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default ChatSidebarOwners; 