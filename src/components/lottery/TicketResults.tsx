import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { LotteryType, TicketResult } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { findDrawNumberByDate } from '@/services/lotteryApi';
import { checkTicketResult } from '@/services/lotteryResults';
import { getLotteryColor } from '@/lib/lottery';
import { cn } from '@/lib/utils';

interface TicketResultsProps {
  poolId: string;
  ticketId: string;
  results?: TicketResult[];
  loading?: boolean;
  drawDate: string;
  lotteryType: LotteryType;
  onResult?: (result: {
    hits: number;
    prize: number;
    winningNumbers: number[];
  }) => void;
}

export function TicketResults({
  poolId,
  ticketId,
  results: initialResults,
  loading: initialLoading,
  drawDate,
  lotteryType,
  onResult,
}: TicketResultsProps) {
  const [loading, setLoading] = useState(initialLoading || false);
  const [results, setResults] = useState<TicketResult[]>(initialResults || []);
  const { toast } = useToast();
  const baseColorClass = getLotteryColor(lotteryType);
  const textColorClass = baseColorClass.replace('bg-', 'text-').replace('-600', '-700');
  const borderColorClass = baseColorClass.replace('bg-', 'border-').replace('-600', '-500');

  useEffect(() => {
    if (ticketId && drawDate && lotteryType) {
      verifyResults();
    }
  }, [ticketId, drawDate, lotteryType]);

  const verifyResults = async () => {
    if (!ticketId || !drawDate || !lotteryType) return;

    setLoading(true);
    try {
      const formattedDate = new Date(drawDate).toISOString().split('T')[0];
      const drawNumber = await findDrawNumberByDate(lotteryType, formattedDate);
      
      if (!drawNumber) {
        toast({
          title: "Sorteio não encontrado",
          description: "Não foi possível encontrar o sorteio para a data informada.",
          variant: "destructive",
        });
        return;
      }

      const result = await checkTicketResult(ticketId, drawNumber);
      if (result) {
        setResults([result]);
        onResult?.({
          hits: result.hits,
          prize: result.prize,
          winningNumbers: result.matchedNumbers
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className={cn("h-6 w-6 animate-spin", textColorClass)} />
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Nenhum resultado encontrado.</p>
        <p className="text-sm">Aguarde o sorteio ou verifique a data do bolão.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {results.map((result) => (
        <Card key={result.id} className={cn("overflow-hidden border", borderColorClass)}>
          <CardHeader className="bg-muted pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className={cn(
                "text-lg font-medium flex items-center gap-2",
                textColorClass
              )}>
                Bilhete {result.ticketNumber}
                {result.hits >= 4 && <Trophy className="h-5 w-5 text-yellow-500" />}
              </CardTitle>
              <Badge 
                variant={result.prize > 0 ? "default" : "outline"} 
                className={cn(
                  result.prize > 0 && baseColorClass + " text-white"
                )}
              >
                {result.hits} acertos
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Números do Bilhete */}
              <div>
                <h3 className={cn("text-sm font-medium mb-3", textColorClass)}>
                  Seus Números
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.numbers.map((number) => (
                    <Badge
                      key={number}
                      variant={result.matchedNumbers.includes(number) ? "default" : "outline"}
                      className={cn(
                        "h-10 w-10 rounded-full text-base font-bold flex items-center justify-center",
                        result.matchedNumbers.includes(number) && baseColorClass + " text-white",
                        !result.matchedNumbers.includes(number) && borderColorClass
                      )}
                    >
                      {number.toString().padStart(2, '0')}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Números Sorteados */}
              <div>
                <h3 className={cn("text-sm font-medium mb-3", textColorClass)}>
                  Números Acertados
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.matchedNumbers.map((number) => (
                    <Badge
                      key={number}
                      variant="outline"
                      className={cn(
                        "h-10 w-10 rounded-full text-base font-bold flex items-center justify-center",
                        borderColorClass
                      )}
                    >
                      {number.toString().padStart(2, '0')}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Resultado */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Acertos</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    result.hits >= 4 ? textColorClass : "text-muted-foreground"
                  )}>
                    {result.hits}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prêmio</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    result.prize > 0 ? "text-green-500" : "text-muted-foreground"
                  )}>
                    {formatCurrency(result.prize)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 