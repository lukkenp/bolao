import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { LotteryType, LotteryResult } from '@/types';
import { getLotteryName } from '@/lib/lottery';
import { fetchLatestLotteryResult } from '@/services/lotteryApi';
import LotteryResultCard from './LotteryResult';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LOTTERY_TYPES: LotteryType[] = ['megasena', 'lotofacil', 'quina'];

export function LotteryResults() {
  const [results, setResults] = useState<Record<LotteryType, LotteryResult | null>>({
    megasena: null,
    lotofacil: null,
    quina: null,
    lotomania: null,
    timemania: null,
    duplasena: null
  });
  const [loading, setLoading] = useState<Record<LotteryType, boolean>>({
    megasena: true,
    lotofacil: true,
    quina: true,
    lotomania: false,
    timemania: false,
    duplasena: false
  });
  const [errors, setErrors] = useState<Record<LotteryType, string | null>>({
    megasena: null,
    lotofacil: null,
    quina: null,
    lotomania: null,
    timemania: null,
    duplasena: null
  });

  useEffect(() => {
    async function fetchResults() {
      for (const type of LOTTERY_TYPES) {
        try {
          setErrors(prev => ({ ...prev, [type]: null }));
          const result = await fetchLatestLotteryResult(type);
          
          if (!result) {
            throw new Error('Não foi possível carregar o resultado');
          }
          
          setResults(prev => ({ ...prev, [type]: result }));
        } catch (error: any) {
          console.error(`Erro ao buscar resultado da ${type}:`, error);
          setErrors(prev => ({ 
            ...prev, 
            [type]: error.message || 'Erro ao carregar resultado'
          }));
        } finally {
          setLoading(prev => ({ ...prev, [type]: false }));
        }
      }
    }

    fetchResults();
  }, []);

  return (
    <>
      {LOTTERY_TYPES.map((type) => {
        const result = results[type];
        const error = errors[type];

        return (
          <Card key={type} className="overflow-hidden">
            <CardContent className="p-6">
              {loading[type] ? (
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Erro ao carregar {getLotteryName(type)}: {error}
                  </AlertDescription>
                </Alert>
              ) : result ? (
                <LotteryResultCard result={result} />
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  <p>Nenhum resultado encontrado para {getLotteryName(type)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </>
  );
} 