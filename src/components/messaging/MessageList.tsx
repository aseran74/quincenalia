import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Agent, Owner } from '@/pages/dashboard/mensajes/MessagesBoard';
import { useAuth } from '@/context/AuthContext';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  deleted: boolean;
  group_type: string | null;
  group_id: string | null;
  sender_role: string;
  receiver_role: string;
  read_at: string | null;
}

interface MessageListProps {
  selectedAgent: Agent | Owner;
}

const MessageList: React.FC<MessageListProps> = ({ selectedAgent }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedAgent?.user_id || !user?.id) return;
      setLoading(true);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedAgent.user_id}),and(sender_id.eq.${selectedAgent.user_id},receiver_id.eq.${user.id})`)
        .eq('deleted', false)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };
    fetchMessages();
  }, [selectedAgent, user]);

  useEffect(() => {
    if (!user?.id || !selectedAgent?.user_id) return;
    
    const channel = supabase.channel('private-messages')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages',
        filter: `deleted=eq.false`
      }, (payload) => {
        const msg = payload.new as Message;
        if (
          (msg.sender_id === user.id && msg.receiver_id === selectedAgent.user_id) ||
          (msg.sender_id === selectedAgent.user_id && msg.receiver_id === user.id)
        ) {
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedAgent, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <p className="text-center">No hay mensajes todavía.</p>
        <p className="text-sm mt-2">¡Sé el primero en enviar un mensaje!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => {
        const isMe = msg.sender_id === user?.id;
        return (
          <div
            key={msg.id}
            className={cn(
              "flex items-end gap-2",
              isMe ? "justify-end" : "justify-start"
            )}
          >
            {!isMe && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                {selectedAgent.photo_url ? (
                  <img
                    src={selectedAgent.photo_url}
                    alt={`${selectedAgent.first_name} ${selectedAgent.last_name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
            )}

            <div className={cn(
              "max-w-[75%] break-words",
              isMe ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "px-4 py-2 rounded-2xl shadow-sm",
                isMe ? "bg-blue-500 text-white rounded-br-none" : "bg-white border rounded-bl-none"
              )}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              <p className={cn(
                "text-xs mt-1",
                isMe ? "text-right text-gray-400" : "text-gray-400"
              )}>
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {isMe && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Mi avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList; 