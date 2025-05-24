import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SupabasePool } from '@/types/supabase';
import { useToast } from '@/components/ui/use-toast';

interface UsePoolProps {
  poolId: string;
}

interface UsePoolState {
  loading: boolean;
  error: string | null;
  pool: SupabasePool | null;
  isAdmin: boolean;
  currentUserId?: string;
}

export function usePool({ poolId }: UsePoolProps) {
  const { toast } = useToast();
  const [state, setState] = useState<UsePoolState>({
    loading: true,
    error: null,
    pool: null,
    isAdmin: false,
    currentUserId: undefined,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadPool() {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Busca os dados do bolão
        const { data: poolData, error: poolError } = await supabase
          .from('pools')
          .select('*')
          .eq('id', poolId)
          .single();

        if (poolError) throw poolError;
        if (!poolData) throw new Error('Bolão não encontrado');

        // Verifica se o usuário atual é o administrador
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (isMounted) {
          setState({
            loading: false,
            error: null,
            pool: poolData,
            isAdmin: user?.id === poolData.created_by,
            currentUserId: user?.id,
          });
        }
      } catch (error: any) {
        console.error('Erro ao carregar bolão:', error);
        if (isMounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error.message,
          }));
          toast({
            title: 'Erro ao carregar bolão',
            description: error.message,
            variant: 'destructive',
          });
        }
      }
    }

    loadPool();

    return () => {
      isMounted = false;
    };
  }, [poolId, toast]);

  const handleShare = async () => {
    if (!state.pool) return;

    try {
      await navigator.share({
        title: state.pool.title,
        text: state.pool.description,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', participantId);

      if (error) throw error;

      toast({
        title: 'Participante removido',
        description: 'O participante foi removido com sucesso.',
      });
    } catch (error: any) {
      console.error('Erro ao remover participante:', error);
      toast({
        title: 'Erro ao remover participante',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleConfirmParticipant = async (participantId: string) => {
    try {
      const { error } = await supabase
        .from('participants')
        .update({ status: 'confirmed' })
        .eq('id', participantId);

      if (error) throw error;

      toast({
        title: 'Participante confirmado',
        description: 'O participante foi confirmado com sucesso.',
      });
    } catch (error: any) {
      console.error('Erro ao confirmar participante:', error);
      toast({
        title: 'Erro ao confirmar participante',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    ...state,
    handleShare,
    handleRemoveParticipant,
    handleConfirmParticipant,
  };
} 