import { LotteryType } from '@/types';
import { LotteryNumbers } from './LotteryNumbers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FavoriteTicketButton } from './FavoriteTicketButton';
import { Button } from '@/components/ui/button';
import { Search, Trophy } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TicketResults } from './TicketResults';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { getLotteryColor } from '@/lib/lottery';

type LotteryTicketProps = {
  id: string;
  type: LotteryType;
  numbers: number[];
  ticketNumber: string;
  poolId?: string;
  drawDate?: string;
  className?: string;
  onFavoriteChange?: () => void;
};

export default function LotteryTicket({ 
  id, 
  type, 
  numbers, 
  ticketNumber,
  poolId,
  drawDate,
  className,
  onFavoriteChange 
}: LotteryTicketProps) {
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{
    hits: number;
    prize: number;
    winningNumbers: number[];
  } | null>(null);

  const baseColorClass = getLotteryColor(type);
  const textColorClass = baseColorClass.replace('bg-', 'text-').replace('-600', '-700');

  return (
    <>
      <Card className={cn("relative", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            Bilhete {ticketNumber}
            {result?.hits >= 4 && (
              <Trophy className="h-4 w-4 text-yellow-500" />
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {poolId && drawDate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowResults(true)}
                title="Verificar Resultados"
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
            <FavoriteTicketButton 
              ticketId={id}
              onFavorited={onFavoriteChange}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <LotteryNumbers 
              type={type} 
              numbers={numbers} 
              winningNumbers={result?.winningNumbers}
            />
          </div>
        </CardContent>
      </Card>

      {poolId && drawDate && (
        <Dialog open={showResults} onOpenChange={setShowResults}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className={textColorClass}>
                Verificar Resultados - Bilhete {ticketNumber}
              </DialogTitle>
            </DialogHeader>
            <TicketResults 
              poolId={poolId} 
              ticketId={id}
              drawDate={drawDate}
              lotteryType={type}
              onResult={(result) => {
                if (result.winningNumbers && Array.isArray(result.winningNumbers)) {
                  setResult({
                    hits: result.hits,
                    prize: result.prize,
                    winningNumbers: result.winningNumbers
                  });
                }
                setShowResults(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
