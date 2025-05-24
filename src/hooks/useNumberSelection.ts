import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { LotteryType } from '@/types';

interface UseNumberSelectionProps {
  poolId: string;
  participantId: string;
  lotteryType: LotteryType;
  onSuccess?: () => void;
}

interface NumberSelectionConfig {
  minNumbers: number;
  maxNumbers: number;
  maxValue: number;
}

const LOTTERY_CONFIG: Record<LotteryType, NumberSelectionConfig> = {
  megasena: {
    minNumbers: 6,
    maxNumbers: 20,
    maxValue: 60,
  },
  lotofacil: {
    minNumbers: 15,
    maxNumbers: 20,
    maxValue: 25,
  },
  quina: {
    minNumbers: 5,
    maxNumbers: 15,
    maxValue: 80,
  },
  lotomania: {
    minNumbers: 50,
    maxNumbers: 50,
    maxValue: 100,
  },
  timemania: {
    minNumbers: 10,
    maxNumbers: 10,
    maxValue: 80,
  },
  duplasena: {
    minNumbers: 6,
    maxNumbers: 15,
    maxValue: 50,
  },
  'dia-de-sorte': {
    minNumbers: 7,
    maxNumbers: 15,
    maxValue: 31,
  },
};

export function useNumberSelection({
  poolId,
  participantId,
  lotteryType,
  onSuccess,
}: UseNumberSelectionProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

  const config = LOTTERY_CONFIG[lotteryType];

  const toggleNumber = (number: number) => {
    setSelectedNumbers(prev => {
      if (prev.includes(number)) {
        return prev.filter(n => n !== number);
      }
      if (prev.length >= config.maxNumbers) {
        toast({
          title: 'Limite de números atingido',
          description: `Você pode selecionar no máximo ${config.maxNumbers} números.`,
          variant: 'destructive',
        });
        return prev;
      }
      return [...prev, number].sort((a, b) => a - b);
    });
  };

  const isValidSelection = () => {
    return selectedNumbers.length >= config.minNumbers;
  };

  const saveNumbers = async () => {
    if (!isValidSelection()) {
      toast({
        title: 'Seleção inválida',
        description: `Você precisa selecionar pelo menos ${config.minNumbers} números.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('pool_participants')
        .update({
          numbers: selectedNumbers,
          status: 'confirmed',
        })
        .eq('id', participantId)
        .eq('pool_id', poolId);

      if (error) throw error;

      toast({
        title: 'Números salvos',
        description: 'Seus números foram salvos com sucesso.',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Erro ao salvar números:', error);
      toast({
        title: 'Erro ao salvar números',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedNumbers([]);
  };

  return {
    loading,
    selectedNumbers,
    toggleNumber,
    saveNumbers,
    clearSelection,
    config,
    isValidSelection,
  };
} 