import { LotteryType } from '@/types';
import { cn } from '@/lib/utils';
import { getLotteryColor } from '@/lib/lottery';

type LotteryNumbersProps = {
  type: LotteryType;
  numbers: number[];
  className?: string;
};

export function LotteryNumbers({ type, numbers, className }: LotteryNumbersProps) {
  const baseColorClass = getLotteryColor(type);
  
  return (
    <div className={cn("flex flex-wrap gap-2 justify-center", className)}>
      {numbers && numbers.length > 0 ? (
        numbers.map((number, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-semibold",
              baseColorClass
            )}
          >
            {number}
          </div>
        ))
      ) : (
        <div className="text-center text-sm text-muted-foreground">
          Nenhum número selecionado
        </div>
      )}
    </div>
  );
}
