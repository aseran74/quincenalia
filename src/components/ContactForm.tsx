import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Loader2, Send } from 'lucide-react';

interface ContactFormProps {
  agentId?: string;
  propertyId?: string;
  className?: string;
  variant?: 'default' | 'landing';
}

const ContactForm: React.FC<ContactFormProps> = ({
  agentId,
  propertyId,
  className,
  variant = 'default',
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const isLanding = variant === 'landing';

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
      const { data, error } = await supabase
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
        title: "¡Solicitud recibida!",
        description: "Un agente te responderá en breve. Gracias por tu interés.",
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error: unknown) {
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

  const fieldClass = isLanding
    ? 'h-11 rounded-xl border-slate-200 bg-slate-50/80 px-4 text-sm placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-[#E8DAD9]'
    : 'w-full';

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        isLanding ? 'space-y-4 w-full flex-1 flex flex-col' : 'space-y-4 w-full max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md',
        className
      )}
    >
      <div className="space-y-2">
        {isLanding && (
          <Label htmlFor="contact-name" className="text-sm font-medium text-slate-700">
            Nombre completo <span className="text-[#6F4C48]">*</span>
          </Label>
        )}
        <Input
          id="contact-name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={isLanding ? 'Tu nombre' : 'Nombre completo *'}
          required
          className={fieldClass}
          disabled={loading}
          autoComplete="name"
        />
      </div>

      <div className={cn(isLanding && 'grid grid-cols-1 sm:grid-cols-2 gap-5')}>
        <div className="space-y-2">
          {isLanding && (
            <Label htmlFor="contact-email" className="text-sm font-medium text-slate-700">
              Correo electrónico <span className="text-[#6F4C48]">*</span>
            </Label>
          )}
          <Input
            id="contact-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={isLanding ? 'tu@email.com' : 'Correo electrónico *'}
            required
            className={fieldClass}
            disabled={loading}
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          {isLanding && (
            <Label htmlFor="contact-phone" className="text-sm font-medium text-slate-700">
              Teléfono
            </Label>
          )}
          <Input
            id="contact-phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder={isLanding ? '+34 600 000 000' : 'Teléfono'}
            className={fieldClass}
            disabled={loading}
            autoComplete="tel"
          />
        </div>
      </div>

      <div className="space-y-2 flex-1 flex flex-col min-h-0">
        {isLanding && (
          <Label htmlFor="contact-message" className="text-sm font-medium text-slate-700">
            Mensaje
          </Label>
        )}
        <Textarea
          id="contact-message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder={isLanding ? 'Cuéntanos qué te interesa: una zona, una propiedad, ser agente…' : 'Mensaje'}
          className={cn(
            fieldClass,
            isLanding ? 'min-h-[100px] flex-1 resize-none py-3' : 'min-h-[100px]'
          )}
          disabled={loading}
        />
      </div>

      <div className="mt-auto pt-2 space-y-3">
      <Button
        type="submit"
        className={cn(
          'w-full',
          isLanding && 'h-11 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-shadow bg-[#6F4C48] hover:bg-[#5A3D3A] text-white'
        )}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando…
          </>
        ) : (
          <>
            {isLanding && <Send className="mr-2 h-4 w-4" />}
            Solicitar contacto
          </>
        )}
      </Button>

      {isLanding && (
        <p className="text-center text-xs text-slate-500 leading-relaxed">
          Al enviar aceptas que te contactemos para resolver tu consulta. Sin spam.
        </p>
      )}
      </div>
    </form>
  );
};

export default ContactForm; 