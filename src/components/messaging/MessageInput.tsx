import React, { useState } from 'react';
import { Agent } from '@/pages/dashboard/mensajes/MessagesBoard';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface MessageInputProps {
  selectedAgent: Agent;
}

const MessageInput: React.FC<MessageInputProps> = ({ selectedAgent }) => {
  const { user } = useAuth();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || !user) return;
    setLoading(true);
    const payload = {
      sender_id: user.id,
      receiver_id: selectedAgent.user_id,
      content: value.trim(),
    };
    console.log('Enviando mensaje:', payload);
    const { error, data } = await supabase.from('messages').insert(payload);
    if (error) {
      console.error('Error al enviar mensaje:', error);
    } else {
      console.log('Mensaje enviado:', data);
    }
    setValue('');
    setLoading(false);
  };

  return (
    <form className="flex gap-2" onSubmit={handleSend}>
      <input
        type="text"
        className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
        placeholder="Escribe un mensaje..."
        value={value}
        onChange={e => setValue(e.target.value)}
        disabled={loading}
      />
      <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center" disabled={loading || !value.trim()}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v6l10 1.5-10 1.5v6z" />
        </svg>
      </button>
    </form>
  );
};

export default MessageInput; 
