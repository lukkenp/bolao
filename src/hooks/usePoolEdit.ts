import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { LotteryType } from '@/types';

interface UsePoolEditProps {
  poolId: string;
  onSuccess?: () => void;
}

interface UpdatePoolData {
  title: string;
  description: string;
  lottery_type: LotteryType;
  draw_date: string;
  draw_time: string;
  entry_fee: number;
  max_participants: number;
  is_open: boolean;
}

export function usePoolEdit({ poolId, onSuccess }: UsePoolEditProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const updatePool = async (data: UpdatePoolData) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('pools')
        .update({
          title: data.title,
          description: data.description,
          lottery_type: data.lottery_type,
          draw_date: data.draw_date,
          draw_time: data.draw_time,
          entry_fee: data.entry_fee,
          max_participants: data.max_participants,
          is_open: data.is_open,
        })
        .eq('id', poolId);

      if (error) throw error;

      toast({
        title: 'Bolão atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Erro ao atualizar bolão:', error);
      toast({
        title: 'Erro ao atualizar bolão',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    updatePool,
  };
} 