import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Participant } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface UseParticipantsListProps {
  poolId: string;
  pageSize?: number;
}

interface UseParticipantsListState {
  loading: boolean;
  error: string | null;
  participants: Participant[];
  totalParticipants: number;
  currentPage: number;
  hasMore: boolean;
}

export function useParticipantsList({ poolId, pageSize = 10 }: UseParticipantsListProps) {
  const { toast } = useToast();
  const [state, setState] = useState<UseParticipantsListState>({
    loading: true,
    error: null,
    participants: [],
    totalParticipants: 0,
    currentPage: 1,
    hasMore: true,
  });

  const loadParticipants = useCallback(async (page: number) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Busca o total de participantes
      const { count: total, error: countError } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('pool_id', poolId);

      if (countError) throw countError;

      // Busca os participantes da página atual
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .eq('pool_id', poolId)
        .range((page - 1) * pageSize, page * pageSize - 1)
        .order('created_at', { ascending: false });

      if (participantsError) throw participantsError;

      const formattedParticipants: Participant[] = participantsData?.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        status: p.status,
        numbers: p.numbers
      })) || [];

      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
        participants: page === 1 ? formattedParticipants : [...prev.participants, ...formattedParticipants],
        totalParticipants: total || 0,
        currentPage: page,
        hasMore: (page * pageSize) < (total || 0),
      }));
    } catch (error: any) {
      console.error('Erro ao carregar participantes:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      toast({
        title: 'Erro ao carregar participantes',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [poolId, pageSize, toast]);

  const loadNextPage = useCallback(() => {
    if (!state.loading && state.hasMore) {
      loadParticipants(state.currentPage + 1);
    }
  }, [state.loading, state.hasMore, state.currentPage, loadParticipants]);

  const refresh = useCallback(() => {
    loadParticipants(1);
  }, [loadParticipants]);

  useEffect(() => {
    loadParticipants(1);
  }, [loadParticipants]);

  return {
    ...state,
    loadNextPage,
    refresh,
  };
} 