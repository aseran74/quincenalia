import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface HeartButtonProps {
  propertyId: string;
  className?: string;
}

export const HeartButton: React.FC<HeartButtonProps> = ({ propertyId, className }) => {
  const { user, isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!isAuthenticated || !user) {
        setIsFavorite(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', user.id)
          .eq('property_id', propertyId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking favorite:', error);
        }

        setIsFavorite(!!data);
      } catch (error) {
        console.error('Error checking favorite:', error);
      }
    };

    checkFavorite();
  }, [propertyId, user, isAuthenticated]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Evitar navegación si está dentro de un Link
    e.stopPropagation();

    if (!isAuthenticated || !user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar favoritos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);

        if (error) throw error;
        setIsFavorite(false);
        toast({
          title: "Eliminado de favoritos",
          description: "La propiedad ha sido eliminada de tus favoritos.",
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, property_id: propertyId });

        if (error) throw error;
        setIsFavorite(true);
        toast({
          title: "Añadido a favoritos",
          description: "La propiedad ha sido guardada en tus favoritos.",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar favoritos. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={cn(
        "transition-all hover:scale-110 focus:outline-none rounded-full p-2 bg-white/80 hover:bg-white shadow-sm",
        className
      )}
      aria-label={isFavorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
    >
      <Heart
        className={cn(
          "w-5 h-5 transition-colors",
          isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
        )}
      />
    </button>
  );
};

