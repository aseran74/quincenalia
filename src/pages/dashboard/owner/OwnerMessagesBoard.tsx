import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ChatWindow from '@/components/messaging/ChatWindow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  role: string;
  photo_url?: string;
}

const OwnerMessagesBoard: React.FC = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarVisible(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Cargar admin y otros propietarios (excepto el propio usuario)
    const fetchContacts = async () => {
      const { data: admins } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, email, role, photo_url')
        .eq('role', 'admin');
      const { data: owners } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, email, role, photo_url')
        .eq('role', 'owner')
        .neq('id', user?.id);
      setContacts([...(admins || []), ...(owners || [])]);
    };
    if (user) fetchContacts();
  }, [user]);

  const filteredContacts = contacts.filter(c => {
    const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
    const email = c.email?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  // Cerrar sidebar en móvil cuando se selecciona un usuario
  useEffect(() => {
    if (isMobile && selectedContact) {
      setIsSidebarVisible(false);
    }
  }, [selectedContact, isMobile]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Botón de selección de contacto */}
      {!isSidebarVisible && isMobile && (
        <Button
          variant="outline"
          size="lg"
          className="fixed top-20 left-4 right-4 z-50 md:hidden flex items-center justify-center gap-2"
          onClick={() => setIsSidebarVisible(true)}
        >
          <MessageSquare className="h-5 w-5" />
          <span>Seleccionar Contacto</span>
        </Button>
      )}
      <div className="flex gap-4 flex-1 relative">
        {/* Sidebar */}
        <aside className={cn(
          "bg-white rounded-lg shadow-md transition-all duration-300 ease-in-out",
          "fixed md:relative top-0 left-0 h-full z-40",
          "w-80",
          "md:translate-x-0",
          isSidebarVisible ? "translate-x-0" : "-translate-x-full",
          isMobile && !isSidebarVisible && "hidden"
        )}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Mensajes</h2>
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarVisible(false)}
                className="md:hidden"
              >
                Cerrar
              </Button>
            )}
          </div>
          {/* Barra de búsqueda */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar contacto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <div className="space-y-2 p-2">
            {filteredContacts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No hay contactos disponibles.
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  className={`w-full flex items-center gap-3 p-3 rounded hover:bg-gray-100 transition-colors ${
                    selectedContact?.id === contact.id ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <img
                    src={contact.photo_url || 'https://randomuser.me/api/portraits/men/32.jpg'}
                    alt={`${contact.first_name} ${contact.last_name}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 text-left">
                    <div className="font-medium">
                      {contact.first_name} {contact.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{contact.email}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>
        {/* Chat Window */}
        <main className={cn(
          "flex-1 bg-white rounded-lg shadow-md overflow-hidden",
          isMobile && isSidebarVisible ? "hidden" : "block"
        )}>
          {selectedContact ? (
            <ChatWindow
              selectedAgent={selectedContact}
              canSendMessage={true}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg">Selecciona un contacto para ver la conversación</p>
              {isMobile && !isSidebarVisible && (
                <p className="text-sm mt-2">
                  Usa el botón <MessageSquare className="h-4 w-4 inline" /> para ver la lista de contactos
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default OwnerMessagesBoard; 