import { LotteryResult as LotteryResultType } from '@/types';
import { LotteryNumbers } from '../lottery/LotteryNumbers';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { getLotteryName, getLotteryColor } from '@/lib/lottery';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

type LotteryResultCardProps = {
  result: LotteryResultType;
};

export default function LotteryResultCard({ result }: LotteryResultCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  if (!result) {
    return null;
  }

  // Ensure all required properties are present
  if (!result.lotteryType || !result.drawNumber || !result.drawDate || !result.numbers) {
    console.error('Missing required properties in lottery result:', result);
    return null;
  }

  const baseColorClass = getLotteryColor(result.lotteryType);
  const textColorClass = baseColorClass.replace('bg-', 'text-').replace('-600', '-700');
  const borderColorClass = baseColorClass.replace('bg-', 'border-').replace('-600', '-500');
  
  // Formata a data para exibição (DD/MM/YYYY)
  const formattedDate = new Date(result.drawDate).toLocaleDateString('pt-BR');
  
  // Encontra o maior prêmio
  const maxPrize = result.prizes?.length > 0 
    ? Math.max(...result.prizes.map(p => p.prize))
    : 0;
  
  return (
    <Card className="border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            {getLotteryName(result.lotteryType)}
            {maxPrize > 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
          </CardTitle>
          <Badge variant="outline">
            Concurso {result.drawNumber}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <LotteryNumbers 
            type={result.lotteryType} 
            numbers={result.numbers} 
            winningNumbers={result.numbers} 
          />
          
          <div className="text-center">
            {result.accumulated ? (
              <div className="space-y-1">
                <p className="text-lg font-medium">Acumulou!</p>
                {result.nextPrize && result.nextPrize > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Próximo prêmio estimado em {formatCurrency(result.nextPrize)}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-lg font-medium text-green-600">
                  {result.winners} {result.winners === 1 ? 'ganhador' : 'ganhadores'}
                </p>
                {maxPrize > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Prêmio total de {formatCurrency(maxPrize)}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Detalhes dos prêmios */}
          {showDetails && result.prizes && result.prizes.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              {result.prizes.map((prize, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "h-6 min-w-[2.5rem]",
                        prize.winners > 0 && baseColorClass + " text-white",
                        !prize.winners && borderColorClass
                      )}
                    >
                      {prize.hits}
                    </Badge>
                    <span className="text-muted-foreground">acertos</span>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-medium",
                      prize.winners > 0 ? "text-green-600" : "text-muted-foreground"
                    )}>
                      {prize.winners} {prize.winners === 1 ? 'ganhador' : 'ganhadores'}
                    </p>
                    {prize.winners > 0 && prize.prize > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(prize.prize / prize.winners)} cada
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full"
          >
            {showDetails ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Ocultar Detalhes
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Ver Detalhes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
