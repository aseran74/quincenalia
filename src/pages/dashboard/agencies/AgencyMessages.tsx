import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HiOutlineUserCircle, HiOutlinePaperAirplane } from 'react-icons/hi2';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface Agent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  photo_url?: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  sender_role?: string;
  receiver_role?: string;
  read_at?: string | null;
  deleted?: boolean;
}

const AgencyMessages: React.FC = () => {
  const { id: agencyId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (agencyId) {
      fetchAgents();
    }
  }, [agencyId]);

  useEffect(() => {
    if (selectedAgent && user) {
      fetchMessages();
      // Suscribirse a nuevos mensajes en tiempo real
      const channel = supabase
        .channel(`messages:${user.id}:${selectedAgent.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `or(and(sender_id=eq.${user.id},receiver_id=eq.${selectedAgent.id}),and(sender_id=eq.${selectedAgent.id},receiver_id=eq.${user.id}))`
          },
          (payload) => {
            const newMessage = payload.new as Message;
            // Verificar que el mensaje no esté ya en la lista
            setMessages(prev => {
              if (prev.some(m => m.id === newMessage.id)) return prev;
              return [...prev, newMessage].sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedAgent, user]);

  const fetchAgents = async () => {
    if (!agencyId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, photo_url')
        .eq('role', 'agent')
        .eq('agency_id', agencyId)
        .order('first_name');

      if (error) throw error;
      setAgents(data || []);
    } catch (error: any) {
      console.error('Error fetching agents:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los agentes.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedAgent || !user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedAgent.id}),and(sender_id.eq.${selectedAgent.id},receiver_id.eq.${user.id})`)
        .eq('deleted', false)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
      setMessages(data || []);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los mensajes.',
        variant: 'destructive'
      });
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedAgent || !user) return;

    setSending(true);
    try {
      const { error, data } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedAgent.id,
          content: newMessage.trim(),
          sender_role: 'agency',
          receiver_role: 'agent'
        })
        .select();

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      // Agregar el mensaje inmediatamente a la lista
      if (data && data[0]) {
        setMessages(prev => [...prev, data[0] as Message]);
      }

      setNewMessage('');
      
      // Recargar mensajes para asegurar sincronización
      await fetchMessages();
      
      toast({
        title: 'Mensaje enviado',
        description: 'Tu mensaje ha sido enviado correctamente.'
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo enviar el mensaje. Verifica la consola para más detalles.',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Lista de agentes */}
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        <Card className="border-0 shadow-none rounded-none h-full">
          <CardHeader>
            <CardTitle>Mis Agentes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {agents.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">No hay agentes asignados</p>
              ) : (
                agents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedAgent?.id === agent.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {agent.photo_url ? (
                        <img
                          src={agent.photo_url}
                          alt={`${agent.first_name} ${agent.last_name}`}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <HiOutlineUserCircle className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {agent.first_name} {agent.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{agent.email}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 flex flex-col">
        {selectedAgent ? (
          <>
            {/* Header del chat */}
            <Card className="border-b rounded-none">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  {selectedAgent.photo_url ? (
                    <img
                      src={selectedAgent.photo_url}
                      alt={`${selectedAgent.first_name} ${selectedAgent.last_name}`}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <HiOutlineUserCircle className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {selectedAgent.first_name} {selectedAgent.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedAgent.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No hay mensajes aún. Envía el primer mensaje.</p>
                </div>
              ) : (
                messages.map(message => {
                  const isOwn = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(message.created_at).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input de mensaje */}
            <Card className="border-t rounded-none">
              <CardContent className="p-4">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={sending || !newMessage.trim()}>
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <HiOutlinePaperAirplane className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Selecciona un agente para comenzar a chatear</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgencyMessages;
