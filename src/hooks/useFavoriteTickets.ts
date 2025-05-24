import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useFavoriteTickets() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const toggleFavorite = useCallback(async (ticketId: string) => {
    try {
      setLoading(true);
      
      // Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro ao favoritar",
          description: "Você precisa estar logado para favoritar bilhetes",
          variant: "destructive"
        });
        return;
      }

      // Verificar se o bilhete já está favoritado
      const { data: existingFavorite } = await supabase
        .from('favorite_tickets')
        .select('id')
        .eq('ticket_id', ticketId)
        .eq('user_id', user.id)
        .single();

      if (existingFavorite) {
        // Remover dos favoritos
        const { error } = await supabase
          .from('favorite_tickets')
          .delete()
          .eq('ticket_id', ticketId)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Removido dos favoritos",
          description: "Bilhete removido dos seus favoritos com sucesso"
        });
      } else {
        // Adicionar aos favoritos
        const { error } = await supabase
          .from('favorite_tickets')
          .insert([
            {
              ticket_id: ticketId,
              user_id: user.id
            }
          ]);

        if (error) throw error;

        toast({
          title: "Adicionado aos favoritos",
          description: "Bilhete adicionado aos seus favoritos com sucesso"
        });
      }
    } catch (error) {
      console.error('Erro ao gerenciar favorito:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao gerenciar o favorito",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getFavoriteStatus = useCallback(async (ticketId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('favorite_tickets')
        .select('id')
        .eq('ticket_id', ticketId)
        .eq('user_id', user.id)
        .single();

      return !!data;
    } catch (error) {
      console.error('Erro ao verificar status do favorito:', error);
      return false;
    }
  }, []);

  return {
    toggleFavorite,
    getFavoriteStatus,
    loading
  };
} 