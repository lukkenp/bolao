import { useState, useEffect } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LotteryType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface FavoriteTicketButtonProps {
  ticketId: string;
  onFavorited?: () => void;
}

export const FavoriteTicketButton = ({ 
  ticketId, 
  onFavorited 
}: FavoriteTicketButtonProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Verifica se o bilhete já está nos favoritos ao carregar
  useEffect(() => {
    const checkIfFavorite = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('favorite_tickets')
          .select('id')
          .eq('ticket_id', ticketId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setIsFavorite(!!data);
      } catch (error) {
        console.error('Erro ao verificar favorito:', error);
      }
    };

    checkIfFavorite();
  }, [ticketId, user]);

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para favoritar bilhetes",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorite) {
        // Remover dos favoritos
        const { error } = await supabase
          .from('favorite_tickets')
          .delete()
          .eq('ticket_id', ticketId)
          .eq('user_id', user.id);

        if (error) throw error;
        setIsFavorite(false);
        toast({
          title: "Removido dos favoritos",
          description: "O bilhete foi removido dos seus favoritos",
        });
      } else {
        // Adicionar aos favoritos
        const { error } = await supabase
          .from('favorite_tickets')
          .insert({
            ticket_id: ticketId,
            user_id: user.id,
          });

        if (error) throw error;
        setIsFavorite(true);
        toast({
          title: "Adicionado aos favoritos",
          description: "O bilhete foi salvo nos seus favoritos",
        });
      }
      onFavorited?.();
    } catch (error: any) {
      console.error('Erro ao gerenciar favorito:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerenciar o favorito",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleFavorite}
      disabled={isLoading}
      className="hover:bg-transparent"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFavorite ? (
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      ) : (
        <Star className="h-4 w-4" />
      )}
      <span className="sr-only">
        {isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      </span>
    </Button>
  );
}; 