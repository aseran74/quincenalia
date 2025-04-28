import React, { useState } from 'react';
import ChatSidebar from '@/components/messaging/ChatSidebar';
import ChatSidebarOwners, { Owner } from '@/components/messaging/ChatSidebarOwners';
import ChatWindow from '@/components/messaging/ChatWindow';

export interface Agent {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  photo_url?: string;
  email?: string;
}

type ChatType = 'agentes' | 'propietarios';

const MessagesBoard: React.FC = () => {
  const [chatType, setChatType] = useState<ChatType>('agentes');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);

  // Determina el usuario seleccionado según el tipo de chat
  const selectedUser = chatType === 'agentes' ? selectedAgent : selectedOwner;

  // Función para deseleccionar usuario
  const handleBack = () => {
    if (chatType === 'agentes') setSelectedAgent(null);
    if (chatType === 'propietarios') setSelectedOwner(null);
  };

  return (
    <div className="flex flex-col h-[80vh] bg-white rounded shadow overflow-hidden">
      {/* Submenú sticky SIEMPRE visible */}
      <div className="sticky top-0 z-20 bg-gray-50 flex gap-2 p-2 border-b">
        <button
          className={`px-4 py-2 rounded ${chatType === 'agentes' ? 'bg-blue-500 text-white font-bold' : 'bg-gray-200'}`}
          onClick={() => { setChatType('agentes'); setSelectedAgent(null); }}
        >
          Agentes
        </button>
        <button
          className={`px-4 py-2 rounded ${chatType === 'propietarios' ? 'bg-blue-500 text-white font-bold' : 'bg-gray-200'}`}
          onClick={() => { setChatType('propietarios'); setSelectedOwner(null); }}
        >
          Propietarios
        </button>
      </div>
      <div className="flex flex-1 min-h-0">
        {/* Sidebar con scroll */}
        {chatType === 'agentes' && (
          <ChatSidebar
            onSelectAgent={setSelectedAgent}
            selectedAgent={selectedAgent}
          />
        )}
        {chatType === 'propietarios' && (
          <ChatSidebarOwners
            onSelectOwner={setSelectedOwner}
            selectedOwner={selectedOwner}
          />
        )}
        {/* Área de mensajes con scroll */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Botón atrás solo si hay usuario seleccionado */}
          {(selectedUser) && (
            <div className="sticky top-0 z-10 bg-white border-b p-2 flex items-center">
              <button
                className="text-blue-500 hover:underline text-sm mr-2"
                onClick={handleBack}
              >
                ← Volver
              </button>
              <span className="font-semibold">
                {selectedUser.first_name} {selectedUser.last_name}
              </span>
            </div>
          )}
          <div className="flex-1 min-h-0">
            <ChatWindow selectedAgent={selectedUser} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesBoard; 