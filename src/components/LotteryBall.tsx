import { LotteryType } from '@/types';
import { getLotteryColor } from '@/lib/lottery';
import { cn } from '@/lib/utils';

interface LotteryBallProps {
  number: number;
  lotteryType: LotteryType;
  isMatched?: boolean;
  className?: string;
}

export const LotteryBall: React.FC<LotteryBallProps> = ({ 
  number, 
  lotteryType,
  isMatched = false,
  className
}) => {
  const baseColorClass = getLotteryColor(lotteryType);
  const colorClasses = isMatched 
    ? baseColorClass + " text-white"
    : baseColorClass.replace('bg-', 'border-').replace('-600', '-200') + " border-2 text-gray-700";

  return (
    <div 
      className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors duration-200",
        colorClasses,
        className
      )}
      title={isMatched ? "Número acertado!" : undefined}
    >
      {number.toString().padStart(2, '0')}
    </div>
  );
}; 