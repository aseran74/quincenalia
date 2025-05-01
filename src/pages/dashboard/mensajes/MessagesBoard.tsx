import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ChatSidebar from '@/components/messaging/ChatSidebar';
import ChatSidebarOwners from '@/components/messaging/ChatSidebarOwners';
import ChatWindow from '@/components/messaging/ChatWindow';
import { MessageSquare, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface Agent {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  photo_url?: string;
  email?: string;
}

export interface Owner {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  photo_url?: string;
  email?: string;
}

type ChatType = 'agentes' | 'propietarios';

const MessagesBoard = () => {
  const { user } = useAuth();
  const [chatType, setChatType] = useState<ChatType>('agentes');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [unreadCount, setUnreadCount] = useState<{ [key: string]: number }>({});
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchTerm, setSearchTerm] = useState('');

  // Determina el usuario seleccionado según el tipo de chat
  const selectedUser = chatType === 'agentes' ? selectedAgent : selectedOwner;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarVisible(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cerrar sidebar en móvil cuando se selecciona un usuario
  useEffect(() => {
    if (isMobile && selectedUser) {
      setIsSidebarVisible(false);
    }
  }, [selectedUser, isMobile]);

  // Verificar permisos de mensajería según el rol
  const canMessageAgents = user?.role === 'admin' || user?.role === 'owner';
  const canMessageOwners = user?.role === 'admin' || user?.role === 'agent';

  // Verificar si el usuario puede enviar mensajes al destinatario seleccionado
  const canSendMessage = (recipient: Agent | Owner | null) => {
    if (!user || !recipient) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'owner' && chatType === 'agentes') return true;
    if (user.role === 'agent' && chatType === 'propietarios') return true;
    return false;
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Botón de selección de contacto */}
      {!isSidebarVisible && isMobile && (
        <Button
          variant="outline"
          size="lg"
          className="fixed top-20 left-4 right-4 z-50 md:hidden flex items-center justify-center gap-2"
          onClick={toggleSidebar}
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
          <div className="flex flex-col p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Mensajes</h2>
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
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

            <div className="flex gap-2">
              <Button
                variant={chatType === 'propietarios' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setChatType('propietarios')}
                disabled={!canMessageOwners}
              >
                Propietarios
              </Button>
              <Button
                variant={chatType === 'agentes' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setChatType('agentes')}
                disabled={!canMessageAgents}
              >
                Agentes
              </Button>
            </div>
          </div>

          <div className="p-4">
            {chatType === 'agentes' && canMessageAgents && (
              <ChatSidebar
                onSelectAgent={setSelectedAgent}
                selectedAgent={selectedAgent}
                unreadCount={unreadCount}
                searchTerm={searchTerm}
              />
            )}
            {chatType === 'propietarios' && canMessageOwners && (
              <ChatSidebarOwners
                onSelectOwner={setSelectedOwner}
                selectedOwner={selectedOwner}
                unreadCount={unreadCount}
                searchTerm={searchTerm}
              />
            )}
          </div>
        </aside>

        {/* Chat Window */}
        <main className={cn(
          "flex-1 bg-white rounded-lg shadow-md overflow-hidden",
          isMobile && isSidebarVisible ? "hidden" : "block"
        )}>
          {selectedUser ? (
            <ChatWindow
              selectedAgent={selectedUser}
              canSendMessage={canSendMessage(selectedUser)}
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

export default MessagesBoard; 