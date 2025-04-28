import React, { useEffect, useRef } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Agent } from '@/pages/dashboard/mensajes/MessagesBoard';
import { Owner } from './ChatSidebarOwners';

interface ChatWindowProps {
  selectedAgent: Agent | Owner | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedAgent }) => {
  // 1. Crea una referencia para el contenedor scrollable
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // 2. Usa useEffect para hacer scroll cuando cambie el agente seleccionado
  useEffect(() => {
    if (messagesContainerRef.current) {
      // Hacemos scroll hasta abajo del contenedor
      // Esto se ejecutará cada vez que 'selectedAgent' cambie.
      // Puede necesitar un pequeño retraso si MessageList tarda en renderizar mensajes iniciales.
      const timer = setTimeout(() => {
         if (messagesContainerRef.current) { // Verificar de nuevo por si acaso
           messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
         }
      }, 50); // Prueba con 0 o 50ms

      return () => clearTimeout(timer); // Limpia el temporizador si el componente se desmonta rápido
    }

    // IMPORTANTE: Esto NO hará scroll automáticamente cuando lleguen NUEVOS mensajes
    // dentro de la MISMA conversación. Para eso, NECESITAS la lógica dentro de MessageList.
  }, [selectedAgent]); // La dependencia es el agente seleccionado

  return (
    <div className="flex flex-col h-full w-full">
      {/* 3. Asigna la referencia al div que tiene overflow-y-auto */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-white">
        {selectedAgent ? (
          <MessageList selectedAgent={selectedAgent} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Selecciona un usuario para comenzar a chatear.
          </div>
        )}
        {/* El div dummy para scrollIntoView iría DENTRO de MessageList en la solución ideal */}
      </div>
      {/* El input se queda abajo correctamente con sticky */}
      <div className="sticky bottom-0 bg-white p-2 border-t z-10">
        {selectedAgent && <MessageInput selectedAgent={selectedAgent} />}
      </div>
    </div>
  );
};

export default ChatWindow; 