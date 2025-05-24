import { LotteryType } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getLotteryColor, getRequiredNumbersCount } from '@/lib/lottery';

interface LotteryNumbersProps {
  type: LotteryType;
  numbers: number[];
  winningNumbers?: number[];
  className?: string;
}

export function LotteryNumbers({ type, numbers, winningNumbers, className }: LotteryNumbersProps) {
  const baseColorClass = getLotteryColor(type);
  const numbersPerGame = getRequiredNumbersCount(type);
  
  // Divide os números em jogos
  const games = [];
  for (let i = 0; i < numbers.length; i += numbersPerGame) {
    games.push(numbers.slice(i, i + numbersPerGame));
  }

  if (!numbers || numbers.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        Nenhum número selecionado
      </div>
    );
  }

  // Helper para determinar a cor do número
  const getNumberColorClasses = (isWinning: boolean) => {
    if (winningNumbers && winningNumbers.length > 0) {
      return isWinning
        ? baseColorClass + " text-white"
        : "border-2 " + baseColorClass.replace('bg-', 'border-').replace('-600', '-200') + " text-gray-700 bg-white";
    }
    // Se NÃO houver winningNumbers, todas as bolas são coloridas
    return baseColorClass + " text-white";
  };

  return (
    <div className={cn("space-y-3", className)}>
      {games.map((game, gameIndex) => (
        <div key={gameIndex} className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground w-6">
            {(gameIndex + 1).toString().padStart(2, '0')}
          </span>
          <div className="flex flex-wrap gap-2">
            {game.map((number, numberIndex) => {
              const isWinning = winningNumbers?.includes(number);
              const colorClasses = getNumberColorClasses(!!isWinning);
              
              return (
                <Badge
                  key={`${gameIndex}-${numberIndex}`}
                  variant="outline"
                  className={cn(
                    "h-8 w-8 rounded-full text-base font-bold flex items-center justify-center transition-colors duration-200",
                    colorClasses
                  )}
                >
                  {number.toString().padStart(2, '0')}
                </Badge>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
