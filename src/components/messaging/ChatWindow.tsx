import React, { useEffect, useRef } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Agent, Owner } from '@/pages/dashboard/mensajes/MessagesBoard';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  selectedAgent: Agent | Owner;
  canSendMessage: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedAgent, canSendMessage }) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      const timer = setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [selectedAgent]);

  return (
    <div className="flex flex-col h-full">
      {/* Header del chat */}
      <header className="flex items-center p-4 border-b bg-white">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
          {selectedAgent.photo_url ? (
            <img 
              src={selectedAgent.photo_url} 
              alt={`${selectedAgent.first_name} ${selectedAgent.last_name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="h-6 w-6 text-gray-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold truncate">
            {selectedAgent.first_name} {selectedAgent.last_name}
          </h2>
          {selectedAgent.email && (
            <p className="text-sm text-gray-500 truncate">{selectedAgent.email}</p>
          )}
        </div>
      </header>

      {/* Contenedor de mensajes */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        <MessageList selectedAgent={selectedAgent} />
      </div>

      {/* Input de mensajes */}
      <footer className="p-4 border-t bg-white">
        {canSendMessage ? (
          <MessageInput selectedAgent={selectedAgent} />
        ) : (
          <div className="text-center text-gray-500 py-2">
            No tienes permisos para enviar mensajes a este usuario
          </div>
        )}
      </footer>
    </div>
  );
};

export default ChatWindow; 