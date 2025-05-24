import { LotteryType } from '@/types';
import { LotteryBall } from './LotteryBall';
import { formatCurrency } from '@/lib/utils';
import { Trophy } from 'lucide-react';
import { getLotteryColor } from '@/lib/lottery';
import { cn } from '@/lib/utils';

interface TicketResultProps {
  ticketNumber: string;
  numbers: number[];
  matchedNumbers: number[];
  hits: number;
  prize: number;
  lotteryType: LotteryType;
}

export const TicketResult: React.FC<TicketResultProps> = ({
  ticketNumber,
  numbers,
  matchedNumbers,
  hits,
  prize,
  lotteryType
}) => {
  const baseColorClass = getLotteryColor(lotteryType);
  const textColorClass = baseColorClass.replace('bg-', 'text-').replace('-600', '-700');

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            Bilhete {ticketNumber}
            {hits >= 4 && <Trophy className="h-4 w-4 text-yellow-500" />}
          </h3>
          <p className={cn(
            "text-sm font-medium",
            hits >= 4 ? textColorClass : "text-muted-foreground"
          )}>
            {hits} {hits === 1 ? 'acerto' : 'acertos'}
          </p>
        </div>
        {prize > 0 && (
          <div className="text-right">
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(prize)}
            </p>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {matchedNumbers.map((number, index) => (
          <LotteryBall
            key={`${ticketNumber}-${number}-${index}`}
            number={number}
            lotteryType={lotteryType}
            isMatched={true}
          />
        ))}
      </div>
    </div>
  );
}; 