import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Owner } from '@/pages/dashboard/mensajes/MessagesBoard';
import { useAuth } from '@/context/AuthContext';

interface ChatSidebarOwnersProps {
  onSelectOwner: (owner: Owner | null) => void;
  selectedOwner: Owner | null;
  unreadCount: { [key: string]: number };
  searchTerm: string;
}

const ChatSidebarOwners: React.FC<ChatSidebarOwnersProps> = ({ onSelectOwner, selectedOwner, unreadCount, searchTerm }) => {
  const { user } = useAuth();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwners = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, photo_url, email')
        .eq('role', 'owner');

      if (error) {
        console.error('Error fetching owners:', error);
        setOwners([]);
      } else {
        // Si user_id no existe, usar id como user_id
        setOwners((data || []).map(owner => ({
          ...owner,
          user_id: owner.user_id || owner.id
        })));
      }
      setLoading(false);
    };

    fetchOwners();
  }, []);

  const filteredOwners = owners.filter(owner => {
    const fullName = `${owner.first_name} ${owner.last_name}`.toLowerCase();
    const email = owner.email?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Cargando propietarios...</div>;
  }

  return (
    <div className="h-full overflow-y-auto">
      {filteredOwners.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          {owners.length === 0 ? 'No hay propietarios disponibles.' : 'No se encontraron propietarios con ese criterio de búsqueda.'}
        </div>
      ) : (
        <div className="space-y-2 p-2">
          {filteredOwners.map((owner) => (
            <button
              key={owner.id}
              className={`w-full flex items-center gap-3 p-3 rounded hover:bg-gray-100 transition-colors ${
                selectedOwner?.id === owner.id ? 'bg-gray-100' : ''
              }`}
              onClick={() => onSelectOwner(owner)}
            >
              <img
                src={owner.photo_url || 'https://randomuser.me/api/portraits/men/32.jpg'}
                alt={`${owner.first_name} ${owner.last_name}`}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 text-left">
                <div className="font-medium">
                  {owner.first_name} {owner.last_name}
                </div>
                <div className="text-sm text-gray-500">{owner.email}</div>
              </div>
              {unreadCount[owner.user_id] > 0 && (
                <div className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount[owner.user_id]}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatSidebarOwners; 