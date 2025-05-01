import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface ContactFormProps {
  agentId?: string;
  propertyId?: string;
  className?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ agentId, propertyId, className }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Por favor, completa los campos requeridos.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('contact_requests')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          agent_id: agentId || null,
          property_id: propertyId || null,
          status: 'pendiente'
        });

      if (error) throw error;

      toast({
        title: "¡Solicitud enviada!",
        description: "Nos pondremos en contacto contigo pronto.",
      });

      // Limpiar el formulario
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar tu solicitud. Por favor, intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <div>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nombre completo *"
          required
          className="w-full"
          disabled={loading}
        />
      </div>
      <div>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Correo electrónico *"
          required
          className="w-full"
          disabled={loading}
        />
      </div>
      <div>
        <Input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Teléfono"
          className="w-full"
          disabled={loading}
        />
      </div>
      <div>
        <Textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Mensaje (opcional)"
          className="w-full min-h-[100px]"
          disabled={loading}
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Enviando..." : "Solicitar contacto"}
      </Button>
    </form>
  );
};

export default ContactForm; 