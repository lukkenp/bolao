import { useState, useEffect } from 'react';
import { LotteryType, LotteryResult } from '@/types';
import { fetchLotteryResult, findDrawNumberByDate } from '@/services/lotteryApi';

interface UseLotteryResultsProps {
  lotteryType: LotteryType;
  drawDate: string;
}

interface UseLotteryResultsState {
  loading: boolean;
  error: string | null;
  result: LotteryResult | null;
}

const resultsCache = new Map<string, LotteryResult>();

export function useLotteryResults({ lotteryType, drawDate }: UseLotteryResultsProps): UseLotteryResultsState {
  const [state, setState] = useState<UseLotteryResultsState>({
    loading: true,
    error: null,
    result: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadResult() {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Verifica o cache
        const cacheKey = `${lotteryType}-${drawDate}`;
        const cachedResult = resultsCache.get(cacheKey);

        if (cachedResult) {
          setState({
            loading: false,
            error: null,
            result: cachedResult,
          });
          return;
        }

        // Busca o número do concurso
        const drawNumber = await findDrawNumberByDate(lotteryType, drawDate);
        if (!drawNumber) {
          throw new Error('Não foi possível encontrar o concurso para esta data.');
        }

        // Busca o resultado
        const result = await fetchLotteryResult(lotteryType, drawNumber.toString());
        if (!result) {
          throw new Error('Não foi possível carregar o resultado do sorteio.');
        }

        // Atualiza o cache
        resultsCache.set(cacheKey, result);

        if (isMounted) {
          setState({
            loading: false,
            error: null,
            result,
          });
        }
      } catch (error: any) {
        console.error('Erro ao carregar resultado:', error);
        if (isMounted) {
          setState({
            loading: false,
            error: error.message,
            result: null,
          });
        }
      }
    }

    loadResult();

    return () => {
      isMounted = false;
    };
  }, [lotteryType, drawDate]);

  return state;
} 