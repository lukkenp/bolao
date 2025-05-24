import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Loader2, Trophy, Target } from 'lucide-react';
import { useState, useEffect } from 'react';
import { TicketResult } from '../TicketResult';
import { supabase } from '@/integrations/supabase/client';
import { findDrawNumberByDate } from '@/services/lotteryApi';
import { checkPoolResults } from '@/services/lotteryResults';
import { useToast } from '@/components/ui/use-toast';
import { LotteryType, TicketResult as TicketResultType } from '@/types';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getLotteryColor } from '@/lib/lottery';
import { cn } from '@/lib/utils';

interface PoolResultsProps {
  poolId: string;
  poolName: string;
  drawDate: string;
  lotteryType: LotteryType;
}

export function PoolResults({ poolId, poolName, drawDate, lotteryType }: PoolResultsProps) {
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TicketResultType[]>([]);
  const { toast } = useToast();
  const baseColorClass = getLotteryColor(lotteryType);
  const textColorClass = baseColorClass.replace('bg-', 'text-').replace('-600', '-700');
  const borderColorClass = baseColorClass.replace('bg-', 'border-').replace('-600', '-500');

  useEffect(() => {
    if (drawDate) {
      verifyResults();
    }
  }, [drawDate]);

  const verifyResults = async () => {
    setLoading(true);
    try {
      const formattedDate = drawDate.split('T')[0];
      const drawNumber = await findDrawNumberByDate(lotteryType, formattedDate);
      
      if (!drawNumber) {
        toast({
          title: "Sorteio não encontrado",
          description: "Não foi possível encontrar o sorteio para a data informada.",
          variant: "destructive",
        });
        return;
      }

      const results = await checkPoolResults(poolId, drawNumber);
      setResults(results);

      if (results.length > 0) {
        const totalPrize = results.reduce((sum, result) => sum + result.prize, 0);
        const maxHits = Math.max(...results.map(result => result.hits));
        
        toast({
          title: "Resultados verificados",
          description: `${results.length} bilhetes verificados. Maior acerto: ${maxHits} números.`,
        });
      } else {
        toast({
          title: "Nenhum resultado encontrado",
          description: "Não foram encontrados resultados para este bolão.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Erro ao verificar resultados:', error);
      toast({
        title: "Erro ao verificar resultados",
        description: error.message || 'Ocorreu um erro ao verificar os resultados.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calcula estatísticas dos resultados
  const totalPrize = results.reduce((sum, result) => sum + result.prize, 0);
  const maxHits = Math.max(...(results.length ? results.map(result => result.hits) : [0]));
  const ticketsWithPrize = results.filter(result => result.prize > 0).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center justify-between">
            <span>Resultados - {poolName}</span>
            {maxHits >= 4 && <Trophy className="h-5 w-5 text-yellow-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className={cn("h-6 w-6 animate-spin")} />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-6">
              {/* Resumo dos Resultados */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="border">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Target className={cn("h-8 w-8 mx-auto mb-2")} />
                      <p className="text-2xl font-bold">{maxHits}</p>
                      <p className="text-sm text-muted-foreground">Maior Acerto</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                      <p className="text-2xl font-bold">{ticketsWithPrize}</p>
                      <p className="text-sm text-muted-foreground">Bilhetes Premiados</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-500">
                        {formatCurrency(totalPrize)}
                      </p>
                      <p className="text-sm text-muted-foreground">Prêmio Total</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de Resultados */}
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {results.map((result) => (
                    <TicketResult
                      key={result.id}
                      ticketNumber={result.ticketNumber}
                      numbers={result.numbers}
                      matchedNumbers={result.matchedNumbers || []}
                      hits={result.hits}
                      prize={result.prize}
                      lotteryType={lotteryType}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p>Nenhum resultado encontrado.</p>
              <p className="text-sm">Aguarde o sorteio ou verifique a data do bolão.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 