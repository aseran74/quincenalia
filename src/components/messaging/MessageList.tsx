import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Agent } from '@/pages/dashboard/mensajes/MessagesBoard';
import { Owner } from './ChatSidebarOwners';
import { useAuth } from '@/context/AuthContext';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface MessageListProps {
  selectedAgent: Agent | Owner;
}

const MessageList: React.FC<MessageListProps> = ({ selectedAgent }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Función para hacer scroll ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- Carga inicial de mensajes ---
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedAgent?.user_id || !user?.id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${selectedAgent.user_id}),and(sender_id.eq.${selectedAgent.user_id},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });
      if (error) {
        setMessages([]);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };
    fetchMessages();
  }, [selectedAgent, user]);

  // --- Suscripción a nuevos mensajes (Realtime) ---
  useEffect(() => {
    if (!user?.id || !selectedAgent?.user_id) return;
    const channel = supabase.channel('private-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
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

  // --- useEffect para hacer scroll cuando cambian los mensajes ---
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- useEffect para hacer scroll cuando cambia el chat ---
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedAgent]);

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Cargando mensajes...</div>;
  }

  return (
    <div>
      {messages.length === 0 ? (
        <p className="text-center text-gray-400 py-4">No hay mensajes todavía.</p>
      ) : (
        messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMe ? 'justify-end' : ''}`}
            >
              {!isMe && (
                <img src={
                  (selectedAgent as Agent).photo_url || (selectedAgent as Owner).photo_url || 'https://randomuser.me/api/portraits/men/32.jpg'
                } alt="Avatar" className="w-8 h-8 rounded-full" />
              )}
              <div>
                <div className={`rounded px-3 py-2 shadow text-sm ${isMe ? 'bg-blue-500 text-white' : 'bg-white'}`}>{msg.content}</div>
                <div className={`text-xs text-gray-400 mt-1 ${isMe ? 'text-right' : ''}`}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              {isMe && (
                <img src={user?.profileImage || 'https://randomuser.me/api/portraits/men/31.jpg'} alt="Avatar" className="w-8 h-8 rounded-full" />
              )}
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} style={{ height: '1px' }} />
    </div>
  );
};

export default MessageList; 