import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Agent, Owner } from '@/pages/dashboard/mensajes/MessagesBoard';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  selectedAgent: Agent | Owner;
  receiverRole: 'agent' | 'owner';
}

const MessageInput: React.FC<MessageInputProps> = ({ selectedAgent, receiverRole }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user || !selectedAgent?.user_id) {
      toast({
        title: "Error",
        description: "Por favor, escribe un mensaje válido.",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: selectedAgent.user_id,
        content: message.trim(),
        sender_role: user.role || 'user',
        receiver_role: receiverRole
      });

      if (error) throw error;

      setMessage('');
      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje ha sido enviado correctamente.",
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error al enviar mensaje",
        description: error.message || "No se pudo enviar el mensaje. Por favor, intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Escribe un mensaje..."
        className={cn(
          "flex-1 px-4 py-2 rounded-full",
          "border border-gray-200",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "bg-gray-50",
          sending && "opacity-50 cursor-not-allowed"
        )}
        disabled={sending}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!message.trim() || sending}
        className={cn(
          "rounded-full w-10 h-10",
          "bg-blue-500 hover:bg-blue-600",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
};

export default MessageInput; 
